import UserModel from "../models/user.model.js";

export const allowRoles = (...roles) => async (request, response, next) => {
  try {
    const user = await UserModel.findById(request.userId).select(
      "role status sellerApprovalStatus",
    );
    if (!user || user.status !== "Active" || !roles.includes(user.role)) {
      return response.status(403).json({
        message: "You do not have permission to perform this action",
        error: true,
        success: false,
      });
    }
    request.authUser = user;
    next();
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Unable to verify permissions",
      error: true,
      success: false,
    });
  }
};
