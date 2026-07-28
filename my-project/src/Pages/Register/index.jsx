import React, { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";

const Register = () => {
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    password: "",
  });

  const context = useContext(MyContext);
  const navigate = useNavigate();

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields(() => {
      return {
        ...formFields,
        [name]: value,
      };
    });
  };

  const valideValue = Object.values(formFields).every((el) => el);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formFields.name === "") {
      context.alertBox("error", "Please enter full name");
      return false;
    }

    if (formFields.email === "") {
      context.alertBox("error", "Please enter your email");
      return false;
    }

    if (formFields.password === "") {
      context.alertBox("error", "Please enter password");
      return false;
    }

    setIsLoading(true);

    postData("/api/user/register", formFields)
      .then((response) => {
        console.log("Register response:", response);
        if (response?.error !== true) {
          context.alertBox("success", response?.message);
          localStorage.setItem("userEmail", formFields.email);
          setFormFields({
            name: "",
            email: "",
            password: "",
          });
          setIsLoading(false);
          navigate("/verify");
        } else {
          context.alertBox("error", response?.message);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Register error:", error);
        context.alertBox("error", error?.message || "Registration failed");
        setIsLoading(false);
      });
  };

  return (
    <section className="section py-10">
      <div className="container">
        <div className="card shadow-md w-[400px] m-auto rounded-md bg-white p-5 px-10">
          <h3 className="text-center text-[18px] font-[600] text-black">
            Register with a new account
          </h3>

          <form
            className="w-full mt-5"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="form-group w-full mb-5">
              <TextField
                type="text"
                id="name"
                name="name"
                value={formFields.name}
                disabled={isLoading === true ? true : false}
                label="Full Name"
                variant="outlined"
                className="w-full"
                autoComplete="off"
                onChange={onChangeInput}
              />
            </div>

            <div className="form-group w-full mb-5">
              <TextField
                type="email"
                id="email"
                name="email"
                value={formFields.email}
                label="Email Id *"
                variant="outlined"
                className="w-full"
                autoComplete="off"
                disabled={isLoading === true ? true : false}
                onChange={onChangeInput}
              />
            </div>

            <div className="form-group w-full mb-5 relative">
              <TextField
                id="password"
                name="password"
                value={formFields.password}
                type={isPasswordShow ? "text" : "password"}
                label="Password *"
                variant="outlined"
                className="w-full"
                autoComplete="new-password"
                disabled={isLoading === true ? true : false}
                onChange={onChangeInput}
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

            <div className="flex items-center w-full mt-3 mb-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="btn-org btn-lg w-full"
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </div>

            <p className="text-center">
              Already have an account?{" "}
              <Link
                className="link text-[14px] font-[600] text-[#ff5252]"
                to="/login"
              >
                Login
              </Link>{" "}
            </p>

            <p className="text-center font-[500]">
              Or continue with social account
            </p>

            <Button
              type="button"
              className="flex gap-3 w-full bg-[#f1f1f1] py-3 px-4 rounded-md text-black font-[600] items-center justify-center hover:bg-[#e8e8e8] transition"
            >
              <FcGoogle className="text-[20px]" /> Login with Google
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;
