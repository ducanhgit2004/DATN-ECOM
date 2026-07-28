import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { BsFacebook } from "react-icons/bs";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { postData } from "../../utils/api";
import { MyContext } from "../../App.jsx";

const Login = () => {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingfb, setLoadingfb] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [error, setError] = useState("");

  const [isPasswordShow, setisPasswordShow] = useState(false);
  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const context = useContext(MyContext);

  const showAlert = (type, message) => {
    if (context?.alertBox) {
      context.alertBox(type, message);
    }
  };

  const handleClickGoogle = () => {
    setLoadingGoogle(true);
  };

  const handleClickfb = () => {
    setLoadingfb(true);
  };

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const forgotPassword = async () => {
    const email = formFields.email.trim().toLowerCase();

    if (!email) {
      showAlert("error", "Please enter your email first");
      return;
    }

    try {
      setIsForgotLoading(true);

      const response = await postData("/api/user/forgot-password", {
        email,
      });

      if (response?.error !== true) {
        showAlert("success", response?.message || "OTP sent to your email");

        localStorage.setItem("userEmail", email);
        localStorage.setItem("resetPasswordEmail", email);
        localStorage.setItem("forgotPasswordFlow", "true");

        navigate("/verify-account", {
          state: {
            email,
            mode: "forgot-password",
          },
        });
      } else {
        showAlert("error", response?.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showAlert("error", error?.message || "Failed to send OTP");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formFields.email || !formFields.password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setIsLoading(true);

    const response = await postData("/api/user/login", formFields);

    if (response.error || response.success === false) {
      const message =
        response.message ||
        response.statusText ||
        `Đăng nhập thất bại (${response.status || "unknown"}).`;
      console.error("Login error:", response);
      setError(message);
      setIsLoading(false);
      return;
    }

    if (response.data?.accesstoken) {
      localStorage.setItem("accesstoken", response.data.accesstoken);
    }

    context?.setIslogin?.(true);
    if (response?.data?.accesstoken) {
      try {
        const profileResponse = await postData("/api/user/user-details", {});
        if (!profileResponse?.error && profileResponse?.data) {
          context?.setUserData?.(profileResponse.data);
        }
      } catch (error) {
        console.error("Failed to load user profile after login:", error);
      }
    }
    setIsLoading(false);
    navigate("/");
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
              Sign in with your credentials.
            </span>
          </h1>

          <div className="flex items-center justify-center flex-wrap gap-4 mt-6">
            <Button
              size="small"
              onClick={handleClickGoogle}
              endIcon={<FcGoogle />}
              loading={loadingGoogle}
              loadingPosition="end"
              variant="outlined"
              className="!py-2 !text-[15px] !capitalize !px-5 !font-[600] !text-[rgba(0,0,0,0.7)]"
            >
              Signin With Google
            </Button>

            <Button
              size="small"
              onClick={handleClickfb}
              endIcon={<BsFacebook />}
              loading={loadingfb}
              loadingPosition="end"
              variant="outlined"
              className="!py-2 !text-[15px] !capitalize !px-5 !font-[600] !text-[rgba(0,0,0,0.7)]"
            >
              Signin With Facebook
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>

            <span className="text-[15px] font-[500] whitespace-nowrap">
              Or, Sign in with your email
            </span>

            <span className="w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
          </div>

          <form className="w-full mt-6" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}
            <div className="mb-4">
              <h4 className="text-[14px] font-[500] mb-1">Email</h4>

              <input
                type="email"
                name="email"
                autoComplete="new-email"
                value={formFields.email}
                onChange={onChangeInput}
                disabled={isLoading}
                className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-sm px-3 focus:outline-none focus:border-[rgba(0,0,0,0.7)]"
              />
            </div>

            <div className="mb-4">
              <h4 className="text-[14px] font-[500] mb-1">Password</h4>

              <div className="relative w-full">
                <input
                  type={isPasswordShow === false ? "password" : "text"}
                  name="password"
                  autoComplete="new-password"
                  value={formFields.password}
                  onChange={onChangeInput}
                  disabled={isLoading}
                  className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-sm px-3 focus:outline-none focus:border-[rgba(0,0,0,0.7)]"
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

            <div className="flex items-center justify-between mb-5">
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Remember me"
              />

              <button
                type="button"
                onClick={forgotPassword}
                disabled={isForgotLoading}
                className="flex items-center gap-2 text-[15px] font-[700] text-[#3872fa] hover:underline disabled:opacity-60"
              >
                {isForgotLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null}
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="contained"
              className="!w-full !h-[45px] !bg-[#3872fa]"
            >
              {isLoading ? "Loading..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
