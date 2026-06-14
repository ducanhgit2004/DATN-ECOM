import Button from "@mui/material/Button";
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa";

import OtpBox from "../../components/OtpBox";

const VerifyAccount = () => {
  const [otp, setOtp] = useState("");
  const handleOtpChange = (value) => {
    setOtp(value);
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
          <NavLink to="/login" exact={true} activeClassName="isActive">
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 !gap-2 !text-[15px] !font-[600]">
              <CgLogIn className="text-[18px]" />
              Login
            </Button>
          </NavLink>

          <NavLink to="/sign-up" exact={true} activeClassName="isActive">
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
            <img src="/verify3.png" className="w-[100px] m-auto " />
          </div>

          <h1 className="text-center text-[35px] font-[800] mt-4 leading-tight">
            Welcome Back!
            <br />
            <span className="text-[#3872fa]">Please Verify your Email</span>
          </h1>

          <br />

          <p className="text-center text-[15px]">
            OTP send to{" "}
            <span className="text-[#3872fa] font-bold">
              nducanh485@gmail.com
            </span>
          </p>
          <br />

          <div className="text-center flex items-center justify-center flex-col">
            <OtpBox length={6} onChange={handleOtpChange} />
          </div>

          <br />

          <div className="w-[300px] m-auto">
            <Button className="btn-blue w-full">Verify OTP</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyAccount;
