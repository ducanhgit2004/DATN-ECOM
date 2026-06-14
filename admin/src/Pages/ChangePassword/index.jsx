import Button from "@mui/material/Button";
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { BsFacebook } from "react-icons/bs";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const [isPasswordShow, setisPasswordShow] = useState(false);
  const [isPasswordShow2, setisPasswordShow2] = useState(false);

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

          <form className="w-full mt-6">
            <div className="mb-4">
              <h4 className="text-[14px] font-[500] mb-1">New Password</h4>

              <div className="relative w-full">
                <input
                  type={isPasswordShow === false ? "password" : "text"}
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

            <div className="mb-4">
              <h4 className="text-[14px] font-[500] mb-1">Confirm Password</h4>

              <div className="relative w-full">
                <input
                  type={isPasswordShow2 === false ? "password" : "text"}
                  className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-sm px-3 focus:outline-none focus:border-[rgba(0,0,0,0.7)]"
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
              variant="contained"
              className="!w-full !h-[45px] !bg-[#3872fa]"
            >
              Change Password
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChangePassword;
