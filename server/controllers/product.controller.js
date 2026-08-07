import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import OrderModel from "../models/order.model.js";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

var imagesArr = [];

const calculateAverageRating = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0,
  );
  return Number((total / reviews.length).toFixed(1));
};

const hasPurchasedProduct = (userId, productId) =>
  OrderModel.exists({
    userId,
    orderStatus: "delivered",
    "items.productId": productId,
  });

export async function addProductReview(request, response) {
  try {
    const productId = request.params?.id;
    const { rating, comment } = request.body || {};

    if (!productId) {
      return response.status(400).json({
        message: "Product id is required",
        error: true,
        success: false,
      });
    }

    const normalizedRating = Math.max(1, Math.min(5, Number(rating) || 0));
    const normalizedComment = String(comment || "").trim();

    if (!normalizedComment || normalizedRating < 1) {
      return response.status(400).json({
        message: "Please provide a rating and comment.",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      return response.status(404).json({
        message: "The product is not found",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(request.userId).select("name email");

    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    const existingIndex = reviews.findIndex(
      (review) => String(review.userId) === String(request.userId),
    );

    const nextReview = {
      userId: request.userId,
      userName: user?.name || "Customer",
      userEmail: user?.email || "",
      rating: normalizedRating,
      comment: normalizedComment,
      createdAt: new Date(),
    };

    const nextReviews =
      existingIndex >= 0
        ? reviews.map((review, index) =>
            index === existingIndex ? { ...review, ...nextReview } : review,
          )
        : [...reviews, nextReview];

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      {
        reviews: nextReviews,
        rating: calculateAverageRating(nextReviews),
      },
      { new: true },
    ).populate("category");

    return response.status(201).json({
      message: "Review submitted successfully.",
      error: false,
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAdminReviews(request, response) {
  try {
    const products = await ProductModel.find({ "reviews.0": { $exists: true } })
      .select("name images sellerId reviews")
      .populate("sellerId", "name email storeName")
      .lean();
    const reviews = products
      .flatMap((product) =>
        product.reviews.map((review) => ({
          ...review,
          productId: product._id,
          productName: product.name,
          productImage: product.images?.[0] || "",
          sellerId: product.sellerId?._id || product.sellerId || null,
          sellerName: product.sellerId?.storeName || product.sellerId?.name || "Platform",
        })),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return response.json({ data: reviews, total: reviews.length, error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to load reviews", error: true, success: false });
  }
}

export async function deleteAdminReview(request, response) {
  try {
    const { productId, reviewId } = request.params;
    if (!productId || !reviewId) {
      return response.status(400).json({ message: "Product and review ids are required", error: true, success: false });
    }
    const product = await ProductModel.findOne({ _id: productId, "reviews._id": reviewId });
    if (!product) {
      return response.status(404).json({ message: "Review not found", error: true, success: false });
    }

    const purchased = await hasPurchasedProduct(request.userId, productId);
    if (!purchased) {
      return response.status(403).json({
        message: "Only customers who have received this product can review it.",
        error: true,
        success: false,
      });
    }
    product.reviews.pull({ _id: reviewId });
    product.rating = calculateAverageRating(product.reviews);
    await product.save();
    return response.json({ message: "Review deleted successfully", error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to delete review", error: true, success: false });
  }
}

export async function getProductReviewEligibility(request, response) {
  try {
    const product = await ProductModel.exists({ _id: request.params.id });
    if (!product) {
      return response.status(404).json({ message: "The product is not found", error: true, success: false });
    }
    const eligible = Boolean(await hasPurchasedProduct(request.userId, request.params.id));
    return response.json({
      data: { eligible },
      message: eligible
        ? "You can review this product."
        : "Only customers who have received this product can review it.",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to check review eligibility", error: true, success: false });
  }
}

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
      images: Array.isArray(request.body.images)
        ? request.body.images
        : imagesArr,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function createProduct(request, response) {
  try {
    const inventoryType = ["size", "ram", "weight"].includes(
      request.body.inventoryType,
    )
      ? request.body.inventoryType
      : "none";
    const inventoryVariants =
      inventoryType === "none"
        ? []
        : (request.body.inventoryVariants || [])
            .filter((item) => item?.value)
            .map((item) => ({
              value: String(item.value),
              stock: Math.max(0, Number(item.stock) || 0),
            }));
    const countInStock =
      inventoryType === "none"
        ? Math.max(0, Number(request.body.countInStock) || 0)
        : inventoryVariants.reduce((total, item) => total + item.stock, 0);
    let product = new ProductModel({
      name: request.body.name,
      description: request.body.description,
      images: Array.isArray(request.body.images)
        ? request.body.images
        : imagesArr,
      brand: request.body.brand,
      price: request.body.price,
      oldPrice: request.body.oldPrice,
      catName: request.body.catName,
      catId: request.body.catId,
      subCatId: request.body.subCatId,
      subCat: request.body.subCat,
      subCatName: request.body.subCatName,
      thirdsubCat: request.body.thirdsubCat,
      thirdsubCatName: request.body.thirdsubCatName,
      thirdsubCatId: request.body.thirdsubCatId,
      category:
        request.body.thirdsubCatId ||
        request.body.subCatId ||
        request.body.category ||
        request.body.catId,
      countInStock,
      inventoryType,
      inventoryVariants,
      rating: request.body.rating,
      isFeatured: request.body.isFeatured,
      bannerEnabled: Boolean(request.body.bannerEnabled),
      bannerImage: request.body.bannerImage || "",
      bannerSubtitle: request.body.bannerSubtitle || "",
      bannerTitle: request.body.bannerTitle || "",
      bannerPriceLabel: request.body.bannerPriceLabel || "Starting at",
      bannerPriceText: request.body.bannerPriceText || "",
      bannerButtonText: request.body.bannerButtonText || "SHOP NOW",
      discount: request.body.discount,
      productRam: Array.isArray(request.body.productRam)
        ? request.body.productRam
        : request.body.productRam
          ? [request.body.productRam]
          : [],
      size: request.body.size,
      productWeight: request.body.productWeight,
    });

    product = await product.save();
    if (!product) {
      response.status(500).json({
        error: true,
        success: false,
        message: "Product Not Created",
      });
    }

    imagesArr = [];

    return response.status(201).json({
      message: "Product created successfully.",
      error: false,
      success: true,
      product: product,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProducts(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = Math.max(1, parseInt(request.query.perPage) || 10);
    const publicFilter = {
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    };
    const totalPosts = await ProductModel.countDocuments(publicFilter);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (totalPages > 0 && page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find(publicFilter)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAdminProducts(request, response) {
  try {
    const products = await ProductModel.find()
      .populate("category")
      .populate("sellerId", "name storeName email")
      .sort({ createdAt: -1 });
    return response.json({ products, error: false, success: true });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Unable to load products",
      error: true,
      success: false,
    });
  }
}

export async function updateProductApproval(request, response) {
  try {
    const { approvalStatus, approvalReason = "" } = request.body || {};
    if (!["approved", "rejected"].includes(approvalStatus)) {
      return response.status(400).json({
        message: "Approval status must be approved or rejected",
        error: true,
        success: false,
      });
    }
    const product = await ProductModel.findByIdAndUpdate(
      request.params.id,
      {
        approvalStatus,
        approvalReason:
          approvalStatus === "rejected" ? String(approvalReason).trim() : "",
        approvedAt: approvalStatus === "approved" ? new Date() : null,
        approvedBy: approvalStatus === "approved" ? request.userId : null,
      },
      { new: true, runValidators: true },
    ).populate("sellerId", "name storeName email");
    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }
    return response.json({
      message: `Product ${approvalStatus}`,
      product,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Unable to update product approval",
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsByCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      catId: request.params.id,
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsByCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      catName: request.query.catName,
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsBySubCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      subCatId: request.params.id,
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsBySubCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      subCat: request.query.subCat,
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsByThirdLevelCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      thirdsubCatId: request.params.id,
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsByThirdLevelCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      thirdsubCat: request.query.thirdsubCat,
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsByPrice(request, response) {
  try {
    const {
      catId,
      subCatId,
      thirdsubCatId,
      minPrice,
      maxPrice,
      page,
      perPage,
    } = request.query;
    const min =
      minPrice !== undefined && minPrice !== "" ? Number(minPrice) : null;
    const max =
      maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : null;
    const currentPage = Math.max(1, parseInt(page) || 1);
    const perPageSize = Math.max(1, parseInt(perPage) || 10000);

    let productList = [];

    if (catId) {
      productList = await ProductModel.find({ catId, approvalStatus: { $nin: ["pending", "rejected"] }, saleStatus: { $ne: "discontinued" } }).populate("category");
    } else if (subCatId) {
      productList = await ProductModel.find({ subCatId, approvalStatus: { $nin: ["pending", "rejected"] }, saleStatus: { $ne: "discontinued" } }).populate("category");
    } else if (thirdsubCatId) {
      productList = await ProductModel.find({ thirdsubCatId, approvalStatus: { $nin: ["pending", "rejected"] }, saleStatus: { $ne: "discontinued" } }).populate(
        "category",
      );
    } else {
      productList = await ProductModel.find({ approvalStatus: { $nin: ["pending", "rejected"] }, saleStatus: { $ne: "discontinued" } }).populate("category");
    }

    const filteredProducts = productList.filter((product) => {
      const price = Number(product.price);

      if (Number.isNaN(price)) {
        return false;
      }

      if (min !== null && price < min) {
        return false;
      }

      if (max !== null && price > max) {
        return false;
      }

      return true;
    });

    const totalPosts = filteredProducts.length;
    const totalPages = Math.ceil(totalPosts / perPageSize);
    const startIndex = (currentPage - 1) * perPageSize;
    const paginatedProducts = filteredProducts.slice(
      startIndex,
      startIndex + perPageSize,
    );

    return response.status(200).json({
      error: false,
      success: true,
      products: paginatedProducts,
      totalPages,
      page: currentPage,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsByRating(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const rating = request.query.rating;
    const catId = request.query.catId;
    const subCatId = request.query.subCatId;
    const thirdsubCatId = request.query.thirdsubCatId;

    const filter = {
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    };

    if (rating !== undefined && rating !== "") {
      filter.rating = rating;
    }

    if (catId !== undefined && catId !== "") {
      filter.catId = catId;
    }

    if (subCatId !== undefined && subCatId !== "") {
      filter.subCatId = subCatId;
    }

    if (thirdsubCatId !== undefined && thirdsubCatId !== "") {
      filter.thirdsubCatId = thirdsubCatId;
    }

    const totalPosts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find(filter)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getProductsCount(request, response) {
  try {
    const productsCount = await ProductModel.countDocuments({
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    });

    if (!productsCount) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      productsCount: productsCount,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllFeaturedProducts(request, response) {
  try {
    const products = await ProductModel.find({
      isFeatured: true,
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    }).populate("category");

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function deleteProduct(request, response) {
  try {
    const product = await ProductModel.findById(request.params.id).populate(
      "category",
    );

    if (!product) {
      return response.status(404).json({
        message: "Product Not found",
        error: true,
        success: false,
      });
    }

    const hasOrderHistory = await OrderModel.exists({
      "items.productId": product._id,
    });
    if (hasOrderHistory) {
      product.saleStatus = "discontinued";
      product.discontinuedAt = new Date();
      await product.save();
      return response.json({
        message: "Product has order history and was marked as discontinued",
        product,
        discontinued: true,
        error: false,
        success: true,
      });
    }

    const images = product.images || [];

    for (const img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];

      const imageName = image.split(".")[0];

      if (imageName) {
        cloudinary.uploader.destroy(imageName, () => {});
      }
    }

    const deletedProduct = await ProductModel.findByIdAndDelete(
      request.params.id,
    );

    if (!deletedProduct) {
      response.status(404).json({
        message: "Product not found!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    return response
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
}

export async function getProduct(request, response) {
  try {
    const productId = request.params?.id;

    if (!productId) {
      return response.status(400).json({
        message: "Product id is required",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.findOne({
      _id: productId,
      approvalStatus: { $nin: ["pending", "rejected"] },
      saleStatus: { $ne: "discontinued" },
    }).populate("category");

    if (!product) {
      return response.status(404).json({
        message: "The product is not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      product: product,
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

export async function updateProduct(request, response) {
  try {
    const inventoryType = ["size", "ram", "weight"].includes(
      request.body.inventoryType,
    )
      ? request.body.inventoryType
      : "none";
    const inventoryVariants =
      inventoryType === "none"
        ? []
        : (request.body.inventoryVariants || [])
            .filter((item) => item?.value)
            .map((item) => ({
              value: String(item.value),
              stock: Math.max(0, Number(item.stock) || 0),
            }));
    const countInStock =
      inventoryType === "none"
        ? Math.max(0, Number(request.body.countInStock) || 0)
        : inventoryVariants.reduce((total, item) => total + item.stock, 0);
    const product = await ProductModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        description: request.body.description,
        images: request.body.images,
        brand: request.body.brand,
        price: request.body.price,
        oldPrice: request.body.oldPrice,
        catId: request.body.catId,
        subCat: request.body.subCat,
        subCatId: request.body.subCatId,
        subCatName: request.body.subCatName,
        catName: request.body.catName,
        category:
          request.body.thirdsubCatId ||
          request.body.subCatId ||
          request.body.category ||
          request.body.catId,
        thirdsubCat: request.body.thirdsubCat,
        thirdsubCatName: request.body.thirdsubCatName,
        thirdsubCatId: request.body.thirdsubCatId,
        countInStock,
        inventoryType,
        inventoryVariants,
        rating: request.body.rating,
        isFeatured: request.body.isFeatured,
        bannerEnabled: Boolean(request.body.bannerEnabled),
        bannerImage: request.body.bannerImage || "",
        bannerSubtitle: request.body.bannerSubtitle || "",
        bannerTitle: request.body.bannerTitle || "",
        bannerPriceLabel: request.body.bannerPriceLabel || "Starting at",
        bannerPriceText: request.body.bannerPriceText || "",
        bannerButtonText: request.body.bannerButtonText || "SHOP NOW",
        discount: request.body.discount,
        productRam: Array.isArray(request.body.productRam)
          ? request.body.productRam
          : request.body.productRam
            ? [request.body.productRam]
            : [],
        size: Array.isArray(request.body.size)
          ? request.body.size
          : request.body.size
            ? [request.body.size]
            : [],
        productWeight: Array.isArray(request.body.productWeight)
          ? request.body.productWeight
          : request.body.productWeight
            ? [request.body.productWeight]
            : [],
      },
      { new: true },
    );

    if (!product) {
      response.status(404).json({
        message: "The product can not be updated!",
        status: false,
      });
    }

    imagesArr = [];

    return response.status(200).json({
      message: "Product updated successfully.",
      error: false,
      success: true,
      product,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
