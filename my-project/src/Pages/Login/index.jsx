import { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { firebaseApp } from "../../firebase";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);

  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const context = useContext(MyContext);

  const onChangeInput = (e) => {
    const { name, value } = e.target;

    setFormFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const forgotPassword = async () => {
    const email = formFields.email.trim();

    if (email === "") {
      context.alertBox("error", "Please enter your email first");
      return;
    }

    try {
      setIsForgotLoading(true);

      const response = await postData("/api/user/forgot-password", {
        email,
      });

      console.log("Forgot password response:", response);

      if (response?.error !== true) {
        context.alertBox("success", response?.message || "OTP sent");

        localStorage.setItem("userEmail", email);
        localStorage.setItem("resetPasswordEmail", email);
        localStorage.setItem("forgotPasswordFlow", "true");

        navigate("/verify");
      } else {
        context.alertBox("error", response?.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      context.alertBox("error", error?.message || "Failed to send OTP");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formFields.email.trim() === "") {
      context.alertBox("error", "Please enter your email");
      return;
    }

    if (formFields.password.trim() === "") {
      context.alertBox("error", "Please enter password");
      return;
    }

    try {
      setIsLoading(true);

      const response = await postData("/api/user/login", formFields);

      console.log("Login response:", response);

      if (response?.error !== true) {
        context.alertBox("success", response?.message || "Login successful");

        localStorage.setItem("accesstoken", response?.data?.accesstoken);
        localStorage.setItem("refreshToken", response?.data?.refreshToken);

        context.setIsLogin(true);

        setFormFields({
          email: "",
          password: "",
        });

        navigate("/");
      } else {
        context.alertBox("error", response?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      context.alertBox("error", error?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(getAuth(firebaseApp), provider);
      const idToken = await credential.user.getIdToken();
      const response = await postData("/api/user/google-login", { idToken });
      if (response?.error === true || !response?.data?.accesstoken) throw new Error(response?.message || "Google login failed.");
      localStorage.setItem("accesstoken", response.data.accesstoken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      context.setUserData(response.data.user || null);
      context.setIsLogin(true);
      context.alertBox("success", response.message || "Google login successful.");
      navigate("/", { replace: true });
    } catch (error) {
      if (error?.code === "auth/popup-closed-by-user") context.alertBox("error", "Google sign-in was cancelled.");
      else if (error?.code === "auth/popup-blocked") context.alertBox("error", "The Google sign-in popup was blocked by your browser.");
      else if (error?.code === "auth/unauthorized-domain") context.alertBox("error", "This domain is not authorized in Firebase Authentication.");
      else context.alertBox("error", error?.message || "Google login failed.");
    } finally {
      setIsGoogleLoading(false);
    }
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
            onSubmit={handleSubmit}
          >
            <div className="form-group w-full mb-5">
              <TextField
                type="email"
                id="email"
                name="email"
                value={formFields.email}
                disabled={isLoading || isForgotLoading || isGoogleLoading}
                onChange={onChangeInput}
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
                value={formFields.password}
                disabled={isLoading || isForgotLoading || isGoogleLoading}
                type={isPasswordShow ? "text" : "password"}
                onChange={onChangeInput}
                label="Password *"
                variant="outlined"
                className="w-full"
                autoComplete="new-password"
              />

              <Button
                type="button"
                disabled={isLoading || isForgotLoading || isGoogleLoading}
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
              onClick={isForgotLoading ? undefined : forgotPassword}
            >
              {isForgotLoading ? "Sending OTP..." : "Forgot Password?"}
            </p>

            <div className="flex items-center w-full mt-3 mb-3">
              <Button
                type="submit"
                disabled={isLoading || isForgotLoading || isGoogleLoading}
                className="btn-org btn-lg w-full"
              >
                {isLoading ? "Login..." : "Login"}
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

            <Button
              type="button"
              disabled={isLoading || isForgotLoading || isGoogleLoading}
              onClick={handleGoogleLogin}
              className="flex gap-3 w-full !bg-[#f1f1f1] btn-lg !text-black !font-[600]"
            >
              <FcGoogle className="text-[20px]" /> {isGoogleLoading ? "Connecting to Google..." : "Login with Google"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
