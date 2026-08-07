import Button from "@mui/material/Button";
import React, { useContext, useEffect, useState } from "react";

import TextField from "@mui/material/TextField";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";

import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { isValidPhone, normalizePhone } from "../../utils/phone";

const MyAccount = () => {
  const context = useContext(MyContext);
  const [isSaving2, setIsSaving2] = useState(false);
  const history = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [changePassword, setChangePassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");

    if (!token) {
      history("/login");
    }
  }, [context?.isLogin, history]);

  useEffect(() => {
    if (context?.userData) {
      setFormData({
        name: context.userData.name || "",
        email: context.userData.email || "",
        mobile: context.userData.mobile || "",
      });
    }
  }, [context?.userData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setChangePassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!isValidPhone(formData.mobile)) {
      context?.alertBox?.("error", "Phone number must contain 9 to 15 digits.");
      return;
    }

    if (!context?.userData?._id) {
      context?.alertBox?.("error", "User data is not available yet");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/${context.userData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success !== false) {
        const updatedUser = data?.user || data?.data || context.userData;
        context?.setUserData?.(updatedUser);
        context?.alertBox?.(
          "success",
          data?.message || "Profile updated successfully",
        );

        if (data?.message?.includes("Please verify your new email")) {
          localStorage.removeItem("accesstoken");
          localStorage.removeItem("refreshToken");
          context?.setIsLogin?.(false);
          context?.setUserData?.(null);
          history("/verify");
        }
      } else {
        context?.alertBox?.("error", data?.message || "Profile update failed");
      }
    } catch (error) {
      console.error(error);
      context?.alertBox?.("error", "Profile update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!context?.userData?._id) {
      context?.alertBox?.("error", "User data is not available yet");
      return;
    }

    if (
      !changePassword.oldPassword ||
      !changePassword.newPassword ||
      !changePassword.confirmPassword
    ) {
      context?.alertBox?.("error", "All password fields are required");
      return;
    }

    if (changePassword.newPassword !== changePassword.confirmPassword) {
      context?.alertBox?.(
        "error",
        "New password and confirm password do not match",
      );
      return;
    }

    try {
      setIsSaving2(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            oldPassword: changePassword.oldPassword,
            newPassword: changePassword.newPassword,
            confirmPassword: changePassword.confirmPassword,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success !== false) {
        context?.alertBox?.(
          "success",
          data?.message || "Password changed successfully",
        );
        setChangePassword({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        context?.alertBox?.("error", data?.message || "Password change failed");
      }
    } catch (error) {
      console.error(error);
      context?.alertBox?.("error", "Password change failed");
    } finally {
      setIsSaving2(false);
    }
  };

  const handleProfileCancel = () => {
    if (context?.userData) {
      setFormData({
        name: context.userData.name || "",
        email: context.userData.email || "",
        mobile: context.userData.mobile || "",
      });
    }
  };

  const handlePasswordCancel = () => {
    setChangePassword({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const togglePasswordForm = () => {
    setIsPasswordFormOpen((prev) => {
      if (prev) {
        handlePasswordCancel();
      }
      return !prev;
    });
  };

  return (
    <section className="py-10 w-full">
      <div className="container flex gap-5">
        <div className="col1 w-[20%]">
          <AccountSidebar />
        </div>

        <div className="col2 w-[50%]">
          <div className="card bg-white p-5 shadow-md rounded-md mb-5">
            <div className="flex items-center pb-3">
              <h2 className="pb-0">My Profile</h2>
              <Button className="!ml-auto" onClick={togglePasswordForm}>
                {isPasswordFormOpen
                  ? "Hide Change Password"
                  : "Change Password"}
              </Button>
            </div>
            <hr className="text-[rgba(0,0,0,0.2)]" />

            <form className="mt-8" onSubmit={handleProfileSubmit}>
              <div className="flex items-center gap-5">
                <div className="w-[50%]">
                  <TextField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    variant="outlined"
                    size="small"
                    className="w-full"
                  />
                </div>

                <div className="w-[50%]">
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    variant="outlined"
                    size="small"
                    className="w-full"
                    disabled
                  />
                </div>
              </div>

              <div className="flex items-center mt-4 gap-5">
                <div className="w-[50%]">
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
                    disabled={isSaving}
                  />
                </div>
              </div>

              <br />

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  className="btn-org btn-lg w-[100px]"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  className="btn-org btn-border btn-lg w-[100px]"
                  onClick={handleProfileCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {isPasswordFormOpen && (
            <div className="card bg-white p-5 shadow-md rounded-md">
              <div className="flex items-center pb-3">
                <h2 className="pb-0">Change Password</h2>
              </div>
              <hr className="text-[rgba(0,0,0,0.2)]" />

              <form className="mt-8" onSubmit={handlePasswordSubmit}>
                <div className="flex items-center gap-5">
                  <div className="w-[50%]">
                    <TextField
                      label="Old Password"
                      name="oldPassword"
                      value={changePassword.oldPassword}
                      onChange={handlePasswordChange}
                      type="password"
                      variant="outlined"
                      size="small"
                      className="w-full"
                    />
                  </div>

                  <div className="w-[50%]">
                    <TextField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={changePassword.newPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      size="small"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center mt-4 gap-5">
                  <div className="w-[50%]">
                    <TextField
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={changePassword.confirmPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      size="small"
                      className="w-full"
                    />
                  </div>
                </div>

                <br />

                <div className="flex items-center gap-4">
                  <Button
                    type="submit"
                    className="btn-org btn-lg w-[200px]"
                    disabled={isSaving2}
                  >
                    {isSaving2 ? "Change Password..." : "Change Password"}
                  </Button>
                  <Button
                    type="button"
                    className="btn-org btn-border btn-lg w-[100px]"
                    onClick={handlePasswordCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
