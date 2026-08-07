import { useCallback, useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";

import { RiMenu2Line } from "react-icons/ri";
import { FaRegBell } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";

import { Link, useNavigate } from "react-router-dom";

import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
    padding: "0 4px",
  },
}));

const Header = () => {
  const [anchorMyAcc, setAnchorMyAcc] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notificationData, setNotificationData] = useState({
    unreadCount: 0,
    notifications: [],
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const context = useContext(MyContext);
  const navigate = useNavigate();

  const openMyAcc = Boolean(anchorMyAcc);
  const openNotifications = Boolean(notificationAnchor);

  const loadNotifications = useCallback(async () => {
    if (!localStorage.getItem("accesstoken")) return;
    setNotificationsLoading(true);
    const result = await fetchDataFromApi("/api/order/admin/notifications");
    if (result?.success) setNotificationData(result.data);
    setNotificationsLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadNotifications, 0);
    const interval = window.setInterval(loadNotifications, 60000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [loadNotifications]);

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };

  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  const clearLoginData = () => {
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("verifyEmail");

    context?.setUserData?.(null);
    context?.setIslogin?.(false);
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      setAnchorMyAcc(null);

      const response = await fetchDataFromApi("/api/user/logout");

      console.log("Logout response:", response);

      if (response?.error || response?.success === false) {
        console.error(
          "Logout API error:",
          response?.message || "Logout failed",
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearLoginData();

      setIsLoggingOut(false);

      navigate("/login", {
        replace: true,
      });
    }
  };

  const userName =
    context?.userData?.name || context?.userData?.fullName || "Admin User";

  const userEmail = context?.userData?.email || "Không có email";

  const userAvatar =
    context?.userData?.avatar?.url ||
    context?.userData?.avatar ||
    "https://yt3.ggpht.com/yti/ANjgQV-2ZjxM59HlfGlXlsHJQAQP1LcypsepVlY5qF_9WiFA0w4=s88-c-k-c0x00ffffff-no-rj";

  return (
    <header
      className={`flex h-auto w-full items-center justify-between bg-white py-2 pr-7 shadow-md transition-all ${
        context?.isSidebarOpen === true ? "pl-72" : "pl-5"
      }`}
    >
      <div className="part1">
        <Button
          type="button"
          className="!h-[40px] !w-[40px] !min-w-[40px] !rounded-full !text-[rgba(0,0,0,0.8)]"
          onClick={() => context?.setisSidebarOpen?.(!context?.isSidebarOpen)}
        >
          <RiMenu2Line className="text-[18px] text-[rgba(0,0,0,0.8)]" />
        </Button>
      </div>

      <div className="part2 flex w-[40%] items-center justify-end gap-5">
        <IconButton
          aria-label="notifications"
          aria-controls={openNotifications ? "notification-menu" : undefined}
          aria-haspopup="true"
          onClick={(event) => {
            setNotificationAnchor(event.currentTarget);
            loadNotifications();
          }}
        >
          <StyledBadge
            badgeContent={notificationData.unreadCount}
            max={99}
            color="secondary"
          >
            <FaRegBell />
          </StyledBadge>
        </IconButton>
        <Menu
          id="notification-menu"
          anchorEl={notificationAnchor}
          open={openNotifications}
          onClose={() => setNotificationAnchor(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{ paper: { sx: { width: 380, maxWidth: "calc(100vw - 24px)", mt: 1 } } }}
        >
          <div className="flex items-center justify-between px-4 py-2">
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500">
                {notificationData.unreadCount} items require attention
              </p>
            </div>
            <button
              type="button"
              onClick={loadNotifications}
              className="text-xs font-semibold text-blue-600"
            >
              Refresh
            </button>
          </div>
          <Divider />
          {notificationsLoading && !notificationData.notifications.length ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Loading notifications...
            </p>
          ) : notificationData.notifications.length ? (
            notificationData.notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => {
                  setNotificationAnchor(null);
                  navigate(notification.path);
                }}
                className="!items-start !gap-3 !whitespace-normal !px-4 !py-3"
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    notification.type === "order"
                      ? "bg-blue-500"
                      : notification.type === "seller"
                        ? "bg-violet-500"
                        : notification.type === "product"
                          ? "bg-amber-500"
                        : notification.type === "stock"
                          ? "bg-orange-500"
                          : notification.type === "support"
                            ? "bg-rose-500"
                          : "bg-emerald-500"
                  }`}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900">
                    {notification.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-gray-500">
                    {notification.message}
                  </span>
                </span>
                <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                  {notification.count}
                </span>
              </MenuItem>
            ))
          ) : (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Everything is up to date.
            </p>
          )}
        </Menu>

        {context?.isLogin === true ? (
          <div className="relative">
            <button
              type="button"
              aria-label="Open account menu"
              aria-controls={openMyAcc ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openMyAcc ? "true" : undefined}
              className="h-[35px] w-[35px] cursor-pointer overflow-hidden rounded-full border-0 bg-transparent p-0"
              onClick={handleClickMyAcc}
            >
              <img
                src={userAvatar}
                alt={userName}
                className="h-full w-full object-cover"
              />
            </button>

            <Menu
              anchorEl={anchorMyAcc}
              id="account-menu"
              open={openMyAcc}
              onClose={handleCloseMyAcc}
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
              transformOrigin={{
                horizontal: "right",
                vertical: "top",
              }}
              anchorOrigin={{
                horizontal: "right",
                vertical: "bottom",
              }}
            >
              <MenuItem onClick={handleCloseMyAcc} className="!bg-white">
                <div className="flex items-center gap-3">
                  <div className="h-[35px] w-[35px] overflow-hidden rounded-full">
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="info">
                    <h3 className="text-[15px] font-[500] leading-5">
                      {userName}
                    </h3>

                    <p className="text-[12px] font-[400] opacity-70">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </MenuItem>

              <Divider />

              <Link to="/profile">
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleCloseMyAcc}
                  className="flex items-center gap-3"
                >
                  <FaRegUser className="text-[16px]" />

                  <span className="text-[14px]">Profile</span>
                </MenuItem>
              </Link>
              <MenuItem
                onClick={logout}
                disabled={isLoggingOut}
                className="flex items-center gap-3"
              >
                <IoMdLogOut className="text-[18px]" />

                <span className="text-[14px]">
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </span>
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <Link to="/login">
            <Button className="btn-blue btn-sm !rounded-full">Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
