import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { allowRoles } from "../middlewares/roles.js";
import optionalAuth from "../middlewares/optionalAuth.js";
import {
  getRecommendations,
  trackProductView,
} from "../controllers/recommendation.controller.js";
import {
  addProductReview,
  getAdminReviews,
  deleteAdminReview,
  getProductReviewEligibility,
  createProduct,
  deleteProduct,
  getAllFeaturedProducts,
  getAllProducts,
  getAdminProducts,
  updateProductApproval,
  getAllProductsByCatId,
  getAllProductsByCatName,
  getAllProductsByPrice,
  getAllProductsByRating,
  getAllProductsBySubCatId,
  getAllProductsBySubCatName,
  getAllProductsByThirdLevelCatId,
  getAllProductsByThirdLevelCatName,
  getProduct,
  getProductsCount,
  removeImageFromCloudinary,
  updateProduct,
  uploadImages,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post("/uploadImages", auth, allowRoles("ADMIN"), upload.array("images"), uploadImages);
productRouter.post("/create", auth, allowRoles("ADMIN"), createProduct);
productRouter.post("/:id/reviews", auth, addProductReview);
productRouter.get("/:id/review-eligibility", auth, getProductReviewEligibility);
productRouter.get("/admin/reviews", auth, allowRoles("ADMIN"), getAdminReviews);
productRouter.get("/admin/products", auth, allowRoles("ADMIN"), getAdminProducts);
productRouter.put(
  "/admin/products/:id/approval",
  auth,
  allowRoles("ADMIN"),
  updateProductApproval,
);
productRouter.delete("/admin/reviews/:productId/:reviewId", auth, allowRoles("ADMIN"), deleteAdminReview);
productRouter.get("/getAllProducts", getAllProducts);
productRouter.get("/getAllProductsByCatId/:id", getAllProductsByCatId);
productRouter.get("/getAllProductsByCatName", getAllProductsByCatName);
productRouter.get("/getAllProductsBySubCatId/:id", getAllProductsBySubCatId);
productRouter.get("/getAllProductsBySubCatName", getAllProductsBySubCatName);
productRouter.get(
  "/getAllProductsByThirdLevelCat/:id",
  getAllProductsByThirdLevelCatId,
);
productRouter.get(
  "/getAllProductsByThirdLevelCatName",
  getAllProductsByThirdLevelCatName,
);

productRouter.get("/getAllProductsByPrice", getAllProductsByPrice);
productRouter.get("/getAllProductsByRating", getAllProductsByRating);
productRouter.get("/getAllProductsCount", getProductsCount);
productRouter.get("/getAllFeaturedProducts", getAllFeaturedProducts);
productRouter.get("/recommendations/for-you", optionalAuth, getRecommendations);
productRouter.post("/recommendations/view/:productId", optionalAuth, trackProductView);
productRouter.delete("/deleteImage", auth, allowRoles("ADMIN"), removeImageFromCloudinary);
productRouter.put("/updateProduct/:id", auth, allowRoles("ADMIN"), updateProduct);
productRouter.delete("/:id", auth, allowRoles("ADMIN"), deleteProduct);
productRouter.get("/:id", getProduct);

export default productRouter;
