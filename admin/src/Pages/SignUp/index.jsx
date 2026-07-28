import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { CgLogIn } from "react-icons/cg";
import { FaRegUser, FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { BsFacebook } from "react-icons/bs";

import { postData } from "../../utils/api";

const SignUp = () => {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [isPasswordShow, setIsPasswordShow] = useState(false);

  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const onChangeInput = (event) => {
    const { name, value } = event.target;

    setFormFields((previousValue) => ({
      ...previousValue,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validValue = Object.values(formFields).every(
    (value) => value.trim() !== "",
  );

  const handleClickGoogle = () => {
    setLoadingGoogle(true);

    // Chưa có xử lý đăng nhập Google
    setTimeout(() => {
      setLoadingGoogle(false);
    }, 500);
  };

  const handleClickFacebook = () => {
    setLoadingFacebook(true);

    // Chưa có xử lý đăng nhập Facebook
    setTimeout(() => {
      setLoadingFacebook(false);
    }, 500);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formFields.name.trim(),
      email: formFields.email.trim().toLowerCase(),
      password: formFields.password,
    };

    if (!payload.name || !payload.email || !payload.password) {
      setError("Please insert Email, Password");
      return;
    }

    if (payload.password.length < 6) {
      setError("Password must have at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await postData("/api/user/register", payload);

      console.log("Register response:", response);

      if (!response || response.error || response.success === false) {
        const message =
          response?.message ||
          response?.statusText ||
          `Đăng ký thất bại (${response?.status || "unknown"})`;

        setError(message);
        return;
      }

      // Lưu email để trang VerifyAccount sử dụng.
      localStorage.setItem("verifyEmail", payload.email);

      navigate("/verify-account", {
        state: {
          email: payload.email,
        },
      });
    } catch (error) {
      console.error("SignUp error:", error);

      setError(
        error?.message || "Có lỗi xảy ra trong quá trình đăng ký tài khoản.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <img
        src="/backlogin.PNG"
        alt="background"
        className="fixed inset-0 -z-10 h-full w-full object-cover opacity-5"
      />

      <header className="fixed left-0 top-0 z-50 flex w-full items-center justify-between px-6 py-4">
        <Link to="/">
          <img
            src="https://ecme-react.themenate.net/img/logo/logo-light-full.png"
            alt="logo"
            className="w-[150px]"
          />
        </Link>

        <div className="flex items-center">
          <NavLink to="/login">
            <Button className="!gap-2 !rounded-full !px-5 !text-[15px] !font-[600] !text-[rgba(0,0,0,0.8)]">
              <CgLogIn className="text-[18px]" />
              Login
            </Button>
          </NavLink>

          <NavLink to="/sign-up">
            <Button className="!gap-2 !rounded-full !px-5 !text-[15px] !font-[600] !text-[rgba(0,0,0,0.8)]">
              <FaRegUser className="text-[15px]" />
              Sign Up
            </Button>
          </NavLink>
        </div>
      </header>

      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="relative z-50 w-full max-w-[600px]">
          <div className="text-center">
            <img
              src="https://isomorphic-furyroad.vercel.app/_next/static/media/logo-primary.f9d5d4f7.svg"
              alt="icon"
              className="mx-auto"
            />
          </div>

          <h1 className="mt-4 text-center text-[35px] font-[800] leading-tight">
            Join us today! Get special
            <br />
            benefits and stay up-to-date.
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="small"
              onClick={handleClickGoogle}
              endIcon={<FcGoogle />}
              loading={loadingGoogle}
              loadingPosition="end"
              variant="outlined"
              className="!px-5 !py-2 !text-[15px] !font-[600] !capitalize !text-[rgba(0,0,0,0.7)]"
            >
              Sign in With Google
            </Button>

            <Button
              size="small"
              onClick={handleClickFacebook}
              endIcon={<BsFacebook />}
              loading={loadingFacebook}
              loadingPosition="end"
              variant="outlined"
              className="!px-5 !py-2 !text-[15px] !font-[600] !capitalize !text-[rgba(0,0,0,0.7)]"
            >
              Sign in With Facebook
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="h-[1px] w-[100px] bg-[rgba(0,0,0,0.2)]" />

            <span className="whitespace-nowrap text-[15px] font-[500]">
              Or, sign up with your email
            </span>

            <span className="h-[1px] w-[100px] bg-[rgba(0,0,0,0.2)]" />
          </div>

          <form className="mt-6 w-full" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            <div className="mb-4">
              <h4 className="mb-1 text-[14px] font-[500]">Full Name</h4>

              <input
                type="text"
                name="name"
                value={formFields.name}
                disabled={isLoading}
                onChange={onChangeInput}
                autoComplete="name"
                className="h-[50px] w-full rounded-sm border-2 border-[rgba(0,0,0,0.1)] px-3 focus:border-[rgba(0,0,0,0.7)] focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <h4 className="mb-1 text-[14px] font-[500]">Email</h4>

              <input
                type="email"
                name="email"
                value={formFields.email}
                disabled={isLoading}
                onChange={onChangeInput}
                autoComplete="email"
                className="h-[50px] w-full rounded-sm border-2 border-[rgba(0,0,0,0.1)] px-3 focus:border-[rgba(0,0,0,0.7)] focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <h4 className="mb-1 text-[14px] font-[500]">Password</h4>

              <div className="relative w-full">
                <input
                  type={isPasswordShow ? "text" : "password"}
                  name="password"
                  value={formFields.password}
                  disabled={isLoading}
                  onChange={onChangeInput}
                  autoComplete="new-password"
                  className="h-[50px] w-full rounded-sm border-2 border-[rgba(0,0,0,0.1)] px-3 pr-[55px] focus:border-[rgba(0,0,0,0.7)] focus:outline-none"
                />

                <Button
                  type="button"
                  disabled={isLoading}
                  className="!absolute !right-[10px] !top-[7px] !z-50 !h-[35px] !w-[35px] !min-w-[35px] !rounded-full !text-gray-600"
                  onClick={() =>
                    setIsPasswordShow((previousValue) => !previousValue)
                  }
                >
                  {isPasswordShow ? (
                    <FaEyeSlash className="text-[18px]" />
                  ) : (
                    <FaRegEye className="text-[18px]" />
                  )}
                </Button>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Remember me"
              />

              <Link
                to="/forgot-password"
                className="text-[15px] font-[700] text-[#3872fa] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={!validValue || isLoading}
              variant="contained"
              className="!h-[45px] !w-full !bg-[#3872fa]"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
