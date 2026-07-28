import { Router } from "express";
import {
  registerUserController,
  verifyEmailController,
  loginUserController,
  logoutController,
  userAvatarController,
  removeImageFromCloudinary,
  updateUserDetials,
  changePasswordController,
  forgotPasswordController,
  verifyForgotPasswordOtp,
  resetpassword,
  refreshtoken,
  userDetails,
  googleLoginController,
  getAdminUsersController,
  updateAdminUserStatusController,
  registerSellerController,
  getSellerSessionController,
  getAdminSellersController,
  getAdminSellerProductsController,
  reviewSellerController,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = Router();
userRouter.post("/register", registerUserController);
userRouter.post("/seller/register", registerSellerController);
userRouter.post("/verifyEmail", verifyEmailController);
userRouter.post("/login", loginUserController);
userRouter.post("/google-login", googleLoginController);
userRouter.get("/logout", auth, logoutController);
userRouter.post("/change-password", auth, changePasswordController);
userRouter.put(
  "/user-avatar",
  auth,
  upload.array("avatar"),
  userAvatarController,
);
userRouter.post(
  "/user-avatar",
  auth,
  upload.array("avatar"),
  userAvatarController,
);
userRouter.delete("/deleteImage", auth, removeImageFromCloudinary);
userRouter.put("/:id", auth, updateUserDetials);
userRouter.post("/forgot-password", forgotPasswordController);
userRouter.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
userRouter.post("/reset-password", resetpassword);
userRouter.post("/refresh-token", refreshtoken);
userRouter.get("/user-details", auth, userDetails);
userRouter.get("/seller/session", auth, getSellerSessionController);
userRouter.get("/admin/users", auth, getAdminUsersController);
userRouter.put("/admin/users/:userId/status", auth, updateAdminUserStatusController);
userRouter.get("/admin/sellers", auth, getAdminSellersController);
userRouter.get(
  "/admin/sellers/:sellerId/products",
  auth,
  getAdminSellerProductsController,
);
userRouter.put("/admin/sellers/:sellerId/review", auth, reviewSellerController);

export default userRouter;
