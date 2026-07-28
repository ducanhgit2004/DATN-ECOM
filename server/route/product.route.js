import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { allowRoles } from "../middlewares/roles.js";
import {
  addProductReview,
  createProduct,
  deleteProduct,
  getAllFeaturedProducts,
  getAllProducts,
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
productRouter.delete("/deleteImage", auth, allowRoles("ADMIN"), removeImageFromCloudinary);
productRouter.put("/updateProduct/:id", auth, allowRoles("ADMIN"), updateProduct);
productRouter.delete("/:id", auth, allowRoles("ADMIN"), deleteProduct);
productRouter.get("/:id", getProduct);

export default productRouter;
