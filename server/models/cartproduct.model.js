import mongoose from "mongoose";

const cartProduct = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
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
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

cartProduct.index(
  { userId: 1, productId: 1, size: 1 },
  { unique: true },
);

const CartProductModel = mongoose.model("cartProduct", cartProduct);

export default CartProductModel;
