import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  createOrderController,
  createPaypalOrderController,
  createRazorpayOrderController,
  getMyOrderController,
  getMyOrdersController,
  getAdminOrdersController,
  getAdminDashboardStatsController,
  getPaypalConfigController,
  capturePaypalOrderController,
  updateAdminOrderStatusController,
  verifyRazorpayPaymentController,
} from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post("/create", auth, createOrderController);
orderRouter.post("/razorpay/create", auth, createRazorpayOrderController);
orderRouter.post("/razorpay/verify", auth, verifyRazorpayPaymentController);
orderRouter.get("/paypal/config", auth, getPaypalConfigController);
orderRouter.post("/paypal/create", auth, createPaypalOrderController);
orderRouter.post("/paypal/capture", auth, capturePaypalOrderController);
orderRouter.get("/admin/orders", auth, getAdminOrdersController);
orderRouter.get("/admin/dashboard-stats", auth, getAdminDashboardStatsController);
orderRouter.put("/admin/orders/:orderId/status", auth, updateAdminOrderStatusController);
orderRouter.get("/my-orders", auth, getMyOrdersController);
orderRouter.get("/my-orders/:orderId", auth, getMyOrderController);

export default orderRouter;
