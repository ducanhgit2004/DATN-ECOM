// src/components/ForgotPassword.jsx
import React, { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MyContext } from "../../App";

const ForgotPassword = () => {
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isPasswordShow2, setIsPasswordShow2] = useState(false);

  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const context = useContext(MyContext);

  const handleInputChange = (e) => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value,
    });
  };

  const forgotPassword = () => {
    navigate("/verify");

    if (context?.openAlertBox) {
      context.openAlertBox("success", "OTP Sent");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // kiểm tra confirm password
    if (formFields.password !== formFields.confirmPassword) {
      context?.openAlertBox?.("error", "Confirm password does not match");
      return;
    }

    console.log("Change password:", formFields);

    // TODO: API change password
  };

  return (
    <section className="section py-10">
      <div className="container">
        <div className="card shadow-md w-[400px] m-auto rounded-md bg-white p-5 px-10">
          <h3 className="text-center text-[18px] font-[600] text-black">
            Forgot Password
          </h3>

          <form
            className="w-full mt-5 relative"
            autoComplete="off"
            onSubmit={handleLogin}
          >
            {/* Email */}
            <div className="form-group w-full mb-5 relative">
              <TextField
                type="email"
                id="email"
                name="email"
                value={formFields.email}
                onChange={handleInputChange}
                label="Email Id *"
                variant="outlined"
                className="w-full"
                autoComplete="off"
              />
            </div>

            {/* Password */}
            <div className="form-group w-full mb-5 relative">
              <TextField
                id="password"
                name="password"
                type={isPasswordShow ? "text" : "password"}
                value={formFields.password}
                onChange={handleInputChange}
                label="Password *"
                variant="outlined"
                className="w-full"
                autoComplete="new-password"
              />

              <Button
                type="button"
                onClick={() => setIsPasswordShow(!isPasswordShow)}
                className="!absolute top-[10px] right-[5px] z-50
                !w-[35px] !h-[35px] !min-w-[35px]
                !rounded-full !text-black"
              >
                {isPasswordShow ? (
                  <IoMdEye className="text-[20px] opacity-75" />
                ) : (
                  <IoMdEyeOff className="text-[20px] opacity-75" />
                )}
              </Button>
            </div>

            {/* Confirm Password */}
            <div className="form-group w-full mb-5 relative">
              <TextField
                id="confirmpassword"
                name="confirmPassword"
                type={isPasswordShow2 ? "text" : "password"}
                value={formFields.confirmPassword}
                onChange={handleInputChange}
                label="Confirm Password *"
                variant="outlined"
                className="w-full"
                autoComplete="new-password"
              />

              <Button
                type="button"
                onClick={() => setIsPasswordShow2(!isPasswordShow2)}
                className="!absolute top-[10px] right-[5px] z-50
                !w-[35px] !h-[35px] !min-w-[35px]
                !rounded-full !text-black"
              >
                {isPasswordShow2 ? (
                  <IoMdEye className="text-[20px] opacity-75" />
                ) : (
                  <IoMdEyeOff className="text-[20px] opacity-75" />
                )}
              </Button>
            </div>

            <div className="flex items-center w-full mt-3 mb-3">
              <Button type="submit" className="btn-org btn-lg w-full">
                Change Password
              </Button>
            </div>

            <p className="text-center mb-3">
              Not Registered?{" "}
              <Link
                className="link text-[14px] font-[600] text-[#ff5252]"
                to="/register"
              >
                Sign Up
              </Link>
            </p>

            <p className="text-center font-[500] mb-3">
              Or continue with social account
            </p>

            <Button className="flex gap-3 w-full !bg-[#f1f1f1] btn-lg !text-black !font-[600]">
              <FcGoogle className="text-[20px]" />
              Login with Google
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
