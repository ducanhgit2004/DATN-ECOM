import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog, uploadBlogImage } from "../controllers/blog.controller.js";

const router = Router();
router.get("/", getBlogs);
router.get("/:id", getBlog);
router.post("/uploadImages", auth, upload.array("images", 1), uploadBlogImage);
router.post("/create", auth, createBlog);
router.put("/:id", auth, updateBlog);
router.delete("/:id", auth, deleteBlog);

export default router;
