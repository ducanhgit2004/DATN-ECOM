import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Provide name"],
    },

    email: {
      type: String,
      required: [true, "Provide email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Provide password"],
    },
    avatar: {
      type: String,
      default: "",
    },
    avatar_public_id: {
      type: String,
      default: "",
    },
    mobile: {
      type: Number,
      default: null,
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    address_details: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "address",
      },
    ],
    shopping_cart: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "cartProduct",
      },
    ],
    orderHistory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "order",
      },
    ],
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER", "SELLER"],
      default: "USER",
    },
    sellerApprovalStatus: {
      type: String,
      enum: ["not_applied", "pending", "approved", "rejected"],
      default: "not_applied",
      index: true,
    },
    storeName: {
      type: String,
      default: "",
    },
    storeDescription: {
      type: String,
      default: "",
    },
    storeLogo: {
      type: String,
      default: "",
    },
    storeCover: {
      type: String,
      default: "",
    },
    sellerRejectionReason: {
      type: String,
      default: "",
    },
    sellerReviewedAt: {
      type: Date,
      default: null,
    },
    sellerReviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    firebaseUid: {
      type: String,
      default: "",
      index: true,
    },
    refresh_token: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
