import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import CategoryBannerModel from "../models/categoryBanner.model.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const deleteImage = async (url) => {
  if (!url?.includes("res.cloudinary.com")) return;
  const uploadPart = url.split("/upload/")[1];
  if (!uploadPart) return;
  const publicId = uploadPart.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
  if (publicId) await cloudinary.uploader.destroy(publicId);
};

export async function uploadCategoryBannerImage(request, response) {
  try {
    const file = request.files?.[0];
    if (!file) return response.status(400).json({ success: false, error: true, message: "Image is required." });
    try {
      const result = await cloudinary.uploader.upload(file.path, { folder: "category-banners", resource_type: "auto" });
      return response.status(200).json({ success: true, error: false, images: [result.secure_url] });
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function getCategoryBanners(request, response) {
  try {
    const filter = {};
    if (request.query.active === "true") filter.active = true;
    if (request.query.placement === "category-slider") {
      // Records created before placement existed belong to the lower slider.
      filter.placement = { $in: ["category-slider", null] };
    } else if (request.query.placement) {
      filter.placement = request.query.placement;
    }
    const data = await CategoryBannerModel.find(filter).populate("categoryId", "name").sort({ order: 1, createdAt: -1 });
    return response.status(200).json({ success: true, error: false, data });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function createCategoryBanner(request, response) {
  try {
    if (!request.body.image || !request.body.categoryId) return response.status(400).json({ success: false, error: true, message: "Image and destination category are required." });
    const banner = await CategoryBannerModel.create(request.body);
    return response.status(201).json({ success: true, error: false, message: "Category banner created.", banner });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function updateCategoryBanner(request, response) {
  try {
    const current = await CategoryBannerModel.findById(request.params.id);
    if (!current) return response.status(404).json({ success: false, error: true, message: "Category banner not found." });
    const banner = await CategoryBannerModel.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
    if (request.body.image && request.body.image !== current.image) await deleteImage(current.image);
    return response.status(200).json({ success: true, error: false, message: "Category banner updated.", banner });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function deleteCategoryBanner(request, response) {
  try {
    const banner = await CategoryBannerModel.findByIdAndDelete(request.params.id);
    if (!banner) return response.status(404).json({ success: false, error: true, message: "Category banner not found." });
    await deleteImage(banner.image);
    return response.status(200).json({ success: true, error: false, message: "Category banner deleted." });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}
