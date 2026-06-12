// src/components/Login.jsx
import React, { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MyContext } from "../../App";

const Login = () => {
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const context = useContext(MyContext);

  const handleInputChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const forgotPassword = () => {
    if (formFields.email !== "") {
      // Thêm logic gửi email reset nếu cần
      console.log("Email for reset:", formFields.email);
    }

    navigate("/verify");
    context.openAlertBox("success", "OTP Sent");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", formFields);
    // Thêm logic login API ở đây
  };

  return (
    <section className="section py-10">
      <div className="container">
        <div className="card shadow-md w-[400px] m-auto rounded-md bg-white p-5 px-10">
          <h3 className="text-center text-[18px] font-[600] text-black">
            Login to your account
          </h3>

          <form
            className="w-full mt-5"
            autoComplete="off"
            onSubmit={handleLogin}
          >
            <div className="form-group w-full mb-5">
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

            <p
              className="link cursor-pointer text-[14px] font-[500] mb-3"
              onClick={forgotPassword}
            >
              Forgot Password?
            </p>

            <div className="flex items-center w-full mt-3 mb-3">
              <Button type="submit" className="btn-org btn-lg w-full">
                Login
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
              <FcGoogle className="text-[20px]" /> Login with Google
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
