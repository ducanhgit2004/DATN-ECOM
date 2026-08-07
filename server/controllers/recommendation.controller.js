import mongoose from "mongoose";
import CartProductModel from "../models/cartproduct.model.js";
import MyListModel from "../models/myList.model.js";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import ProductInteractionModel from "../models/productInteraction.model.js";

const addWeight = (map, key, amount) => {
  if (key) map.set(String(key), (map.get(String(key)) || 0) + amount);
};

export const trackProductView = async (request, response) => {
  try {
    if (!request.userId)
      return response.json({ message: "Guest view stored locally", error: false, success: true });
    if (!mongoose.isValidObjectId(request.params.productId))
      return response.status(400).json({ message: "Invalid product", error: true, success: false });
    const exists = await ProductModel.exists({ _id: request.params.productId });
    if (!exists)
      return response.status(404).json({ message: "Product not found", error: true, success: false });
    await ProductInteractionModel.findOneAndUpdate(
      { userId: request.userId, productId: request.params.productId },
      { $inc: { views: 1 }, $set: { lastViewedAt: new Date() } },
      { upsert: true },
    );
    return response.json({ message: "Product view recorded", error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const getRecommendations = async (request, response) => {
  try {
    const limit = Math.min(24, Math.max(6, Number(request.query.limit) || 12));
    const guestIds = String(request.query.recent || "")
      .split(",")
      .filter((id) => mongoose.isValidObjectId(id))
      .slice(0, 20);
    const weights = new Map();

    guestIds.forEach((id, index) => addWeight(weights, id, Math.max(1, 5 - index * 0.25)));

    if (request.userId) {
      const [views, cart, wishlist, orders] = await Promise.all([
        ProductInteractionModel.find({ userId: request.userId })
          .sort({ lastViewedAt: -1 })
          .limit(30)
          .lean(),
        CartProductModel.find({ userId: request.userId }).lean(),
        MyListModel.find({ userId: request.userId }).lean(),
        OrderModel.find({
          userId: request.userId,
          orderStatus: { $ne: "cancelled" },
        })
          .sort({ createdAt: -1 })
          .limit(20)
          .select("items")
          .lean(),
      ]);
      views.forEach((item, index) =>
        addWeight(weights, item.productId, Math.min(8, 2 + item.views * 0.5) * Math.max(0.35, 1 - index * 0.025)),
      );
      cart.forEach((item) => addWeight(weights, item.productId, 7));
      wishlist.forEach((item) => addWeight(weights, item.productId, 5));
      orders.forEach((order) =>
        order.items.forEach((item) => addWeight(weights, item.productId, 9 * Number(item.quantity || 1))),
      );
    }

    const sourceIds = [...weights.keys()].filter((id) => mongoose.isValidObjectId(id));
    const sourceProducts = await ProductModel.find({ _id: { $in: sourceIds } })
      .select("catId category brand sellerId price")
      .lean();
    const categories = new Map();
    const brands = new Map();
    const sellers = new Map();
    let preferredPriceTotal = 0;
    let preferredPriceWeight = 0;

    sourceProducts.forEach((product) => {
      const weight = weights.get(String(product._id)) || 1;
      addWeight(categories, product.catId || product.category, weight);
      addWeight(brands, product.brand?.toLowerCase(), weight);
      addWeight(sellers, product.sellerId, weight);
      preferredPriceTotal += Number(product.price || 0) * weight;
      preferredPriceWeight += weight;
    });

    const candidates = await ProductModel.find({
      countInStock: { $gt: 0 },
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    }).lean();
    const averagePrice = preferredPriceWeight ? preferredPriceTotal / preferredPriceWeight : 0;
    const scored = candidates.map((product) => {
      const categoryScore = categories.get(String(product.catId || product.category)) || 0;
      const brandScore = brands.get(String(product.brand || "").toLowerCase()) || 0;
      const sellerScore = sellers.get(String(product.sellerId || "")) || 0;
      const priceScore = averagePrice
        ? Math.max(0, 3 - (Math.abs(Number(product.price) - averagePrice) / averagePrice) * 3)
        : 0;
      const freshness = Math.max(0, 2 - (Date.now() - new Date(product.createdAt).getTime()) / 864000000);
      const score =
        categoryScore * 3 +
        brandScore * 2 +
        sellerScore +
        priceScore +
        Number(product.rating || 0) +
        (product.isFeatured ? 1.5 : 0) +
        freshness;
      let reason = "Popular for you";
      if (categoryScore) reason = `Because you like ${product.catName || "this category"}`;
      else if (brandScore) reason = `Because you viewed ${product.brand}`;
      return { product, score, reason };
    });

    scored.sort((a, b) => b.score - a.score || new Date(b.product.createdAt) - new Date(a.product.createdAt));
    const data = scored.slice(0, limit).map(({ product, reason }) => ({ ...product, recommendationReason: reason }));
    return response.json({
      data,
      personalized: sourceProducts.length > 0,
      message: sourceProducts.length ? "Personalized recommendations" : "Popular recommendations",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({ message: error.message, error: true, success: false });
  }
};
