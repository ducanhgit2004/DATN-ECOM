import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    productName: { type: String, default: "" },
    productImage: { type: String, default: "" },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    unreadCustomer: { type: Number, default: 0, min: 0 },
    unreadSeller: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

conversationSchema.index({ customerId: 1, sellerId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Conversation", conversationSchema);
