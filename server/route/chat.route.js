import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  createConversation,
  getConversations,
  getMessages,
  getUnreadCount,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = Router();
router.use(auth);
router.get("/unread-count", getUnreadCount);
router.get("/conversations", getConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", sendMessage);

export default router;
