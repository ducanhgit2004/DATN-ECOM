import mongoose from "mongoose";
import ConversationModel from "../models/conversation.model.js";
import MessageModel from "../models/message.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

const fail = (response, error, fallback) =>
  response.status(error.status || 500).json({
    message: error.message || fallback,
    error: true,
    success: false,
  });

const getParticipant = async (conversationId, userId) => {
  const conversation = await ConversationModel.findById(conversationId);
  if (!conversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });
  const isCustomer = String(conversation.customerId) === String(userId);
  const isSeller = String(conversation.sellerId) === String(userId);
  if (!isCustomer && !isSeller)
    throw Object.assign(new Error("You cannot access this conversation"), { status: 403 });
  return { conversation, isCustomer, isSeller };
};

const populateConversation = (query) =>
  query
    .populate("customerId", "name avatar")
    .populate("sellerId", "storeName storeLogo name")
    .populate("productId", "name images price");

export async function createConversation(request, response) {
  try {
    const { sellerId, productId = null } = request.body || {};
    const customer = await UserModel.findById(request.userId).select("role");
    if (customer?.role !== "USER")
      return response.status(403).json({ message: "Only customers can start a shop conversation", error: true, success: false });
    if (!mongoose.isValidObjectId(sellerId))
      return response.status(400).json({ message: "A valid seller is required", error: true, success: false });
    if (productId && !mongoose.isValidObjectId(productId))
      return response.status(400).json({ message: "Invalid product", error: true, success: false });
    if (String(sellerId) === String(request.userId))
      return response.status(400).json({ message: "You cannot chat with yourself", error: true, success: false });
    const seller = await UserModel.findOne({
      _id: sellerId, role: "SELLER", status: "Active", sellerApprovalStatus: "approved",
    });
    if (!seller) return response.status(404).json({ message: "Shop not found", error: true, success: false });
    let product = null;
    if (productId) {
      product = await ProductModel.findOne({ _id: productId, sellerId });
      if (!product) return response.status(404).json({ message: "Product not found in this shop", error: true, success: false });
    }
    const conversation = await ConversationModel.findOneAndUpdate(
      { customerId: request.userId, sellerId, productId: product?._id || null },
      {
        $setOnInsert: {
          customerId: request.userId,
          sellerId,
          productId: product?._id || null,
          productName: product?.name || "",
          productImage: product?.images?.[0] || "",
        },
      },
      { new: true, upsert: true },
    );
    const data = await populateConversation(ConversationModel.findById(conversation._id));
    return response.status(201).json({ data, error: false, success: true });
  } catch (error) {
    return fail(response, error, "Unable to start conversation");
  }
}

export async function getConversations(request, response) {
  try {
    const user = await UserModel.findById(request.userId).select("role");
    const filter = user?.role === "SELLER" ? { sellerId: request.userId } : { customerId: request.userId };
    const data = await populateConversation(
      ConversationModel.find(filter).sort({ lastMessageAt: -1 }),
    );
    return response.json({ data, role: user?.role, error: false, success: true });
  } catch (error) {
    return fail(response, error, "Unable to load conversations");
  }
}

export async function getMessages(request, response) {
  try {
    const { conversation, isCustomer } = await getParticipant(request.params.id, request.userId);
    const messages = await MessageModel.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .populate("senderId", "name storeName avatar storeLogo");
    await Promise.all([
      MessageModel.updateMany(
        { conversationId: conversation._id, senderId: { $ne: request.userId }, readAt: null },
        { readAt: new Date() },
      ),
      ConversationModel.updateOne(
        { _id: conversation._id },
        { [isCustomer ? "unreadCustomer" : "unreadSeller"]: 0 },
      ),
    ]);
    return response.json({ data: messages, error: false, success: true });
  } catch (error) {
    return fail(response, error, "Unable to load messages");
  }
}

export async function sendMessage(request, response) {
  try {
    const text = String(request.body?.text || "").trim();
    if (!text || text.length > 2000)
      return response.status(400).json({ message: "Message must contain 1-2000 characters", error: true, success: false });
    const { conversation, isCustomer } = await getParticipant(request.params.id, request.userId);
    const message = await MessageModel.create({
      conversationId: conversation._id,
      senderId: request.userId,
      text,
    });
    await ConversationModel.updateOne(
      { _id: conversation._id },
      {
        lastMessage: text,
        lastMessageAt: message.createdAt,
        $inc: { [isCustomer ? "unreadSeller" : "unreadCustomer"]: 1 },
      },
    );
    const data = await MessageModel.findById(message._id).populate(
      "senderId",
      "name storeName avatar storeLogo",
    );
    const io = request.app.get("io");
    io?.to(`user:${conversation.customerId}`).emit("chat:message", data);
    io?.to(`user:${conversation.sellerId}`).emit("chat:message", data);
    return response.status(201).json({ data, error: false, success: true });
  } catch (error) {
    return fail(response, error, "Unable to send message");
  }
}

export async function getUnreadCount(request, response) {
  try {
    const user = await UserModel.findById(request.userId).select("role");
    const seller = user?.role === "SELLER";
    const result = await ConversationModel.aggregate([
      { $match: seller ? { sellerId: new mongoose.Types.ObjectId(request.userId) } : { customerId: new mongoose.Types.ObjectId(request.userId) } },
      { $group: { _id: null, total: { $sum: seller ? "$unreadSeller" : "$unreadCustomer" } } },
    ]);
    return response.json({ data: { count: result[0]?.total || 0 }, error: false, success: true });
  } catch (error) {
    return fail(response, error, "Unable to load unread messages");
  }
}
