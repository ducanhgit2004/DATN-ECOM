import mongoose from "mongoose";
import SupportTicketModel from "../models/supportTicket.model.js";

const clean = (value) => String(value || "").trim();

export async function createSupportTicket(request, response) {
  try {
    const subject = clean(request.body?.subject);
    const message = clean(request.body?.message);
    const allowedCategories = ["order", "payment", "delivery", "return", "account", "product", "other"];
    const category = allowedCategories.includes(request.body?.category)
      ? request.body.category
      : "other";
    if (subject.length < 5 || subject.length > 160) {
      return response.status(400).json({ message: "Subject must contain between 5 and 160 characters.", error: true, success: false });
    }
    if (message.length < 10 || message.length > 3000) {
      return response.status(400).json({ message: "Message must contain between 10 and 3000 characters.", error: true, success: false });
    }
    const ticket = await SupportTicketModel.create({
      userId: request.userId,
      category,
      subject,
      message,
    });
    return response.status(201).json({
      message: "Your support request has been sent.",
      data: ticket,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to send support request.", error: true, success: false });
  }
}

export async function getMySupportTickets(request, response) {
  try {
    const tickets = await SupportTicketModel.find({ userId: request.userId })
      .sort({ updatedAt: -1 })
      .lean();
    return response.json({ data: tickets, error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to load support requests.", error: true, success: false });
  }
}

export async function getAdminSupportTickets(request, response) {
  try {
    const tickets = await SupportTicketModel.find()
      .populate("userId", "name email")
      .populate("repliedBy", "name email")
      .sort({ status: 1, updatedAt: -1 })
      .lean();
    return response.json({ data: tickets, total: tickets.length, error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to load support requests.", error: true, success: false });
  }
}

export async function replyToSupportTicket(request, response) {
  try {
    if (!mongoose.isValidObjectId(request.params.ticketId)) {
      return response.status(400).json({ message: "Invalid ticket id.", error: true, success: false });
    }
    const reply = clean(request.body?.reply);
    if (reply.length < 2 || reply.length > 3000) {
      return response.status(400).json({ message: "Reply must contain between 2 and 3000 characters.", error: true, success: false });
    }
    const ticket = await SupportTicketModel.findByIdAndUpdate(
      request.params.ticketId,
      {
        adminReply: reply,
        repliedAt: new Date(),
        repliedBy: request.userId,
        status: "answered",
      },
      { new: true },
    ).populate("userId", "name email");
    if (!ticket) {
      return response.status(404).json({ message: "Support request not found.", error: true, success: false });
    }
    return response.json({ message: "Reply sent successfully.", data: ticket, error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to reply.", error: true, success: false });
  }
}

export async function updateSupportTicketStatus(request, response) {
  try {
    const status = request.body?.status;
    if (!["open", "answered", "closed"].includes(status)) {
      return response.status(400).json({ message: "Invalid ticket status.", error: true, success: false });
    }
    const ticket = await SupportTicketModel.findByIdAndUpdate(
      request.params.ticketId,
      { status },
      { new: true },
    ).populate("userId", "name email");
    if (!ticket) {
      return response.status(404).json({ message: "Support request not found.", error: true, success: false });
    }
    return response.json({ message: "Status updated successfully.", data: ticket, error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to update status.", error: true, success: false });
  }
}
