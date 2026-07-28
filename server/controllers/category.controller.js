import CategoryModel from "../models/category.model.js";

import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";
import { request } from "http";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

var imagesArr = [];
export async function uploadImages(request, response) {
  try {
    imagesArr = [];

    const files = request.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    let publicId = "";

    for (let i = 0; i < files.length; i++) {
      const result = await cloudinary.uploader.upload(files[i].path, options);
      console.log("PUBLIC ID:", result.public_id);
      imagesArr.push(result.secure_url);

      if (i === 0) {
        publicId = result.public_id;
      }

      try {
        fs.unlinkSync(files[i].path);
      } catch (unlinkError) {
        console.warn(
          "Failed to delete temp file:",
          files[i].path,
          unlinkError.message,
        );
      }
    }

    return response.status(200).json({
      images: imagesArr,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function createCategory(request, response) {
  try {
    let category = new CategoryModel({
      name: request.body.name,
      images: Array.isArray(request.body.images) ? request.body.images : imagesArr,
      parentId: request.body.parentId || null,
      parentCatName: request.body.parentCatName,
    });

    if (!category) {
      return response.status(500).json({
        message: "Category not created",
        error: true,
        success: false,
      });
    }

    category = await category.save();
    imagesArr = [];

    return response.status(201).json({
      message: "Category created",
      error: false,
      success: true,
      category: category,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getCategories(request, response) {
  try {
    const categories = await CategoryModel.find();
    const categoryMap = {};

    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat._doc, children: [] };
    });

    const rootCategories = [];

    categories.forEach((cat) => {
      if (cat.parentId) {
        categoryMap[cat.parentId]?.children.push(categoryMap[cat._id]);
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    return response.status(200).json({
      message: "Categories fetched",
      error: false,
      success: true,
      data: rootCategories,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getCategoriesCount(request, response) {
  try {
    const categoryCount = await CategoryModel.countDocuments({
      parentId: undefined,
    });
    if (!categoryCount) {
      response.status(500).json({ success: false, error: true });
    } else {
      response.send({
        categoryCount: categoryCount,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getSubCategoriesCount(request, response) {
  try {
    const categories = await CategoryModel.find();
    if (!categories) {
      return response.status(500).json({ success: false, error: true });
    }

    const subCatList = categories.filter((cat) => cat.parentId !== undefined);

    return response.status(200).json({
      SubCategoryCount: subCatList.length,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getCategory(request, response) {
  try {
    const category = await CategoryModel.findById(request.params.id);
    if (!category) {
      response.status(500).json({
        message: "The category with the given ID was not found",
        error: true,
        success: false,
      });
    }
    return response.status(200).json({
      error: false,
      success: true,
      category: category,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function removeImageFromCloudinary(request, response) {
  try {
    const public_id = request.query.public_id;

    const result = await cloudinary.uploader.destroy(public_id);

    return response.status(200).json({
      result,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
    });
  }
}

export async function deleteCategory(request, response) {
  try {
  const category = await CategoryModel.findById(request.params.id);
  if (!category) {
    return response.status(404).json({ message: "Category not found!", success: false, error: true });
  }
  const images = category.images;

  for (let img of images) {
    const imgUrl = img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
      cloudinary.uploader.destroy(imageName, (error, result) => {});
    }
  }

  const subCategory = await CategoryModel.find({
    parentId: request.params.id,
  });

  for (let i = 0; i < subCategory.length; i++) {
    console.log(subCategory[i]._id);

    const thirdsubCategory = await CategoryModel.find({
      parentId: subCategory[i]._id,
    });

    for (let i = 0; i < thirdsubCategory.length; i++) {
      const deletedThirdSubCat = await CategoryModel.findByIdAndDelete(
        thirdsubCategory[i]._id,
      );
    }

    const deletedSubCat = await CategoryModel.findByIdAndDelete(
      subCategory[i]._id,
    );
  }

  const deletedCat = await CategoryModel.findByIdAndDelete(request.params.id);
  if (!deletedCat) {
    return response.status(404).json({
      message: "Category not found!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    success: true,
    error: false,
    message: "Category Deleted!",
  });
  } catch (error) {
    return response.status(500).json({ message: error.message || error, success: false, error: true });
  }
}

export async function updateCategory(request, response) {
  try {
    const updateData = {};

    if (request.body.name !== undefined) {
      updateData.name = request.body.name;
    }
    if (request.body.parentId !== undefined) {
      updateData.parentId = request.body.parentId || null;
    }
    if (request.body.parentCatName !== undefined) {
      updateData.parentCatName = request.body.parentCatName;
    }

    if (request.files?.length > 0) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };
      const uploadedImages = [];

      for (const file of request.files) {
        const result = await cloudinary.uploader.upload(file.path, options);
        uploadedImages.push(result.secure_url);

        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.warn(
            "Failed to delete temp file:",
            file.path,
            unlinkError.message,
          );
        }
      }

      updateData.images = uploadedImages;
    } else if (imagesArr.length > 0) {
      updateData.images = imagesArr;
    } else if (request.body.images !== undefined) {
      const imagesBody = request.body.images;
      if (typeof imagesBody === "string") {
        try {
          updateData.images = JSON.parse(imagesBody);
        } catch (parseError) {
          updateData.images = [imagesBody];
        }
      } else {
        updateData.images = Array.isArray(imagesBody)
          ? imagesBody
          : [imagesBody];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return response.status(400).json({
        message: "No update fields provided.",
        success: false,
        error: true,
      });
    }

    const category = await CategoryModel.findByIdAndUpdate(
      request.params.id,
      updateData,
      { new: true },
    );

    if (!category) {
      return response.status(404).json({
        message: "Category not found!",
        success: false,
        error: true,
      });
    }

    response.status(200).json({
      error: false,
      success: true,
      category,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
