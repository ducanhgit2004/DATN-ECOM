import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import OrderModel from "../models/order.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const requireApprovedSeller = async (userId) => {
  const seller = await UserModel.findById(userId).select(
    "role status sellerApprovalStatus storeName",
  );
  if (
    !seller ||
    seller.role !== "SELLER" ||
    seller.status !== "Active" ||
    seller.sellerApprovalStatus !== "approved"
  ) {
    throw Object.assign(new Error("An approved seller account is required"), {
      status: 403,
    });
  }
  return seller;
};

const sendError = (response, error, fallback) =>
  response.status(error.status || 500).json({
    message: error.message || fallback,
    error: true,
    success: false,
  });

export async function getPublicStore(request, response) {
  try {
    if (!mongoose.isValidObjectId(request.params.sellerId)) {
      return response.status(404).json({
        message: "Store not found",
        error: true,
        success: false,
      });
    }
    const seller = await UserModel.findOne({
      _id: request.params.sellerId,
      role: "SELLER",
      status: "Active",
      sellerApprovalStatus: "approved",
    }).select("storeName storeDescription storeLogo storeCover createdAt");
    if (!seller) {
      return response.status(404).json({
        message: "Store not found",
        error: true,
        success: false,
      });
    }
    const products = await ProductModel.find({ sellerId: seller._id })
      .sort({ createdAt: -1 })
      .populate("category");
    return response.json({
      data: {
        store: seller,
        products,
        productCount: products.length,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to load store");
  }
}

export async function searchPublicStores(request, response) {
  try {
    const query = String(request.query.q || "").trim();
    if (query.length < 2) {
      return response.json({ data: [], error: false, success: true });
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    const stores = await UserModel.find({
      role: "SELLER",
      status: "Active",
      sellerApprovalStatus: "approved",
      $or: [{ storeName: pattern }, { storeDescription: pattern }],
    })
      .select("storeName storeDescription storeLogo storeCover createdAt")
      .sort({ storeName: 1 })
      .limit(12)
      .lean();
    const counts = await ProductModel.aggregate([
      { $match: { sellerId: { $in: stores.map((store) => store._id) } } },
      { $group: { _id: "$sellerId", productCount: { $sum: 1 } } },
    ]);
    const countBySeller = new Map(
      counts.map((item) => [String(item._id), item.productCount]),
    );
    return response.json({
      data: stores.map((store) => ({
        ...store,
        productCount: countBySeller.get(String(store._id)) || 0,
      })),
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to search stores");
  }
}

export async function getSellerDashboard(request, response) {
  try {
    const seller = await requireApprovedSeller(request.userId);
    const sellerId = new mongoose.Types.ObjectId(request.userId);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const trendStart = new Date(today);
    trendStart.setUTCDate(trendStart.getUTCDate() - 6);
    const [
      productCount,
      inventory,
      lowStockCount,
      orderStats,
      todayStats,
      processingOrders,
      ratingStats,
      topProducts,
      revenueByDay,
      recentOrders,
    ] = await Promise.all([
      ProductModel.countDocuments({ sellerId }),
      ProductModel.aggregate([
        { $match: { sellerId } },
        { $group: { _id: null, stock: { $sum: "$countInStock" } } },
      ]),
      ProductModel.countDocuments({
        sellerId,
        countInStock: { $lte: 5 },
      }),
      OrderModel.aggregate([
        { $unwind: "$items" },
        { $match: { "items.sellerId": sellerId } },
        {
          $group: {
            _id: null,
            orderIds: { $addToSet: "$_id" },
            revenue: {
              $sum: {
                $cond: [
                  { $ne: ["$orderStatus", "cancelled"] },
                  "$items.subTotal",
                  0,
                ],
              },
            },
          },
        },
      ]),
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
            orderStatus: { $ne: "cancelled" },
            "items.sellerId": sellerId,
          },
        },
        { $unwind: "$items" },
        { $match: { "items.sellerId": sellerId } },
        {
          $group: {
            _id: null,
            orderIds: { $addToSet: "$_id" },
            revenue: { $sum: "$items.subTotal" },
          },
        },
      ]),
      OrderModel.countDocuments({
        "items.sellerId": sellerId,
        orderStatus: { $in: ["pending", "confirmed", "processing"] },
      }),
      ProductModel.aggregate([
        { $match: { sellerId } },
        { $unwind: "$reviews" },
        {
          $group: {
            _id: null,
            average: { $avg: "$reviews.rating" },
            count: { $sum: 1 },
          },
        },
      ]),
      OrderModel.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $match: { "items.sellerId": sellerId } },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            image: { $first: "$items.image" },
            units: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.subTotal" },
          },
        },
        { $sort: { units: -1, revenue: -1 } },
        { $limit: 5 },
      ]),
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: trendStart },
            orderStatus: { $ne: "cancelled" },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.sellerId": sellerId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$items.subTotal" },
            orderIds: { $addToSet: "$_id" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      OrderModel.find({ "items.sellerId": sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderId customer items orderStatus paymentStatus createdAt")
        .lean(),
    ]);
    const revenueMap = new Map(
      revenueByDay.map((item) => [
        item._id,
        { revenue: item.revenue, orders: item.orderIds.length },
      ]),
    );
    const trend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(trendStart);
      date.setUTCDate(date.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      return {
        date: key,
        revenue: revenueMap.get(key)?.revenue || 0,
        orders: revenueMap.get(key)?.orders || 0,
      };
    });
    const scopedRecentOrders = recentOrders.map((order) => {
      const items = order.items.filter(
        (item) => String(item.sellerId) === String(sellerId),
      );
      return {
        _id: order._id,
        orderId: order.orderId,
        customerName: order.customer?.name || "Customer",
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        total: items.reduce((sum, item) => sum + item.subTotal, 0),
      };
    });
    return response.json({
      data: {
        storeName: seller.storeName,
        products: productCount,
        stock: inventory[0]?.stock || 0,
        lowStock: lowStockCount,
        orders: orderStats[0]?.orderIds?.length || 0,
        revenue: orderStats[0]?.revenue || 0,
        todayOrders: todayStats[0]?.orderIds?.length || 0,
        todayRevenue: todayStats[0]?.revenue || 0,
        processingOrders,
        averageRating: ratingStats[0]?.average || 0,
        reviewCount: ratingStats[0]?.count || 0,
        revenueTrend: trend,
        topProducts,
        recentOrders: scopedRecentOrders,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to load seller dashboard");
  }
}

export async function getSellerProducts(request, response) {
  try {
    await requireApprovedSeller(request.userId);
    const products = await ProductModel.find({ sellerId: request.userId }).sort({
      createdAt: -1,
    });
    return response.json({ data: products, error: false, success: true });
  } catch (error) {
    return sendError(response, error, "Unable to load seller products");
  }
}

export async function uploadSellerProductImage(request, response) {
  const files = request.files || [];
  try {
    await requireApprovedSeller(request.userId);
    if (!files.length) {
      return response.status(400).json({
        message: "Please select at least one image",
        error: true,
        success: false,
      });
    }
    if (files.some((file) => !file.mimetype?.startsWith("image/"))) {
      return response.status(400).json({
        message: "Only image files are allowed",
        error: true,
        success: false,
      });
    }
    const uploaded = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `novacart/sellers/${request.userId}/products`,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      });
      uploaded.push({ url: result.secure_url, publicId: result.public_id });
    }
    return response.json({
      data: uploaded,
      images: uploaded.map((item) => item.url),
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to upload product image");
  } finally {
    await Promise.all(
      files.map((file) => fs.promises.unlink(file.path).catch(() => {})),
    );
  }
}

export async function createSellerProduct(request, response) {
  try {
    await requireApprovedSeller(request.userId);
    const {
      name,
      description,
      images,
      brand = "",
      price,
      oldPrice = 0,
      countInStock,
      discount = 0,
      catName = "",
      catId = "",
      subCat = "",
      subCatName = "",
      subCatId = "",
      thirdsubCat = "",
      thirdsubCatName = "",
      thirdsubCatId = "",
      category = null,
      rating = 0,
      isFeatured = false,
      productRam = [],
      size = [],
      productWeight = [],
      inventoryType = "none",
      inventoryVariants = [],
    } = request.body || {};
    if (!name?.trim() || !description?.trim() || !Array.isArray(images) || !images.length) {
      return response.status(400).json({
        message: "Product name, description, and at least one image are required",
        error: true,
        success: false,
      });
    }
    if (Number(price) < 0 || Number(countInStock) < 0) {
      return response.status(400).json({
        message: "Price and stock must be valid non-negative numbers",
        error: true,
        success: false,
      });
    }
    const normalizedInventoryType = ["size", "ram", "weight"].includes(inventoryType)
      ? inventoryType
      : "none";
    const normalizedVariants = normalizedInventoryType === "none"
      ? []
      : (Array.isArray(inventoryVariants) ? inventoryVariants : [])
          .filter((item) => item?.value)
          .map((item) => ({
            value: String(item.value),
            stock: Math.max(0, Number(item.stock) || 0),
          }));
    const normalizedStock = normalizedInventoryType === "none"
      ? Math.max(0, Number(countInStock) || 0)
      : normalizedVariants.reduce((sum, item) => sum + item.stock, 0);
    const product = await ProductModel.create({
      sellerId: request.userId,
      name: name.trim(),
      description: description.trim(),
      images: images.map(String).filter(Boolean),
      brand: String(brand).trim(),
      price: Number(price),
      oldPrice: Number(oldPrice) || 0,
      catName: String(catName).trim(),
      catId: String(catId),
      subCat,
      subCatName,
      subCatId,
      thirdsubCat,
      thirdsubCatName,
      thirdsubCatId,
      category: mongoose.isValidObjectId(category || catId) ? category || catId : undefined,
      countInStock: normalizedStock,
      inventoryType: normalizedInventoryType,
      inventoryVariants: normalizedVariants,
      rating: Number(rating) || 0,
      discount: Number(discount) || 0,
      isFeatured: Boolean(isFeatured),
      bannerEnabled: false,
      bannerImage: "",
      bannerSubtitle: "",
      bannerTitle: "",
      bannerPriceText: "",
      productRam: Array.isArray(productRam) ? productRam : [],
      size: Array.isArray(size) ? size : [],
      productWeight: Array.isArray(productWeight) ? productWeight : [],
    });
    return response.status(201).json({
      message: "Product created",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to create product");
  }
}

export async function updateSellerProduct(request, response) {
  try {
    await requireApprovedSeller(request.userId);
    const allowed = [
      "name", "description", "images", "brand", "price", "oldPrice",
      "countInStock", "discount", "catName", "catId", "subCat", "subCatName",
      "subCatId", "thirdsubCat", "thirdsubCatName", "thirdsubCatId",
      "category", "rating", "isFeatured", "productRam", "size", "productWeight",
      "inventoryType", "inventoryVariants",
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (request.body?.[key] !== undefined) updates[key] = request.body[key];
    });
    if (updates.inventoryType !== undefined) {
      updates.inventoryType = ["size", "ram", "weight"].includes(updates.inventoryType)
        ? updates.inventoryType
        : "none";
      updates.inventoryVariants = updates.inventoryType === "none"
        ? []
        : (Array.isArray(updates.inventoryVariants) ? updates.inventoryVariants : [])
            .filter((item) => item?.value)
            .map((item) => ({
              value: String(item.value),
              stock: Math.max(0, Number(item.stock) || 0),
            }));
      if (updates.inventoryType !== "none") {
        updates.countInStock = updates.inventoryVariants.reduce(
          (sum, item) => sum + item.stock,
          0,
        );
      }
    }
    const product = await ProductModel.findOneAndUpdate(
      { _id: request.params.productId, sellerId: request.userId },
      updates,
      { new: true, runValidators: true },
    );
    if (!product) {
      return response.status(404).json({
        message: "Product not found or does not belong to this seller",
        error: true,
        success: false,
      });
    }
    return response.json({
      message: "Product updated",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to update product");
  }
}

export async function deleteSellerProduct(request, response) {
  try {
    await requireApprovedSeller(request.userId);
    const product = await ProductModel.findOneAndDelete({
      _id: request.params.productId,
      sellerId: request.userId,
    });
    if (!product) {
      return response.status(404).json({
        message: "Product not found or does not belong to this seller",
        error: true,
        success: false,
      });
    }
    return response.json({
      message: "Product deleted",
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to delete product");
  }
}

export async function getSellerOrders(request, response) {
  try {
    await requireApprovedSeller(request.userId);
    const sellerId = new mongoose.Types.ObjectId(request.userId);
    const orders = await OrderModel.find({ "items.sellerId": sellerId })
      .sort({ createdAt: -1 })
      .lean();
    const scoped = orders.map((order) => {
      const items = order.items.filter(
        (item) => String(item.sellerId) === String(request.userId),
      );
      return {
        ...order,
        items,
        sellerTotal: items.reduce((sum, item) => sum + item.subTotal, 0),
      };
    });
    return response.json({ data: scoped, error: false, success: true });
  } catch (error) {
    return sendError(response, error, "Unable to load seller orders");
  }
}

export async function getSellerReviews(request, response) {
  try {
    await requireApprovedSeller(request.userId);
    const products = await ProductModel.find({
      sellerId: request.userId,
      "reviews.0": { $exists: true },
    }).select("name images reviews");
    const reviews = products
      .flatMap((product) =>
        product.reviews.map((review) => ({
          ...review.toObject(),
          userEmail: undefined,
          productId: product._id,
          productName: product.name,
          productImage: product.images?.[0] || "",
        })),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const ratingTotal = reviews.reduce((sum, review) => sum + review.rating, 0);
    const distribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    }));
    return response.json({
      data: {
        reviews,
        summary: {
          total: reviews.length,
          average: reviews.length ? ratingTotal / reviews.length : 0,
          distribution,
        },
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to load seller reviews");
  }
}

export async function getSellerStore(request, response) {
  try {
    const seller = await requireApprovedSeller(request.userId);
    const profile = await UserModel.findById(seller._id).select(
      "storeName storeDescription storeLogo storeCover name email",
    );
    return response.json({ data: profile, error: false, success: true });
  } catch (error) {
    return sendError(response, error, "Unable to load store profile");
  }
}

export async function updateSellerStore(request, response) {
  try {
    await requireApprovedSeller(request.userId);
    const storeName = String(request.body?.storeName || "").trim();
    if (!storeName) {
      return response.status(400).json({
        message: "Store name is required",
        error: true,
        success: false,
      });
    }
    const seller = await UserModel.findByIdAndUpdate(
      request.userId,
      {
        storeName,
        storeDescription: String(request.body?.storeDescription || "").trim(),
        storeLogo: String(request.body?.storeLogo || ""),
        storeCover: String(request.body?.storeCover || ""),
      },
      { new: true, runValidators: true },
    ).select("storeName storeDescription storeLogo storeCover name email");
    return response.json({
      message: "Store profile updated",
      data: seller,
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to update store profile");
  }
}

export async function uploadSellerStoreImage(request, response) {
  const file = request.file;
  try {
    await requireApprovedSeller(request.userId);
    if (!file?.mimetype?.startsWith("image/")) {
      return response.status(400).json({
        message: "Please select a valid image",
        error: true,
        success: false,
      });
    }
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `novacart/sellers/${request.userId}/store`,
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
    });
    return response.json({
      data: { url: result.secure_url, publicId: result.public_id },
      error: false,
      success: true,
    });
  } catch (error) {
    return sendError(response, error, "Unable to upload store image");
  } finally {
    if (file?.path) await fs.promises.unlink(file.path).catch(() => {});
  }
}
