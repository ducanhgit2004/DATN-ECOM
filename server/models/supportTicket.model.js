import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["order", "payment", "delivery", "return", "account", "product", "other"],
      default: "other",
    },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ["open", "answered", "closed"],
      default: "open",
      index: true,
    },
    adminReply: { type: String, default: "", trim: true, maxlength: 3000 },
    repliedAt: { type: Date, default: null },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export default mongoose.model("SupportTicket", supportTicketSchema);
