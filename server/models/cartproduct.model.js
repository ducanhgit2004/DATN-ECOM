import mongoose from "mongoose";

const cartProduct = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    size: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const CartProductModel = mongoose.model("cartProduct", cartProduct);

export default CartProductModel;
