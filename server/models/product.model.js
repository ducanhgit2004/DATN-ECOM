import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    brand: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: "",
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    catName: {
      type: String,
      default: "",
    },
    catId: {
      type: String,
      default: "",
    },
    subCatId: {
      type: String,
      default: "",
    },
    subCat: {
      type: String,
      default: "",
    },
    subCatName: {
      type: String,
      default: "",
    },
    thirdsubCat: {
      type: String,
      default: "",
    },
    thirdsubCatName: {
      type: String,
      default: "",
    },
    thirdsubCatId: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    countInStock: {
      type: Number,
      required: true,
    },
    inventoryType: {
      type: String,
      enum: ["none", "size", "ram", "weight"],
      default: "none",
    },
    inventoryVariants: [
      {
        value: { type: String, required: true },
        stock: { type: Number, min: 0, default: 0 },
      },
    ],
    rating: {
      type: Number,
      required: true,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        userName: {
          type: String,
          default: "Customer",
        },
        userEmail: {
          type: String,
          default: "",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    bannerEnabled: {
      type: Boolean,
      default: false,
    },
    bannerImage: {
      type: String,
      default: "",
    },
    bannerSubtitle: {
      type: String,
      default: "",
      trim: true,
    },
    bannerTitle: {
      type: String,
      default: "",
      trim: true,
    },
    bannerPriceLabel: {
      type: String,
      default: "Starting at",
      trim: true,
    },
    bannerPriceText: {
      type: String,
      default: "",
      trim: true,
    },
    bannerButtonText: {
      type: String,
      default: "SHOP NOW",
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    productRam: [
      {
        type: String,
        default: null,
      },
    ],
    size: [
      {
        type: String,
        default: null,
      },
    ],
    productWeight: [
      {
        type: String,
        default: null,
      },
    ],
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
