import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";

export const addToCartItemController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId, size, quantity = 1 } = request.body;

    if (!productId) {
      return response.status(400).json({
        message: "Provide productId",
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
      return response.status(409).json({
        message: "This product is no longer available",
        error: true,
        success: false,
      });
    }

    const normalizedSize = size ? String(size) : "";

    const existingCartItem = await CartProductModel.findOne({
      userId,
      productId,
      size: normalizedSize,
    });

    if (existingCartItem) {
      existingCartItem.quantity += Number(quantity) || 1;
      await existingCartItem.save();

      return response.status(200).json({
        data: existingCartItem,
        message: "Item quantity updated",
        error: false,
        success: true,
      });
    }

    const cartItem = new CartProductModel({
      quantity: Number(quantity) || 1,
      userId,
      productId,
      size: normalizedSize,
    });

    const save = await cartItem.save();

    await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          shopping_cart: productId,
        },
      },
    );

    return response.status(200).json({
      data: save,
      message: "Item add successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({
        message: "This product variant is already in the cart",
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

export const getCartItemController = async (request, response) => {
  try {
    const userId = request.userId;

    const cartItem = await CartProductModel.find({
      userId: userId,
    }).populate("productId");

    return response.json({
      data: cartItem,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const updateCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id, qty, size } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "provide _id",
      });
    }

    const updateData = {};
    if (qty !== undefined) {
      updateData.quantity = Number(qty) || 1;
    }
    if (size !== undefined) {
      updateData.size = size ? String(size) : "";
    }

    const updateCartitem = await CartProductModel.updateOne(
      {
        _id: _id,
        userId: userId,
      },
      updateData,
    );

    return response.json({
      message: "Update cart",
      success: true,
      error: false,
      data: updateCartitem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id, productId } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await CartProductModel.deleteOne({
      _id: _id,
      userId: userId,
    });

    if (!deleteCartItem) {
      return response.status(404).json({
        message: "The product in the cart is not found",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({
      _id: userId,
    });

    const cartItems = user?.shopping_cart;

    const updatedUserCart = [
      ...cartItems.slice(0, cartItems.indexOf(productId)),
      ...cartItems.slice(cartItems.indexOf(productId) + 1),
    ];

    user.shopping_cart = updatedUserCart;

    await user.save();

    return response.json({
      message: "Item remove",
      error: false,
      success: true,
      data: deleteCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
