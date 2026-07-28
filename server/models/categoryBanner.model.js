import mongoose from "mongoose";

const categoryBannerSchema = mongoose.Schema(
  {
    image: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    buttonText: { type: String, trim: true, default: "BUY NOW" },
    textAlign: { type: String, enum: ["left", "right"], default: "left" },
    placement: {
      type: String,
      enum: [
        "hero-side",
        "category-slider",
        "latest-products",
        "featured-products",
      ],
      default: "category-slider",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("CategoryBanner", categoryBannerSchema);
