import mongoose from "mongoose";
import MyListModel from "../models/myList.model.js";
import ProductModel from "../models/product.model.js";

const serializeMyListItem = (item) => {
  const product = item.productId;
  return {
    _id: item._id,
    userId: item.userId,
    productId: product._id,
    productTitle: product.name,
    image: product.images?.[0] || "",
    rating: product.rating,
    price: product.price,
    oldPrice: product.oldPrice,
    brand: product.brand || product.catName || "Product",
    discount: product.discount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const addToMyListController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId } = request.body;

    if (!mongoose.isValidObjectId(productId)) {
      return response.status(400).json({
        message: "Invalid productId",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.findOne({
      _id: productId,
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    }).select("_id");

    if (!product) {
      return response.status(404).json({
        message: "Product not found or unavailable",
        error: true,
        success: false,
      });
    }

    const item = await MyListModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (item) {
      return response.status(400).json({
        message: "Item already in my list",
      });
    }

    const myList = new MyListModel({
      productId,
      userId,
    });

    await myList.save();

    return response.status(200).json({
      error: false,
      success: true,
      message: "The product saved in my list",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({
        message: "Item already in my list",
        error: true,
        success: false,
      });
    }
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteToMyListController = async (request, response) => {
  try {
    const myListItem = await MyListModel.findOne({
      _id: request.params.id,
      userId: request.userId,
    });

    if (!myListItem) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "The item with this given id was not found",
      });
    }

    const deletedItem = await MyListModel.findOneAndDelete({
      _id: request.params.id,
      userId: request.userId,
    });

    if (!deletedItem) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "The item is not deleted",
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      message: "The item removed from My List",
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getMyListController = async (request, response) => {
  try {
    const userId = request.userId;
    const myListItems = await MyListModel.find({
      userId: userId,
    }).populate({
      path: "productId",
      match: {
        approvalStatus: { $nin: ["pending", "rejected"] },
        saleStatus: { $ne: "discontinued" },
      },
    });

    return response.status(200).json({
      error: false,
      success: true,
      data: myListItems.filter((item) => item.productId).map(serializeMyListItem),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
