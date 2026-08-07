import { Router } from "express";
import auth from "../middlewares/auth.js";
import { allowRoles } from "../middlewares/roles.js";
import {
  createSupportTicket,
  getAdminSupportTickets,
  getMySupportTickets,
  replyToSupportTicket,
  updateSupportTicketStatus,
} from "../controllers/support.controller.js";

const supportRouter = Router();

supportRouter.use(auth);
supportRouter.post("/tickets", createSupportTicket);
supportRouter.get("/tickets/my", getMySupportTickets);
supportRouter.get("/admin/tickets", allowRoles("ADMIN"), getAdminSupportTickets);
supportRouter.put("/admin/tickets/:ticketId/reply", allowRoles("ADMIN"), replyToSupportTicket);
supportRouter.put("/admin/tickets/:ticketId/status", allowRoles("ADMIN"), updateSupportTicketStatus);

export default supportRouter;
