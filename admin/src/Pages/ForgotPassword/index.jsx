import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa";
import { postData } from "../../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      window.alert("Please enter your email.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await postData("/api/user/forgot-password", {
        email: normalizedEmail,
      });

      if (response?.error !== true) {
        localStorage.setItem("resetPasswordEmail", normalizedEmail);
        localStorage.setItem("userEmail", normalizedEmail);
        localStorage.setItem("forgotPasswordFlow", "true");

        navigate("/verify-account", {
          state: {
            email: normalizedEmail,
            mode: "forgot-password",
          },
        });
      } else {
        window.alert(response?.message || "Failed to send OTP.");
      }
    } catch (error) {
      window.alert(error?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <img
        src="backlogin.PNG"
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
            <Button className="!rounded-full !px-5 !gap-2 !text-[15px] !font-[600] !text-[rgba(0,0,0,0.8)]">
              <CgLogIn className="text-[18px]" />
              Login
            </Button>
          </NavLink>

          <NavLink to="/sign-up">
            <Button className="!rounded-full !px-5 !gap-2 !text-[15px] !font-[600] !text-[rgba(0,0,0,0.8)]">
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
            Having trouble to sign in?
            <br />
            Reset your password.
          </h1>

          <form className="mt-6 w-full" onSubmit={handleSubmit}>
            <div className="mb-4">
              <h4 className="mb-1 text-[14px] font-[500]">Email</h4>

              <input
                type="email"
                value={email}
                disabled={isLoading}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                className="h-[50px] w-full rounded-sm border-2 border-[rgba(0,0,0,0.1)] px-3 focus:border-[rgba(0,0,0,0.7)] focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !email.trim()}
              className="!h-[45px] !w-full !bg-[#3872fa]"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send OTP"
              )}
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-center">
              <span>Remember Password?</span>
              <Link
                to="/login"
                className="text-[15px] font-[700] text-[#3872fa] hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
