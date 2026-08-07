import mongoose from "mongoose";

const productInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    views: { type: Number, default: 1, min: 1 },
    lastViewedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

productInteractionSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model("ProductInteraction", productInteractionSchema);
