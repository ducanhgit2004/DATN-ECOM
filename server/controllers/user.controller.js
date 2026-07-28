import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import { error } from "console";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import { v2 as cloudinary } from "cloudinary";
import fs, { access } from "fs";
import verifyFirebaseIdToken from "../utils/verifyFirebaseIdToken.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

export async function registerUserController(request, response) {
  try {
    let user;
    const { name, email, password } = request.body;
    if (!name || !email || !password) {
      return response.status(400).json({
        message: "provide email, name, password",
        error: true,
        success: false,
      });
    }

    user = await UserModel.findOne({ email: email });
    if (user) {
      return response.json({
        message: "Email already registered",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    user = new UserModel({
      email: email,
      password: hashPassword,
      name: name,
      otp: verifyCode,
      otpExpires: Date.now() + 600000,
    });

    await user.save();

    const emailSent = await sendEmailFun({
      sendTo: email,
      subject: "Verify email from Ecommerce App",
      text: "",
      html: VerificationEmail(name, verifyCode),
    });

    if (!emailSent) {
      console.error("Verification email could not be sent to:", email);
      console.log("Development OTP fallback:", verifyCode);
      return response.status(500).json({
        message:
          "Unable to send verification email right now. Please try again later.",
        error: true,
        success: false,
      });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY,
    );

    return response.status(200).json({
      success: true,
      error: false,
      message: "User registered successfully! Please verify your email.",
      token: token,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({
        message: "Email already used",
        error: true,
        success: false,
      });
    }

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyEmailController(request, response) {
  try {
    const { email, otp } = request.body;

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return response
        .status(400)
        .json({ error: true, success: false, message: "User not found" });
    }

    const isCodeValid = user.otp === otp;
    const isNotExpired = user.otpExpires > Date.now();

    if (isCodeValid && isNotExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return response.status(200).json({
        error: false,
        success: true,
        message: "Email verified successfully",
      });
    } else if (!isCodeValid) {
      return response
        .status(400)
        .json({ error: true, success: false, message: "Invalid OTP" });
    } else {
      return response
        .status(400)
        .json({ error: true, success: false, message: "OTP expired" });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function loginUserController(request, response) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return response.status(503).json({
        message: "Database is currently unavailable. Please try again later.",
        error: true,
        success: false,
      });
    }

    const { email, password, client = "storefront" } = request.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "User not register",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Contact to admin",
        error: true,
        success: false,
      });
    }

    if (client === "seller" && user.role !== "SELLER") {
      return response.status(403).json({
        message: "This account is not registered as a seller",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return response.status(400).json({
        message: "Check your password",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    await UserModel.findByIdAndUpdate(user._id, {
      last_login_date: new Date(),
      refresh_token: refreshToken,
    });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    if (client !== "seller") {
      response.cookie("accessToken", accesstoken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);
    }

    return response.json({
      message:
        user.verify_email === true
          ? "Login successfully"
          : "Login successfully. Please verify your email to activate full access.",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

export async function registerSellerController(request, response) {
  try {
    const { name, email, password, storeName, storeDescription = "" } =
      request.body || {};
    if (!name?.trim() || !email?.trim() || !password || !storeName?.trim()) {
      return response.status(400).json({
        message: "Name, email, password, and store name are required",
        error: true,
        success: false,
      });
    }
    if (password.length < 6) {
      return response.status(400).json({
        message: "Password must contain at least 6 characters",
        error: true,
        success: false,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await UserModel.exists({ email: normalizedEmail })) {
      return response.status(409).json({
        message: "Email already registered",
        error: true,
        success: false,
      });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      storeName: storeName.trim(),
      storeDescription: String(storeDescription).trim(),
      role: "SELLER",
      sellerApprovalStatus: "pending",
      verify_email: true,
    });

    return response.status(201).json({
      message: "Seller application submitted and is waiting for admin approval",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error?.code === 11000 ? 409 : 500).json({
      message: error.message || "Unable to submit seller application",
      error: true,
      success: false,
    });
  }
}

export async function getSellerSessionController(request, response) {
  try {
    const seller = await UserModel.findById(request.userId).select(
      "-password -refresh_token -otp -otpExpires",
    );
    if (!seller || seller.role !== "SELLER") {
      return response.status(403).json({
        message: "Seller access is required",
        error: true,
        success: false,
      });
    }
    if (seller.status !== "Active" || seller.sellerApprovalStatus !== "approved") {
      return response.status(403).json({
        message:
          seller.sellerApprovalStatus === "pending"
            ? "Your seller application is waiting for admin approval"
            : seller.sellerApprovalStatus === "rejected"
              ? "Your seller application was rejected"
              : "Your seller account is not active",
        data: seller,
        error: true,
        success: false,
      });
    }
    return response.json({ data: seller, error: false, success: true });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Unable to load seller session",
      error: true,
      success: false,
    });
  }
}

export async function googleLoginController(request, response) {
  try {
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ message: "Database is currently unavailable. Please try again later.", error: true, success: false });
    const firebaseUser = await verifyFirebaseIdToken(request.body.idToken);
    if (!firebaseUser.email || firebaseUser.email_verified !== true) return response.status(401).json({ message: "Google did not provide a verified email address.", error: true, success: false });

    const email = firebaseUser.email.trim().toLowerCase();
    let user = await UserModel.findOne({ email }).collation({ locale: "en", strength: 2 });
    if (!user) {
      const generatedPassword = await bcryptjs.hash(`${firebaseUser.sub}:${Date.now()}:${Math.random()}`, 12);
      user = await UserModel.create({
        name: firebaseUser.name?.trim() || email.split("@")[0],
        email,
        password: generatedPassword,
        avatar: firebaseUser.picture || "",
        verify_email: true,
        authProvider: "google",
        firebaseUid: firebaseUser.sub,
        last_login_date: new Date(),
      });
    } else {
      if (user.status !== "Active") return response.status(403).json({ message: "This account is inactive or suspended. Please contact support.", error: true, success: false });
      user.verify_email = true;
      user.firebaseUid = firebaseUser.sub;
      if (!user.avatar && firebaseUser.picture) user.avatar = firebaseUser.picture;
      user.last_login_date = new Date();
      await user.save();
    }

    const accesstoken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);
    const cookiesOption = { httpOnly: true, secure: true, sameSite: "None" };
    response.cookie("accessToken", accesstoken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);
    return response.json({ message: "Google login successful.", error: false, success: true, data: { accesstoken, refreshToken, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } } });
  } catch (error) {
    console.error("Google login error:", error.message);
    return response.status(401).json({ message: error.message || "Google authentication failed.", error: true, success: false });
  }
}
export async function logoutController(request, response) {
  try {
    const userid = request.userId;

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
      refresh_token: "",
    });

    return response.json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

var imagesArr = [];
export async function userAvatarController(request, response) {
  try {
    imagesArr = [];

    const userId = request.userId;
    const files = request.files;

    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false,
      });
    }

    if (!files || files.length === 0) {
      return response.status(400).json({
        message: "No avatar file uploaded",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    if (user.avatar_public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar_public_id);
      } catch (destroyError) {
        console.warn("Failed to delete previous avatar:", destroyError.message);
      }
    }

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

    user.avatar = imagesArr[0];
    user.avatar_public_id = publicId;
    await user.save();

    return response.status(200).json({
      _id: userId,
      avatar: imagesArr[0],
      error: false,
      success: true,
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

export async function changePasswordController(request, response) {
  try {
    const userId = request.userId;
    const { oldPassword, newPassword, confirmPassword } = request.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return response.status(400).json({
        message: "All password fields are required",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "New password and confirm password do not match",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const isOldPasswordValid = await bcryptjs.compare(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      return response.status(400).json({
        message: "Old password is incorrect",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashPassword;
    await user.save();

    return response.status(200).json({
      message: "Password changed successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function updateUserDetials(request, response) {
  try {
    const userId = request.userId;
    const { name, email, mobile, password } = request.body;

    const userExist = await UserModel.findById(userId);

    if (!userExist) {
      return response.status(400).json({
        message: "The user cannot be updated!",
        error: true,
        success: false,
      });
    }

    let verifyCode = null;

    // kiểm tra có đổi email không
    const isEmailChanged = email && email !== userExist.email;

    if (isEmailChanged) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // xử lý password
    let hashPassword = userExist.password;

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    }

    if (email && email !== userExist.email) {
      const existingEmailUser = await UserModel.findOne({ email });
      if (existingEmailUser && existingEmailUser._id.toString() !== userId) {
        return response.status(409).json({
          message: "Email already used",
          error: true,
          success: false,
        });
      }
    }

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name: name || userExist.name,

        mobile: mobile || userExist.mobile,

        email: email || userExist.email,

        // đổi email thì verify lại
        verify_email: isEmailChanged ? false : userExist.verify_email,

        password: hashPassword,

        // OTP mới nếu đổi email
        otp: isEmailChanged ? verifyCode : userExist.otp,

        otpExpires: isEmailChanged
          ? Date.now() + 10 * 60 * 1000
          : userExist.otpExpires,
        refresh_token: isEmailChanged ? "" : userExist.refresh_token,
      },
      {
        new: true,
      },
    );

    // gửi mail verify email mới
    if (isEmailChanged) {
      await sendEmailFun({
        sendTo: email,
        subject: "Verify email from Ecommerce App",
        text: "",
        html: VerificationEmail(name, verifyCode),
      });
    }

    if (isEmailChanged) {
      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };

      response.clearCookie("accessToken", cookiesOption);
      response.clearCookie("refreshToken", cookiesOption);
    }

    return response.json({
      message: isEmailChanged
        ? "Email updated. Please verify your new email and log in again."
        : "User Updated successfully",
      error: false,
      success: true,
      user: updateUser,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({
        message: "Email already used",
        error: true,
        success: false,
      });
    }

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//forgot password

export async function forgotPasswordController(request, response) {
  try {
    const { email } = request.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = verifyCode;

    user.otpExpires = Date.now() + 600000;

    await user.save();

    await sendEmailFun({
      sendTo: user.email,
      subject: "Forgot password Ecommerce App",
      text: "",
      html: VerificationEmail(user.name, verifyCode),
    });

    return response.status(200).json({
      message: "OTP sent to email",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

export async function verifyForgotPasswordOtp(request, response) {
  try {
    const { email, otp } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    if (!email || !otp) {
      return response.status(400).json({
        message: "Provide required field email, otp.",
        error: true,
        success: false,
      });
    }

    if (otp !== user.otp) {
      return response.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    }

    if (!user.otpExpires || Number(user.otpExpires) < Date.now()) {
      return response.status(400).json({
        message: "OTP is expired",
        error: true,
        success: false,
      });
    }

    user.otp = "";
    user.otpExpires = "";

    await user.save();

    return response.status(200).json({
      message: "Verified OTP successfully!",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function resetpassword(request, response) {
  try {
    const { email, newPassword, confirmPassword } = request.body;
    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        message: "Provide required fields email, newPassword, confirmPassword ",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "newPassword and confirmPassword must be same",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(confirmPassword, salt);

    user.password = hashPassword;
    await user.save();

    return response.json({
      message: "Password updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function refreshtoken(request, response) {
  try {
    const refreshToken =
      request.cookies.refreshToken ||
      request?.headers?.authorization?.split("")[1];

    if (!refreshToken) {
      return response.status(401).json({
        message: "Invalid token",
        error: true,
        success: false,
      });
    }

    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN,
    );
    if (!verifyToken) {
      return response.status(401).json({
        message: "token is expired",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken?._id;

    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.cookie("accessToken", newAccessToken, cookiesOption);

    return response.json({
      message: "New Access token generated",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function userDetails(request, response) {
  try {
    const userId = request.userId;

    console.log(userId);

    const user = await UserModel.findById(userId).select(
      "-password -refresh_token",
    );

    return response.json({
      message: "user details",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
}

const requireAdmin = async (userId) => {
  const admin = await UserModel.findById(userId).select("role");
  if (!admin || admin.role !== "ADMIN") {
    throw Object.assign(new Error("Administrator access is required"), { status: 403 });
  }
};

export async function getAdminUsersController(request, response) {
  try {
    await requireAdmin(request.userId);
    const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(request.query.limit, 10) || 10));
    const search = String(request.query.search || "").trim();
    const status = String(request.query.status || "").trim();
    const filter = { role: "USER" };

    if (["Active", "Inactive", "Suspended"].includes(status)) filter.status = status;
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: { $ifNull: ["$mobile", ""] } },
              regex: safeSearch,
              options: "i",
            },
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select("-password -refresh_token -otp -otpExpires")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return response.json({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to load users",
      error: true,
      success: false,
    });
  }
}

export async function updateAdminUserStatusController(request, response) {
  try {
    await requireAdmin(request.userId);
    const { status } = request.body || {};
    if (!["Active", "Inactive", "Suspended"].includes(status)) {
      return response.status(400).json({
        message: "Status must be Active, Inactive, or Suspended",
        error: true,
        success: false,
      });
    }
    if (!mongoose.isValidObjectId(request.params.userId)) {
      return response.status(400).json({ message: "Invalid user id", error: true, success: false });
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: request.params.userId, role: "USER" },
      { status, ...(status === "Active" ? {} : { refresh_token: "" }) },
      { new: true },
    ).select("-password -refresh_token -otp -otpExpires");
    if (!user) {
      return response.status(404).json({ message: "User not found", error: true, success: false });
    }
    return response.json({
      message: `User status updated to ${status}`,
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to update user status",
      error: true,
      success: false,
    });
  }
}

export async function getAdminSellersController(request, response) {
  try {
    await requireAdmin(request.userId);
    const approval = String(request.query.approval || "").trim();
    const filter = { role: "SELLER" };
    if (["pending", "approved", "rejected"].includes(approval)) {
      filter.sellerApprovalStatus = approval;
    }
    const sellers = await UserModel.find(filter)
      .select("-password -refresh_token -otp -otpExpires")
      .sort({ createdAt: -1 })
      .lean();
    const counts = await ProductModel.aggregate([
      { $match: { sellerId: { $in: sellers.map((seller) => seller._id) } } },
      { $group: { _id: "$sellerId", productCount: { $sum: 1 } } },
    ]);
    const countBySeller = new Map(
      counts.map((item) => [String(item._id), item.productCount]),
    );
    return response.json({
      data: sellers.map((seller) => ({
        ...seller,
        productCount: countBySeller.get(String(seller._id)) || 0,
      })),
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to load sellers",
      error: true,
      success: false,
    });
  }
}

export async function getAdminSellerProductsController(request, response) {
  try {
    await requireAdmin(request.userId);
    if (!mongoose.isValidObjectId(request.params.sellerId)) {
      return response.status(400).json({
        message: "Invalid seller id",
        error: true,
        success: false,
      });
    }
    const seller = await UserModel.findOne({
      _id: request.params.sellerId,
      role: "SELLER",
    }).select(
      "name email storeName storeDescription storeLogo storeCover status sellerApprovalStatus",
    );
    if (!seller) {
      return response.status(404).json({
        message: "Seller not found",
        error: true,
        success: false,
      });
    }
    const products = await ProductModel.find({ sellerId: seller._id })
      .populate("category")
      .sort({ createdAt: -1 });
    return response.json({
      data: { seller, products },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to load seller products",
      error: true,
      success: false,
    });
  }
}

export async function reviewSellerController(request, response) {
  try {
    await requireAdmin(request.userId);
    const { approvalStatus, reason = "" } = request.body || {};
    if (!["approved", "rejected"].includes(approvalStatus)) {
      return response.status(400).json({
        message: "Approval status must be approved or rejected",
        error: true,
        success: false,
      });
    }
    if (!mongoose.isValidObjectId(request.params.sellerId)) {
      return response.status(400).json({
        message: "Invalid seller id",
        error: true,
        success: false,
      });
    }
    const seller = await UserModel.findOneAndUpdate(
      { _id: request.params.sellerId, role: "SELLER" },
      {
        sellerApprovalStatus: approvalStatus,
        sellerRejectionReason:
          approvalStatus === "rejected" ? String(reason).trim() : "",
        sellerReviewedAt: new Date(),
        sellerReviewedBy: request.userId,
        refresh_token: "",
      },
      { new: true },
    ).select("-password -refresh_token -otp -otpExpires");
    if (!seller) {
      return response.status(404).json({
        message: "Seller not found",
        error: true,
        success: false,
      });
    }
    return response.json({
      message: `Seller application ${approvalStatus}`,
      data: seller,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to review seller",
      error: true,
      success: false,
    });
  }
}
