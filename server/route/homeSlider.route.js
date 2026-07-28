import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { allowRoles } from "../middlewares/roles.js";
import { createHomeSlider, deleteHomeSlider, getHomeSliders, updateHomeSlider, uploadHomeSliderImages } from "../controllers/homeSlider.controller.js";

const homeSliderRouter = Router();

homeSliderRouter.get("/", getHomeSliders);
homeSliderRouter.post("/uploadImages", auth, allowRoles("ADMIN"), upload.array("images", 1), uploadHomeSliderImages);
homeSliderRouter.post("/create", auth, allowRoles("ADMIN"), createHomeSlider);
homeSliderRouter.put("/:id", auth, allowRoles("ADMIN"), updateHomeSlider);
homeSliderRouter.delete("/:id", auth, allowRoles("ADMIN"), deleteHomeSlider);

export default homeSliderRouter;
