import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import HomeSliderModel from "../models/homeSlider.model.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const deleteCloudinaryImage = async (url) => {
  if (!url?.includes("res.cloudinary.com")) return;
  const uploadPart = url.split("/upload/")[1];
  if (!uploadPart) return;
  const withoutVersion = uploadPart.replace(/^v\d+\//, "");
  const publicId = withoutVersion.replace(/\.[^/.]+$/, "");
  if (publicId) await cloudinary.uploader.destroy(publicId);
};

export async function uploadHomeSliderImages(request, response) {
  try {
    const images = [];
    for (const file of request.files || []) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "home-sliders",
          resource_type: "auto",
        });
        images.push(result.secure_url);
      } finally {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }
    return response.status(200).json({ success: true, error: false, images });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function getHomeSliders(request, response) {
  try {
    const filter = request.query.active === "true" ? { active: true } : {};
    const data = await HomeSliderModel.find(filter).sort({ order: 1, createdAt: -1 });
    return response.status(200).json({ success: true, error: false, data });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function createHomeSlider(request, response) {
  try {
    if (!request.body.image) return response.status(400).json({ success: false, error: true, message: "Banner image is required." });
    const slider = await HomeSliderModel.create(request.body);
    return response.status(201).json({ success: true, error: false, message: "Home slider created.", slider });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function updateHomeSlider(request, response) {
  try {
    const current = await HomeSliderModel.findById(request.params.id);
    if (!current) return response.status(404).json({ success: false, error: true, message: "Home slider not found." });
    const slider = await HomeSliderModel.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
    if (request.body.image && request.body.image !== current.image) await deleteCloudinaryImage(current.image);
    return response.status(200).json({ success: true, error: false, message: "Home slider updated.", slider });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}

export async function deleteHomeSlider(request, response) {
  try {
    const slider = await HomeSliderModel.findByIdAndDelete(request.params.id);
    if (!slider) return response.status(404).json({ success: false, error: true, message: "Home slider not found." });
    await deleteCloudinaryImage(slider.image);
    return response.status(200).json({ success: true, error: false, message: "Home slider deleted." });
  } catch (error) {
    return response.status(500).json({ success: false, error: true, message: error.message });
  }
}
