import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerDashboard,
  getSellerOrders,
  getSellerProducts,
  getPublicStore,
  searchPublicStores,
  getSellerReviews,
  getSellerStore,
  updateSellerProduct,
  updateSellerStore,
  uploadSellerProductImage,
  uploadSellerStoreImage,
} from "../controllers/seller.controller.js";

const sellerRouter = Router();
sellerRouter.get("/public", searchPublicStores);
sellerRouter.get("/public/:sellerId", getPublicStore);
sellerRouter.use(auth);
sellerRouter.get("/dashboard", getSellerDashboard);
sellerRouter.get("/products", getSellerProducts);
sellerRouter.post("/products/upload-image", upload.array("images", 10), uploadSellerProductImage);
sellerRouter.post("/products", createSellerProduct);
sellerRouter.put("/products/:productId", updateSellerProduct);
sellerRouter.delete("/products/:productId", deleteSellerProduct);
sellerRouter.get("/orders", getSellerOrders);
sellerRouter.get("/reviews", getSellerReviews);
sellerRouter.get("/store", getSellerStore);
sellerRouter.put("/store", updateSellerStore);
sellerRouter.post("/store/upload-image", upload.single("image"), uploadSellerStoreImage);

export default sellerRouter;
