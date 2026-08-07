import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

import { FaCloudUploadAlt } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

import Radio from "@mui/material/Radio";

import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import { isValidPhone, normalizePhone } from "../../utils/phone";

const DEFAULT_AVATAR = "/Sample_User_Icon.png";

const Profile = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const buildApiUrl = (apiEndPoint = "") => {
    const baseUrl =
      import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000";

    const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");

    const normalizedPath = apiEndPoint.startsWith("/")
      ? apiEndPoint
      : `/${apiEndPoint}`;

    return `${trimmedBaseUrl}${normalizedPath}`;
  };

  const getAccessToken = () => {
    return localStorage.getItem("accesstoken");
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) {
      return DEFAULT_AVATAR;
    }

    if (typeof avatar === "string") {
      return avatar.trim() || DEFAULT_AVATAR;
    }

    if (typeof avatar === "object" && avatar.url) {
      return avatar.url;
    }

    return DEFAULT_AVATAR;
  };

  const parseResponse = async (response) => {
    const responseText = await response.text();

    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        message: responseText,
      };
    }
  };

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      context?.setIsLogin?.(false);
      context?.setUserData?.(null);
      navigate("/login", { replace: true });
    }
  }, [context?.isLogin, navigate]);

  useEffect(() => {
    if (!context?.userData) {
      return;
    }

    const normalizedMobile =
      context.userData.mobile == null ? "" : String(context.userData.mobile);

    setFormData({
      name: context.userData.name || "",
      email: context.userData.email || "",
      mobile: normalizedMobile,
    });

    setAvatarUrl(getAvatarUrl(context.userData.avatar));
  }, [context?.userData]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!context?.userData?._id) {
        return;
      }

      try {
        setIsLoadingAddresses(true);
        const response = await fetchDataFromApi("/api/address/get");

        if (response?.success) {
          const addressList = response.address || [];
          setSavedAddresses(addressList);

          if (addressList.length > 0) {
            setSelectedAddressId(addressList[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to load addresses", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [context?.userData?._id, context?.addressRefreshKey]);

  const isValidImageFile = (file) => {
    if (!file) {
      return false;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const fileName = file.name?.toLowerCase() || "";

    return (
      validTypes.includes(file.type) ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".webp")
    );
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!isValidImageFile(file)) {
      context?.alertBox?.(
        "error",
        "Vui lòng chọn ảnh JPG, JPEG, PNG hoặc WEBP",
      );

      event.target.value = "";
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      context?.alertBox?.("error", "Dung lượng ảnh không được vượt quá 5MB");

      event.target.value = "";
      return;
    }

    const oldAvatarUrl = avatarUrl;
    const localPreviewUrl = URL.createObjectURL(file);

    try {
      setUploading(true);

      // Hiển thị ảnh tạm ngay khi người dùng chọn.
      setAvatarUrl(localPreviewUrl);

      const formDataUpload = new FormData();
      formDataUpload.append("avatar", file);

      const response = await fetch(buildApiUrl("/api/user/user-avatar"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
        credentials: "include",
        body: formDataUpload,
      });

      const data = await parseResponse(response);

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Cập nhật ảnh đại diện thất bại");
      }

      /*
        Backend của bạn có thể trả về một trong các dạng:

        {
          avatar: "https://..."
        }

        {
          avatar: {
            url: "https://...",
            public_id: "..."
          }
        }

        {
          data: {
            avatar: ...
          }
        }

        {
          user: {
            avatar: ...
          }
        }
      */

      const uploadedAvatar =
        data?.avatar ||
        data?.data?.avatar ||
        data?.user?.avatar ||
        data?.data?.user?.avatar;

      const uploadedAvatarUrl = getAvatarUrl(uploadedAvatar);

      if (uploadedAvatarUrl === DEFAULT_AVATAR) {
        throw new Error("Server không trả về đường dẫn avatar hợp lệ");
      }

      const separator = uploadedAvatarUrl.includes("?") ? "&" : "?";
      const cacheBustedUrl = `${uploadedAvatarUrl}${separator}v=${Date.now()}`;

      setAvatarUrl(cacheBustedUrl);

      context?.setUserData?.((previousUserData) => {
        if (!previousUserData) {
          return previousUserData;
        }

        return {
          ...previousUserData,

          // Giữ nguyên object avatar nếu backend trả về object.
          avatar:
            typeof uploadedAvatar === "object"
              ? {
                  ...uploadedAvatar,
                  url: cacheBustedUrl,
                }
              : cacheBustedUrl,
        };
      });

      context?.alertBox?.(
        "success",
        data?.message || "Cập nhật ảnh đại diện thành công",
      );
    } catch (error) {
      console.error("Avatar upload error:", error);

      setAvatarUrl(oldAvatarUrl);

      context?.alertBox?.(
        "error",
        error.message || "Cập nhật ảnh đại diện thất bại",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
      URL.revokeObjectURL(localPreviewUrl);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const validateProfileForm = () => {
    if (!formData.name.trim()) {
      context?.alertBox?.("error", "Vui lòng nhập họ tên");
      return false;
    }

    if (!formData.email.trim()) {
      context?.alertBox?.("error", "Email không được để trống");
      return false;
    }

    if (
      formData.mobile.trim() &&
      !isValidPhone(formData.mobile)
    ) {
      context?.alertBox?.("error", "Số điện thoại không hợp lệ");
      return false;
    }

    return true;
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    const userId = context?.userData?._id;

    if (!userId) {
      context?.alertBox?.(
        "error",
        "Chưa có thông tin người dùng, vui lòng đăng nhập lại",
      );
      return;
    }

    try {
      setIsSavingProfile(true);

      const response = await fetch(buildApiUrl(`/api/user/${userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.trim(),
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Cập nhật hồ sơ thất bại");
      }

      const updatedUser = data?.user ||
        data?.data?.user ||
        data?.data || {
          ...context.userData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.trim(),
        };

      context?.setUserData?.((previousUserData) => ({
        ...previousUserData,
        ...updatedUser,

        // Không để response thiếu avatar làm mất avatar hiện tại.
        avatar: updatedUser?.avatar || previousUserData?.avatar,
      }));

      context?.alertBox?.(
        "success",
        data?.message || "Cập nhật hồ sơ thành công",
      );

      /*
        Nếu backend yêu cầu xác minh khi thay đổi email,
        có thể trả về requiresEmailVerification: true.
      */
      const requiresEmailVerification =
        data?.requiresEmailVerification === true ||
        data?.verifyEmail === true ||
        data?.message?.toLowerCase()?.includes("verify your new email");

      if (requiresEmailVerification) {
        localStorage.setItem("verifyEmail", formData.email.trim());

        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshToken");

        context?.setIsLogin?.(false);
        context?.setUserData?.(null);

        navigate("/verify", {
          replace: true,
          state: {
            email: formData.email.trim(),
          },
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);

      context?.alertBox?.("error", error.message || "Cập nhật hồ sơ thất bại");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileCancel = () => {
    if (!context?.userData) {
      return;
    }

    setFormData({
      name: context.userData.name || "",
      email: context.userData.email || "",
      mobile: context.userData.mobile || "",
    });
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetPasswordForm = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowPassword({
      oldPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPassword((previousState) => ({
      ...previousState,
      [fieldName]: !previousState[fieldName],
    }));
  };

  const togglePasswordForm = () => {
    setIsPasswordFormOpen((previousState) => {
      if (previousState) {
        resetPasswordForm();
      }

      return !previousState;
    });
  };

  const validatePasswordForm = () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      context?.alertBox?.("error", "Please insert all information");
      return false;
    }

    if (newPassword.length < 6) {
      context?.alertBox?.(
        "error",
        "New Password must have at least 6 characters",
      );
      return false;
    }

    if (oldPassword === newPassword) {
      context?.alertBox?.("error", "New password must be different");
      return false;
    }

    if (newPassword !== confirmPassword) {
      context?.alertBox?.("error", "Confirm password is different");
      return false;
    }

    return true;
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      setIsSavingPassword(true);

      const response = await fetch(buildApiUrl("/api/user/change-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        credentials: "include",
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Đổi mật khẩu thất bại");
      }

      context?.alertBox?.(
        "success",
        data?.message || "Đổi mật khẩu thành công",
      );

      resetPasswordForm();
      setIsPasswordFormOpen(false);
    } catch (error) {
      console.error("Password change error:", error);

      context?.alertBox?.("error", error.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const renderPasswordAdornment = (fieldName) => (
    <InputAdornment position="end">
      <IconButton
        type="button"
        edge="end"
        onClick={() => togglePasswordVisibility(fieldName)}
        aria-label={showPassword[fieldName] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {showPassword[fieldName] ? <IoMdEyeOff /> : <IoMdEye />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <section className="w-full py-5">
      <div className="w-full">
        {/* Avatar và thông tin tài khoản */}
        <div className="card mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="group relative flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              {uploading ? (
                <CircularProgress color="inherit" />
              ) : (
                <img
                  src={avatarUrl}
                  alt="Ảnh đại diện"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
              )}

              <button
                type="button"
                className={`absolute inset-0 flex cursor-pointer items-center justify-center bg-[rgba(0,0,0,0.65)] opacity-0 transition-all group-hover:opacity-100 ${
                  uploading ? "pointer-events-none" : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Thay đổi ảnh đại diện"
              >
                <FaCloudUploadAlt className="text-[28px] text-white" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={uploading}
                name="avatar"
              />
            </div>

            <div>
              <h2 className="text-[20px] font-semibold">
                {context?.userData?.name || "User Profile"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {context?.userData?.email || "Chưa có email"}
              </p>

              <Button
                type="button"
                variant="outlined"
                className="!mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                startIcon={
                  uploading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <FaCloudUploadAlt />
                  )
                }
              >
                {uploading ? "Uploading...." : "Upload"}
              </Button>
            </div>
          </div>
        </div>

        {/* Form cập nhật thông tin */}
        <div className="card mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-md">
          <div className="flex items-center gap-3 pb-3">
            <h2 className="text-[20px] font-semibold">User Profile</h2>

            <Button
              type="button"
              className="ml-auto!"
              onClick={togglePasswordForm}
            >
              {isPasswordFormOpen ? "CHANGE PASSWORD" : "CHANGE PASSWORD"}
            </Button>
          </div>

          <hr className="border-gray-200" />

          <form className="mt-6" onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                variant="outlined"
                size="small"
                className="w-full"
                required
                disabled={isSavingProfile}
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleProfileChange}
                variant="outlined"
                size="small"
                className="w-full"
                disabled
              />

              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <PhoneInput
                  defaultCountry="us"
                  value={
                    typeof formData.mobile === "string"
                      ? formData.mobile
                      : String(formData.mobile ?? "")
                  }
                  onChange={(value) => {
                    setFormData((previousData) => ({
                      ...previousData,
                      mobile: normalizePhone(value),
                    }));
                  }}
                  inputClassName="!w-full"
                  countrySelectorStyleProps={{
                    buttonClassName: "!border-gray-300",
                  }}
                  disabled={isSavingProfile}
                />
              </div>
            </div>

            <br />

            <div
              className="flex items-center justify-center p-5 border border-dashed
                  border-[rgba(0,0,0,0.2) bg-[#f1faff] hover:bg-[#e7f3f9] cursor-pointer"
              onClick={() =>
                context.setIsOpenFullScreenPanel({
                  open: true,
                  model: "Add New Address",
                })
              }
            >
              <span className="text-[14px] font-[500]">Add Address</span>
            </div>

            <br />
            <div className="w-full rounded-md border border-gray-200 bg-[#f8f8f8] p-4">
              <p className="mb-2 text-sm font-semibold text-gray-800">
                Saved addresses
              </p>

              {isLoadingAddresses ? (
                <p className="text-sm text-gray-500">Loading addresses...</p>
              ) : savedAddresses.length > 0 ? (
                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <label
                      key={address._id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-3"
                    >
                      <Radio
                        checked={selectedAddressId === address._id}
                        onChange={() => setSelectedAddressId(address._id)}
                        color="primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {address.address_line1}, {address.city},{" "}
                          {address.state}
                        </p>
                        <p className="text-sm text-gray-500">
                          {address.country} - {address.pincode}
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone: {address.mobile}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No saved addresses yet. Add one to see it here.
                </p>
              )}
            </div>

            <br />
            <div className="mt-6 flex items-center gap-4">
              <Button
                type="submit"
                variant="contained"
                className="btn-org !min-w-[120px]"
                disabled={isSavingProfile}
                startIcon={
                  isSavingProfile ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {isSavingProfile ? "SAVE CHANGE..." : "SAVE CHANGE"}
              </Button>

              <Button
                type="button"
                variant="outlined"
                className="!min-w-[100px]"
                onClick={handleProfileCancel}
                disabled={isSavingProfile}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Form đổi mật khẩu */}
        {isPasswordFormOpen && (
          <div className="card rounded-lg border border-gray-200 bg-white p-5 shadow-md">
            <div className="pb-3">
              <h2 className="text-[20px] font-semibold">Change Password</h2>
            </div>

            <hr className="border-gray-200" />

            <form className="mt-6" onSubmit={handlePasswordSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextField
                  label="Password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  type={showPassword.oldPassword ? "text" : "password"}
                  variant="outlined"
                  size="small"
                  className="w-full"
                  disabled={isSavingPassword}
                  InputProps={{
                    endAdornment: renderPasswordAdornment("oldPassword"),
                  }}
                />

                <TextField
                  label="New Password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  type={showPassword.newPassword ? "text" : "password"}
                  variant="outlined"
                  size="small"
                  className="w-full"
                  disabled={isSavingPassword}
                  helperText="Password must have at least 6 characters"
                  InputProps={{
                    endAdornment: renderPasswordAdornment("newPassword"),
                  }}
                />

                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  type={showPassword.confirmPassword ? "text" : "password"}
                  variant="outlined"
                  size="small"
                  className="w-full"
                  disabled={isSavingPassword}
                  InputProps={{
                    endAdornment: renderPasswordAdornment("confirmPassword"),
                  }}
                />
              </div>

              <div className="mt-6 flex items-center gap-4">
                <Button
                  type="submit"
                  variant="contained"
                  className="btn-org !min-w-[180px]"
                  disabled={isSavingPassword}
                  startIcon={
                    isSavingPassword ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  {isSavingPassword ? "Change Password..." : "Change Password"}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  className="!min-w-[100px]"
                  onClick={resetPasswordForm}
                  disabled={isSavingPassword}
                >
                  Delete Form
                </Button>

                <Button
                  type="button"
                  color="inherit"
                  onClick={togglePasswordForm}
                  disabled={isSavingPassword}
                >
                  Close
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;
