import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useContext } from "react";
import { MyContext } from "../../App.jsx";
import { postData } from "../../utils/api";

const ChangePassword = () => {
  const [isPasswordShow, setisPasswordShow] = useState(false);
  const [isPasswordShow2, setisPasswordShow2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const context = useContext(MyContext);

  const showAlert = (type, message) => {
    if (context?.alertBox) {
      context.alertBox(type, message);
    } else if (typeof window !== "undefined" && window.alert) {
      window.alert(`${String(type || "info").toUpperCase()}: ${message}`);
    }
  };

  useEffect(() => {
    const storedEmail =
      localStorage.getItem("userEmail") ||
      localStorage.getItem("resetPasswordEmail") ||
      "";

    if (storedEmail) {
      setFormFields((prev) => ({ ...prev, email: storedEmail }));
    }
  }, []);

  const handleInputChange = (e) => {
    setFormFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formFields.email.trim()) {
      showAlert("error", "Please enter your email");
      return;
    }

    if (!formFields.password.trim()) {
      showAlert("error", "Please enter a new password");
      return;
    }

    if (formFields.password !== formFields.confirmPassword) {
      showAlert("error", "Confirm password does not match");
      return;
    }

    try {
      setIsLoading(true);
      const response = await postData("/api/user/reset-password", {
        email: formFields.email.trim(),
        newPassword: formFields.password,
        confirmPassword: formFields.confirmPassword,
      });

      if (response?.error !== true) {
        showAlert(
          "success",
          response?.message || "Password updated successfully",
        );
        localStorage.removeItem("userEmail");
        localStorage.removeItem("resetPasswordEmail");
        localStorage.removeItem("forgotPasswordFlow");
        setFormFields({ email: "", password: "", confirmPassword: "" });
        navigate("/login");
      } else {
        showAlert("error", response?.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showAlert("error", error?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen w-full  overflow-hidden">
      {/* Background */}
      <img
        src="backlogin.PNG"
        alt="background"
        className="fixed inset-0 w-full h-full object-cover opacity-5 -z-10"
      />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full px-6 py-4 flex items-center justify-between z-50">
        <Link to="/">
          <img
            src="https://ecme-react.themenate.net/img/logo/logo-light-full.png"
            alt="logo"
            className="w-[150px]"
          />
        </Link>

        <div className="flex items-center">
          <NavLink to="/login">
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 !gap-2 !text-[15px] !font-[600]">
              <CgLogIn className="text-[18px]" />
              Login
            </Button>
          </NavLink>

          <NavLink to="/sign-up">
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 !gap-2 !text-[15px] !font-[600]">
              <FaRegUser className="text-[15px]" />
              Sign Up
            </Button>
          </NavLink>
        </div>
      </header>

      {/* Login Form */}
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-[600px] relative z-50">
          <div className="text-center">
            <img
              src="https://isomorphic-furyroad.vercel.app/_next/static/media/logo-primary.f9d5d4f7.svg"
              alt="icon"
              className="mx-auto"
            />
          </div>

          <h1 className="text-center text-[35px] font-[800] mt-4 leading-tight">
            Welcome Back!
            <br />
            <span className="text-[#3872fa]">
              Your can change your password from here
            </span>
          </h1>

          <form className="w-full mt-6 " onSubmit={handleLogin}>
            <div className="mb-4">
              <h4 className="text-[14px] font-[500] mb-1">New Password</h4>

              <div className="relative w-full">
                <input
                  className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-sm px-3 focus:outline-none focus:border-[rgba(0,0,0,0.7)]"
                  name="password"
                  type={isPasswordShow ? "text" : "password"}
                  value={formFields.password}
                  onChange={handleInputChange}
                />
                <Button
                  className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px]
                !h-[35px] !min-w-[35px] !text-gray-600"
                  onClick={() => setisPasswordShow(!isPasswordShow)}
                >
                  {isPasswordShow === false ? (
                    <FaRegEye className="text-[18px]" />
                  ) : (
                    <FaEyeSlash className="text-[18px]" />
                  )}
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-[14px] font-[500] mb-1">Confirm Password</h4>

              <div className="relative w-full">
                <input
                  className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-sm px-3 focus:outline-none focus:border-[rgba(0,0,0,0.7)]"
                  name="confirmPassword"
                  type={isPasswordShow2 ? "text" : "password"}
                  value={formFields.confirmPassword}
                  onChange={handleInputChange}
                />
                <Button
                  className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px]
                !h-[35px] !min-w-[35px] !text-gray-600"
                  onClick={() => setisPasswordShow2(!isPasswordShow2)}
                >
                  {isPasswordShow2 === false ? (
                    <FaRegEye className="text-[18px]" />
                  ) : (
                    <FaEyeSlash className="text-[18px]" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              className="!w-full !h-[45px] !bg-[#3872fa]"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChangePassword;
