import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { allowRoles } from "../middlewares/roles.js";
import { createCategoryBanner, deleteCategoryBanner, getCategoryBanners, updateCategoryBanner, uploadCategoryBannerImage } from "../controllers/categoryBanner.controller.js";

const router = Router();
router.get("/", getCategoryBanners);
router.post("/uploadImages", auth, allowRoles("ADMIN"), upload.array("images", 1), uploadCategoryBannerImage);
router.post("/create", auth, allowRoles("ADMIN"), createCategoryBanner);
router.put("/:id", auth, allowRoles("ADMIN"), updateCategoryBanner);
router.delete("/:id", auth, allowRoles("ADMIN"), deleteCategoryBanner);

export default router;
