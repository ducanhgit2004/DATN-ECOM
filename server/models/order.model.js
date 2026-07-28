import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, default: "" },
    subTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    address_line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true },
    mobile: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: { type: String, required: true, unique: true, index: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(items) => items.length > 0, "Order must contain at least one item"],
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    deliveryAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    deliveryAddress: { type: addressSnapshotSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "RAZORPAY", "PAYPAL"],
      default: "COD",
    },
    razorpayOrderId: { type: String, default: "", index: true },
    paypalOrderId: { type: String, default: "", index: true },
    currency: { type: String, default: "USD" },
    paymentId: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    subTotalAmt: { type: Number, required: true, min: 0 },
    shippingAmt: { type: Number, default: 0, min: 0 },
    totalAmt: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;
