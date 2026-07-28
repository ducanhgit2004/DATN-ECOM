import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import BlogModel from "../models/blog.model.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const deleteImage = async (url) => {
  if (!url?.includes("res.cloudinary.com")) return;
  const uploadPart = url.split("/upload/")[1];
  const publicId = uploadPart?.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
  if (publicId) await cloudinary.uploader.destroy(publicId);
};

export async function uploadBlogImage(request, response) {
  const file = request.files?.[0];
  if (!file) return response.status(400).json({ success: false, error: true, message: "Image is required." });
  try {
    const result = await cloudinary.uploader.upload(file.path, { folder: "blogs", resource_type: "auto" });
    return response.json({ success: true, error: false, images: [result.secure_url] });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  } finally {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  }
}

export async function getBlogs(request, response) {
  try {
    const filter = request.query.active === "true" ? { active: true } : {};
    const data = await BlogModel.find(filter).sort({ order: 1, publishedAt: -1, createdAt: -1 });
    return response.json({ success: true, error: false, data });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function getBlog(request, response) {
  try {
    const blog = await BlogModel.findById(request.params.id);
    if (!blog || (!blog.active && request.query.preview !== "true")) return response.status(404).json({ success: false, error: true, message: "Blog post not found." });
    return response.json({ success: true, error: false, data: blog });
  } catch (error) {
    return response.status(404).json({ success: false, error: true, message: "Blog post not found." });
  }
}

export async function createBlog(request, response) {
  try {
    const { image, title, excerpt, content } = request.body;
    if (!image || !title?.trim() || !excerpt?.trim() || !content?.trim()) return response.status(400).json({ success: false, error: true, message: "Image, title, excerpt, and content are required." });
    const blog = await BlogModel.create(request.body);
    return response.status(201).json({ success: true, error: false, message: "Blog post created successfully.", blog });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function updateBlog(request, response) {
  try {
    const current = await BlogModel.findById(request.params.id);
    if (!current) return response.status(404).json({ success: false, error: true, message: "Blog post not found." });
    const blog = await BlogModel.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
    if (request.body.image && request.body.image !== current.image) await deleteImage(current.image);
    return response.json({ success: true, error: false, message: "Blog post updated successfully.", blog });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function deleteBlog(request, response) {
  try {
    const blog = await BlogModel.findByIdAndDelete(request.params.id);
    if (!blog) return response.status(404).json({ success: false, error: true, message: "Blog post not found." });
    await deleteImage(blog.image);
    return response.json({ success: true, error: false, message: "Blog post deleted successfully." });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}
