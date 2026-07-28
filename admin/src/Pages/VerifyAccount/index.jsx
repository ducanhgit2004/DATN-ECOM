import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa";

import OtpBox from "../../components/OtpBox";
import { postData } from "../../utils/api";

const VerifyAccount = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = useMemo(() => {
    const emailFromState = location.state?.email;
    const emailFromStorage =
      localStorage.getItem("verifyEmail") ||
      localStorage.getItem("resetPasswordEmail");

    return String(emailFromState || emailFromStorage || "")
      .trim()
      .toLowerCase();
  }, [location.state]);

  const isForgotPasswordFlow = useMemo(() => {
    return (
      location.state?.mode === "forgot-password" ||
      localStorage.getItem("forgotPasswordFlow") === "true"
    );
  }, [location.state]);

  const handleOtpChange = (value) => {
    const normalizedOtp = String(value || "")
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(normalizedOtp);
  };

  const handleVerifyOtp = async () => {
    if (!email) {
      toast.error("Email not found. Please return to the login page.");
      return;
    }

    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("The OTP must contain exactly 6 digits.");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        email,
        otp,
      };

      const endpoint = isForgotPasswordFlow
        ? "/api/user/verify-forgot-password-otp"
        : "/api/user/verifyEmail";

      const response = await postData(endpoint, payload);

      if (!response) {
        toast.error("No response was received from the server.");
        return;
      }

      if (response.error === true || response.success === false) {
        toast.error(
          response.message || response.statusText || "OTP verification failed.",
        );
        return;
      }

      localStorage.removeItem("verifyEmail");

      if (isForgotPasswordFlow) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("resetPasswordEmail", email);
        toast.success(
          response.message || "OTP verified. You can now set a new password.",
        );
        setTimeout(() => {
          navigate("/change-password", { replace: true });
        }, 800);
      } else {
        toast.success(response.message || "Account verified successfully.");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1000);
      }
    } catch (error) {
      console.error("Verify OTP error:", error);

      toast.error(
        error?.message || "An error occurred during OTP verification.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleVerifyOtp();
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
              src="/verify3.png"
              alt="verify email"
              className="m-auto w-[100px]"
            />
          </div>

          <h1 className="mt-4 text-center text-[35px] font-[800] leading-tight">
            Welcome Back!
            <br />
            <span className="text-[#3872fa]">Please Verify your Email</span>
          </h1>

          <p className="mt-6 text-center text-[15px]">
            OTP sent to{" "}
            <span className="font-bold text-[#3872fa]">
              {email || "Email not found"}
            </span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mt-6 flex flex-col items-center justify-center text-center">
              <OtpBox length={6} onChange={handleOtpChange} />
            </div>

            <div className="m-auto mt-6 w-[300px]">
              <Button
                type="submit"
                variant="contained"
                className="btn-blue !h-[45px] !w-full !bg-[#3872fa]"
                disabled={isLoading || otp.length !== 6 || !email}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </div>
          </form>

          {!email && (
            <div className="mt-5 text-center">
              <Link
                to="/sign-up"
                className="font-[600] text-[#3872fa] hover:underline"
              >
                Return to sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VerifyAccount;
