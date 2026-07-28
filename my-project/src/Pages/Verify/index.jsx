import React, { useEffect, useState, useContext } from "react";
import OtpBox from "../../components/OtpBox";
import { Button } from "@mui/material";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const context = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      context.alertBox("error", "Email not found. Please register again.");
      navigate("/register");
    } else {
      setUserEmail(email);
    }
  }, []);

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const verifyOTP = (e) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      context.alertBox("error", "Please enter valid OTP");
      return;
    }

    setIsLoading(true);

    const isForgotPasswordFlow =
      localStorage.getItem("forgotPasswordFlow") === "true";
    const endpoint = isForgotPasswordFlow
      ? "/api/user/verify-forgot-password-otp"
      : "/api/user/verifyEmail";

    postData(endpoint, {
      email: userEmail,
      otp: otp,
    })
      .then((res) => {
        console.log("Verify response:", res);
        if (res?.error === false || res?.success) {
          context.alertBox(
            "success",
            res?.message || "OTP verified successfully!",
          );

          if (isForgotPasswordFlow) {
            localStorage.removeItem("forgotPasswordFlow");
            setTimeout(() => {
              navigate("/forgot-password");
            }, 1500);
          } else {
            localStorage.removeItem("userEmail");
            setTimeout(() => {
              navigate("/login");
            }, 1500);
          }
        } else {
          context.alertBox("error", res?.message || "OTP verification failed");
        }
      })
      .catch((error) => {
        console.error("Verify error:", error);
        context.alertBox("error", error?.message || "Verification failed");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <section className="section py-10">
      <div className="container">
        <div className="card shadow-md w-[400px] m-auto rounded-md bg-white p-5 px-10">
          <div className="text-center flex items-center justify-center">
            <img src="/verify2.png" width="80" />
          </div>
          <h3 className="text-center text-[18px] font-[600] text-black mt-4 mb-1">
            Verify OTP
          </h3>

          <p className="text-center mt-0 mb-4">
            OTP sent to{" "}
            <span className="text-[#ff5252] font-bold">
              {userEmail || "loading..."}
            </span>
          </p>

          <form onSubmit={verifyOTP}>
            <OtpBox length={6} onChange={handleOtpChange} />

            <div className="flex items-center justify-center mt-5 px-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-org brn-lg"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Verify;
