import React, { useContext, useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { postData } from "../../utils/api";
import { FaRegUser } from "react-icons/fa";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { NavLink } from "react-router-dom";
import Button from "@mui/material/Button";
import { MyContext } from "../../App";
import CircularProgress from "@mui/material/CircularProgress";
import { MdOutlinePlace } from "react-icons/md";

const AccountSidebar = () => {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("dichead.jpg");

  const context = useContext(MyContext);

  useEffect(() => {
    if (context?.userData?.avatar) {
      setAvatarUrl(context.userData.avatar);
    } else {
      setAvatarUrl("Sample_User_Icon.png");
    }
  }, [context?.userData?.avatar]);

  let img_arr = [];
  let uniqueArray = [];
  let selectedImages = [];

  const isValidImageFile = (file) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const fileName = (file?.name || "").toLowerCase();

    return (
      validTypes.includes(file?.type) ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".webp")
    );
  };

  const onChangeFile = async (e, apiEndPoint) => {
    try {
      setPreviews([]);
      const files = Array.from(e.target.files || []);
      setUploading(true);

      if (files.length === 0) {
        setUploading(false);
        return false;
      }

      for (const file of files) {
        if (!isValidImageFile(file)) {
          context.alertBox(
            "error",
            "Please select a valid JPG, PNG, or WEBP image file",
          );
          setUploading(false);
          return false;
        }
      }

      const formdata = new FormData();
      files.forEach((file) => formdata.append("avatar", file));

      const response = await fetch(import.meta.env.VITE_API_URL + apiEndPoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
        body: formdata,
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success !== false) {
        const uploadedAvatar = data?.avatar || data?.data?.avatar;
        if (uploadedAvatar) {
          const cacheBustedUrl = `${uploadedAvatar}${uploadedAvatar.includes("?") ? "&" : "?"}v=${Date.now()}`;
          setAvatarUrl(cacheBustedUrl);
          context?.setUserData?.((prev) =>
            prev ? { ...prev, avatar: cacheBustedUrl } : prev,
          );
        }
        context.alertBox("success", "Avatar updated successfully");
      } else {
        context.alertBox("error", data?.message || "Avatar update failed");
      }

      setUploading(false);
      return true;
    } catch (error) {
      console.log(error);
      context.alertBox("error", "Avatar update failed");
      setUploading(false);
      return false;
    }
  };
  return (
    <div className="card bg-white shadow-md rounded-md sticky top-[10px]">
      <div className="w-full p-5 flex items-center justify-center flex-col">
        <div
          className="w-[110px] h-[110px] rounded-full overflow-hidden mb-4 relative
              group flex items-center justify-center  bg-gray-200"
        >
          {uploading === true ? (
            <CircularProgress color="inherit" />
          ) : (
            <img
              src={avatarUrl}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          )}

          <div
            className="overlay w-[100%] h-[100%] absolute top-0 left-0 z-0
                bg-[rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer opacity-0 
                transition-all group-hover:opacity-100"
          >
            <FaCloudUploadAlt className="text-[#fff] text-[25px]" />
            <input
              type="file"
              className="absolute top-0 left-0 w-full h-full opacity-0"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => onChangeFile(e, "/api/user/user-avatar")}
              name="avatar"
            />
          </div>
        </div>

        <h3>{context?.userData?.name || "User"}</h3>
        <h6 className="text-[13px] !font-[500] ">
          {context?.userData?.email || ""}
        </h6>
      </div>

      <ul className="list-none pb-5 bg-[#f1f1f1] myAccountTabs">
        <li className="w-full">
          <NavLink to="/my-account" exact={true} activeClassName="isActive">
            <Button className=" w-full !text-left !py-2 !px-5 !justify-start !capitalize !text-[rgba(0,0,0,0.8)] !rounded-none flex items-center gap-2">
              <FaRegUser className="text-[20px]" /> My Profile
            </Button>
          </NavLink>
        </li>

        <li className="w-full">
          <NavLink to="/address" exact={true} activeClassName="isActive">
            <Button className=" w-full !text-left !py-2 !px-5 !justify-start !capitalize !text-[rgba(0,0,0,0.8)] !rounded-none flex items-center gap-2">
              <MdOutlinePlace className="text-[20px]" /> Address
            </Button>
          </NavLink>
        </li>

        <li className="w-full">
          <NavLink to="/my-list" exact={true} activeClassName="isActive">
            <Button className=" w-full !text-left !px-5 !py-2 !justify-start !capitalize !text-[rgba(0,0,0,0.8)] !rounded-none flex items-center gap-2">
              <IoMdHeartEmpty className="text-[20px]" /> My List
            </Button>
          </NavLink>
        </li>
        <li className="w-full">
          <NavLink to="/my-orders" exact={true} activeClassName="isActive">
            <Button className=" w-full !text-left !px-5 !py-2 !justify-start !capitalize !text-[rgba(0,0,0,0.8)] !rounded-none flex items-center gap-2">
              <IoBagCheckOutline className="text-[20px]" /> My Orders
            </Button>
          </NavLink>
        </li>
        <li className="w-full">
          <NavLink to="/profile" exact={true} activeClassName="isActive">
            <Button className=" w-full !text-left !px-5 !py-2 !justify-start !capitalize !text-[rgba(0,0,0,0.8)] !rounded-none flex items-center gap-2">
              <IoIosLogOut className="text-[20px]" /> Logout
            </Button>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AccountSidebar;
