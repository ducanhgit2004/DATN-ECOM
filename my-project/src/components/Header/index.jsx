import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Search from "../Search";
import Navigation from "./Navigation";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import { MdOutlineShoppingCart } from "react-icons/md";
import { IoGitCompareOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa6";
import Tooltip from "@mui/material/Tooltip";
import { MyContext } from "../../App";
import { Button } from "@mui/material";
import { FaRegUser } from "react-icons/fa";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { fetchDataFromApi } from "../../utils/api";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const Header = () => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const context = useContext(MyContext);
  const cartCount = (context?.cartItems || []).reduce(
    (total, item) => total + Number(item?.quantity || 0),
    0,
  );
  const displayedWishlistCount = context?.isLogin
    ? (context?.myListItems || []).length
    : 0;

  const history = useNavigate();

  useEffect(() => {
    if (!context?.isLogin) {
      return undefined;
    }
    const refresh = () =>
      fetchDataFromApi("/api/chat/unread-count").then((result) => {
        if (result?.success) setUnreadMessages(Number(result.data?.count) || 0);
      });
    refresh();
    const timer = window.setInterval(refresh, 20000);
    return () => window.clearInterval(timer);
  }, [context?.isLogin]);

  const logout = async () => {
    setAnchorEl(null);
    await context.logout();
    history("/", { replace: true });
  };

  return (
    <header className="bg-white">
      <div className="top-strip py-2 border-t-[1px] border-gray-300 border-b-[1px]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="w-[50%]">
              <p className="text-[14px] font-[500]">
                Free Shipping From $200 & Free Returns
              </p>
            </div>

            <ul className="flex items-center gap-3">
              <li>
                <Link
                  to="/help-center"
                  className="text-[13px] font-[500] hover:text-red-500"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/my-orders"
                  className="text-[13px] font-[500] hover:text-red-500"
                >
                  Order Tracking
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="header py-4 border-b-[1px] border-gray-300">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="col1 flex items-center w-[15%]">
            <Link to="/">
              <img
                src="/logo1.jpg"
                alt="logo"
                className="h-[100px] w-auto object-contain"
              />
            </Link>
          </div>

          <div className="col2 w-[45%]">
            <Search />
          </div>

          <div className="col3 w-[30%] flex items-center pl-7">
            <ul className="flex items-center gap-5 justify-end w-full">
              {context.isLogin === false ? (
                <li className="list-none">
                  <Link
                    to="/login"
                    className="text-[15px] gap-3 font-[500] hover:text-red-500 "
                  >
                    Login
                  </Link>
                  {""} | &nbsp;
                  <Link
                    to="/register"
                    className="text-[15px] font-[500] hover:text-red-500"
                  >
                    Register
                  </Link>
                </li>
              ) : (
                <>
                  <div
                    className="text-[#000] myAccountWrap flex items-center gap-3 cursor-pointer"
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleClick(event);
                      }
                    }}
                  >
                    <Button
                      type="button"
                      className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !bg-[#f1f1f1]"
                    >
                      <FaRegUser className="text-[18px] text-[rgba(0,0,0,0.7)]" />
                    </Button>

                    <div className="info flex flex-col">
                      <h4 className="leading-3 font-[14px] text-[rgba(0,0,0,0.6)] font-[500] capitalize text-left justify-start pb-1">
                        {context?.userData?.name}
                      </h4>
                      <span className="text-[13px] text-[rgba(0,0,0,0.6)] font-[400] capitalize text-left justify-start">
                        {context?.userData?.email}
                      </span>
                    </div>
                  </div>

                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    slotProps={{
                      paper: {
                        elevation: 0,
                        sx: {
                          overflow: "visible",
                          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                          mt: 1.5,
                          "& .MuiAvatar-root": {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                          },
                          "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                          },
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <Link to="/my-account" className="w-full block">
                      <MenuItem
                        onClick={handleClose}
                        className="flex gap-2 !py-2"
                      >
                        <FaRegUser className="text-[18px]" />{" "}
                        <span className="text-[14px]">My Account</span>
                      </MenuItem>
                    </Link>
                    <Link to="/my-orders" className="w-full block">
                      <MenuItem
                        onClick={handleClose}
                        className="flex gap-2 !py-2"
                      >
                        <IoBagCheckOutline className="text-[18px]" />
                        <span className="text-[14px]"> Orders </span>
                      </MenuItem>
                    </Link>
                    <Link to="/my-list" className="w-full block">
                      <MenuItem
                        onClick={handleClose}
                        className="flex gap-2 !py-2"
                      >
                        <IoMdHeartEmpty className="text-[18px]" />
                        <span className="text-[14px]"> My List </span>
                      </MenuItem>
                    </Link>
                    <MenuItem onClick={logout} className="flex gap-2 !py-2">
                      <IoIosLogOut className="text-[18px]" />
                      <span className="text-[14px]"> Log Out </span>
                    </MenuItem>
                  </Menu>
                </>
              )}

              {context.isLogin && (
                <li>
                  <Tooltip title="Messages">
                    <Link to="/messages">
                      <IconButton aria-label="messages">
                        <StyledBadge
                          badgeContent={unreadMessages}
                          color="secondary"
                        >
                          <IoChatbubbleEllipsesOutline size={24} />
                        </StyledBadge>
                      </IconButton>
                    </Link>
                  </Tooltip>
                </li>
              )}

              <li>
                <Tooltip title="Compare">
                  <Link to="/compare">
                    <IconButton aria-label="compare">
                      <StyledBadge
                        badgeContent={context?.compareIds?.length || 0}
                        color="secondary"
                      >
                        <IoGitCompareOutline size={24} />
                      </StyledBadge>
                    </IconButton>
                  </Link>
                </Tooltip>
              </li>

              <li>
                <Tooltip title="Wishlist">
                  <Link to={context?.isLogin ? "/my-list" : "/login"}>
                    <IconButton aria-label="wishlist">
                      <StyledBadge
                        badgeContent={displayedWishlistCount}
                        color="secondary"
                      >
                        <FaRegHeart size={24} />
                      </StyledBadge>
                    </IconButton>
                  </Link>
                </Tooltip>
              </li>

              <li>
                <Tooltip title="Shopping Cart">
                  <IconButton
                    aria-label="cart"
                    onClick={() => context.setOpenCartPanel(true)}
                  >
                    <StyledBadge badgeContent={cartCount} color="secondary">
                      <MdOutlineShoppingCart size={24} />
                    </StyledBadge>
                  </IconButton>
                </Tooltip>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Navigation />
    </header>
  );
};

export default Header;
