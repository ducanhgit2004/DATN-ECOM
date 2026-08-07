import "./App.css";
import React from "react";

import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Dashboard from "./Pages/Dashboard";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { createContext, useState, useEffect } from "react";
import Login from "./Pages/Login";
import { fetchDataFromApi } from "./utils/api";
import SignUp from "./Pages/SignUp";
import Products from "./Pages/Products";
import AddProduct from "./Pages/Products/addProduct";
import ProductDetails from "./Pages/Products/productDetails";

import Dialog from "@mui/material/Dialog";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { IoMdClose } from "react-icons/io";
import Slide from "@mui/material/Slide";
import HomeSliderBanners from "./Pages/HomeSliderBanners";
import AddHomeSlide from "./Pages/HomeSliderBanners/addHomeSlide";
import CategoryBanners from "./Pages/CategoryBanners";
import AddCategoryBanner from "./Pages/CategoryBanners/addCategoryBanner";
import Blogs from "./Pages/Blogs";
import AddBlog from "./Pages/Blogs/addBlog";
import CategoryList from "./Pages/Category";
import AddCategory from "./Pages/Category/addCategory";
import SubCategoryList from "./Pages/Category/subCatList";
import AddSubCategory from "./Pages/Category/addSubCategory";
import Users from "./Pages/Users";
import Orders from "./Pages/Orders";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyAccount from "./Pages/VerifyAccount";
import ChangePassword from "./Pages/ChangePassword";
import Profile from "./Pages/Profile";
import AddAddress from "./Pages/Address/addAddress";
import Sellers from "./Pages/Sellers";
import Reviews from "./Pages/Reviews";
import Support from "./Pages/Support";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MyContext = createContext();
const requireAdminSession = () =>
  localStorage.getItem("accesstoken") ? null : redirect("/login");

function App() {
  const [isSidebarOpen, setisSidebarOpen] = useState(true);
  const [isLogin, setIslogin] = useState(() =>
    Boolean(localStorage.getItem("accesstoken")),
  );
  const [userData, setUserData] = useState(null);

  const [isOpenFullScreenPanel, setIsOpenFullScreenPanel] = useState({
    open: false,
    model: "",
  });
  const [addressRefreshKey, setAddressRefreshKey] = useState(0);
  const [categoryRefreshKey, setCategoryRefreshKey] = useState(0);
  const [productRefreshKey, setProductRefreshKey] = useState(0);
  const [homeSliderRefreshKey, setHomeSliderRefreshKey] = useState(0);
  const [categoryBannerRefreshKey, setCategoryBannerRefreshKey] = useState(0);
  const [blogRefreshKey, setBlogRefreshKey] = useState(0);
  const [catData, setCatData] = useState([]);

  useEffect(() => {
    if (!isLogin) return;
    fetchDataFromApi("/api/category").then((response) => {
      if (response?.success) setCatData(response.data || []);
    });
  }, [isLogin, categoryRefreshKey]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("accesstoken");

    if (!token) {
      setUserData(null);
      return;
    }

    try {
      const response = await fetchDataFromApi("/api/user/user-details");

      if (!response?.error && response?.data?.role === "ADMIN") {
        setUserData(response.data);
      } else {
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshToken");
        setUserData(null);
        setIslogin(false);
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      localStorage.removeItem("accesstoken");
      localStorage.removeItem("refreshToken");
      setUserData(null);
      setIslogin(false);
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
  };

  useEffect(() => {
    if (isLogin) {
      Promise.resolve().then(fetchUserProfile);
    }
  }, [isLogin]);

  const alertBox = (type, message) => {
    if (!message) return;

    const normalizedType = String(type || "info").toLowerCase();

    switch (normalizedType) {
      case "success":
        toast.success(message, {
          duration: 3000,
          position: "top-center",
        });
        break;
      case "error":
        toast.error(message, {
          duration: 4000,
          position: "top-center",
        });
        break;
      case "loading":
        toast.loading(message, {
          position: "top-center",
        });
        break;
      default:
        toast(message, {
          position: "top-center",
        });
    }
  };

  const router = createBrowserRouter([
    {
      path: "/",
      loader: requireAdminSession,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${
                  isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"
                } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${
                  isSidebarOpen === false ? "w-[100%]" : "w-[82%]"
                } transition-all`}
              >
                <Dashboard />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/login",
      element: (
        <>
          <Login />
        </>
      ),
    },
    {
      path: "/sign-up",
      element: (
        <>
          <SignUp />
        </>
      ),
    },
    {
      path: "/products",
      loader: requireAdminSession,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${
                  isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"
                } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${
                  isSidebarOpen === false ? "w-[100%]" : "w-[82%]"
                } transition-all`}
              >
                <Products />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/product/upload",
      loader: requireAdminSession,
      element: (
        <>
          <AddProduct />
        </>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <>
          <ForgotPassword />
        </>
      ),
    },
    {
      path: "/verify-account",
      element: (
        <>
          <VerifyAccount />
        </>
      ),
    },
    {
      path: "/change-password",
      loader: requireAdminSession,
      element: (
        <>
          <ChangePassword />
        </>
      ),
    },
    {
      path: "/homeSlider/list",
      loader: requireAdminSession,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${
                  isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"
                } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${
                  isSidebarOpen === false ? "w-[100%]" : "w-[82%]"
                } transition-all`}
              >
                <HomeSliderBanners />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/categoryBanners/list",
      loader: requireAdminSession,
      element: (
        <section className="main">
          <Header />
          <div className="contentMain flex">
            <div className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"} transition-all`}><Sidebar /></div>
            <div className={`contentRight py-4 px-5 ${isSidebarOpen === false ? "w-[100%]" : "w-[82%]"} transition-all`}><CategoryBanners /></div>
          </div>
        </section>
      ),
    },
    {
      path: "/blogs",
      loader: requireAdminSession,
      element: (
        <section className="main">
          <Header />
          <div className="contentMain flex">
            <div className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"} transition-all`}><Sidebar /></div>
            <div className={`contentRight py-4 px-5 ${isSidebarOpen === false ? "w-[100%]" : "w-[82%]"} transition-all`}><Blogs /></div>
          </div>
        </section>
      ),
    },
    {
      path: "/category/list",
      loader: requireAdminSession,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${
                  isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"
                } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${
                  isSidebarOpen === false ? "w-[100%]" : "w-[82%]"
                } transition-all`}
              >
                <CategoryList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/subCategory/list",
      loader: requireAdminSession,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${
                  isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"
                } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${
                  isSidebarOpen === false ? "w-[100%]" : "w-[82%]"
                } transition-all`}
              >
                <SubCategoryList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/users",
      loader: requireAdminSession,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${
                  isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"
                } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${
                  isSidebarOpen === false ? "w-[100%]" : "w-[82%]"
                } transition-all`}
              >
                <Users />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/sellers",
      loader: requireAdminSession,
      element: (
        <section className="main">
          <Header />
          <div className="contentMain flex">
            <div className={`overflow-hidden sidebarWrapper ${isSidebarOpen ? "w-[15%]" : "w-[0px] opacity-0"} transition-all`}><Sidebar /></div>
            <div className={`contentRight py-4 px-5 ${isSidebarOpen ? "w-[82%]" : "w-[100%]"} transition-all`}><Sellers /></div>
          </div>
        </section>
      ),
    },
    {
      path: "/orders",
      loader: requireAdminSession,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${
                  isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"
                } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${
                  isSidebarOpen === false ? "w-[100%]" : "w-[82%]"
                } transition-all`}
              >
                <Orders />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/reviews",
      loader: requireAdminSession,
      element: (
        <section className="main">
          <Header />
          <div className="contentMain flex">
            <div className={`overflow-hidden sidebarWrapper ${isSidebarOpen ? "w-[15%]" : "w-[0px] opacity-0"} transition-all`}><Sidebar /></div>
            <div className={`contentRight py-4 px-5 ${isSidebarOpen ? "w-[82%]" : "w-[100%]"} transition-all`}><Reviews /></div>
          </div>
        </section>
      ),
    },
    {
      path: "/support",
      loader: requireAdminSession,
      element: (
        <section className="main">
          <Header />
          <div className="contentMain flex">
            <div className={`overflow-hidden sidebarWrapper ${isSidebarOpen ? "w-[15%]" : "w-[0px] opacity-0"} transition-all`}><Sidebar /></div>
            <div className={`contentRight py-4 px-5 ${isSidebarOpen ? "w-[82%]" : "w-[100%]"} transition-all`}><Support /></div>
          </div>
        </section>
      ),
    },
    {
      path: "/profile",
      loader: requireAdminSession,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${
                  isSidebarOpen === true ? "w-[15%]" : "w-[0px] opacity-0"
                } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${
                  isSidebarOpen === false ? "w-[100%]" : "w-[82%]"
                } transition-all`}
              >
                <Profile />
              </div>
            </div>
          </section>
        </>
      ),
    },
  ]);

  const values = {
    isSidebarOpen,
    setisSidebarOpen,
    isLogin,
    setIslogin,
    userData,
    setUserData,
    isOpenFullScreenPanel,
    setIsOpenFullScreenPanel,
    addressRefreshKey,
    setAddressRefreshKey,
    categoryRefreshKey,
    setCategoryRefreshKey,
    productRefreshKey,
    setProductRefreshKey,
    homeSliderRefreshKey,
    setHomeSliderRefreshKey,
    categoryBannerRefreshKey,
    setCategoryBannerRefreshKey,
    blogRefreshKey,
    setBlogRefreshKey,
    catData,
    alertBox,
  };

  return (
    <>
      <MyContext.Provider value={values}>
        <Toaster position="top-center" reverseOrder={false} />
        <RouterProvider router={router} />

        <Dialog
          fullScreen
          open={isOpenFullScreenPanel.open}
          onClose={() =>
            setIsOpenFullScreenPanel({
              open: false,
            })
          }
          slots={{
            transition: Transition,
          }}
        >
          <AppBar sx={{ position: "relative" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() =>
                  setIsOpenFullScreenPanel({
                    open: false,
                  })
                }
                aria-label="close"
              >
                <IoMdClose className="text-gray-800" />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                <span className="text-gray-800">
                  {" "}
                  {isOpenFullScreenPanel?.model}
                </span>
              </Typography>
            </Toolbar>
          </AppBar>

          {isOpenFullScreenPanel?.model === "Add Product" && <AddProduct />}

          {isOpenFullScreenPanel?.model === "Edit Product" && (
            <AddProduct product={isOpenFullScreenPanel.product} />
          )}

          {isOpenFullScreenPanel?.model === "Product Details" && (
            <ProductDetails product={isOpenFullScreenPanel.product} />
          )}

          {isOpenFullScreenPanel?.model === "Seller Products" && (
            <div className="p-5">
              <Products seller={isOpenFullScreenPanel.seller} />
            </div>
          )}

          {isOpenFullScreenPanel?.model === "Add Home Slide" && (
            <AddHomeSlide />
          )}

          {isOpenFullScreenPanel?.model === "Edit Home Slide" && (
            <AddHomeSlide slide={isOpenFullScreenPanel.slide} />
          )}

          {isOpenFullScreenPanel?.model === "Add Category Banner" && (
            <AddCategoryBanner />
          )}

          {isOpenFullScreenPanel?.model === "Edit Category Banner" && (
            <AddCategoryBanner banner={isOpenFullScreenPanel.banner} />
          )}

          {isOpenFullScreenPanel?.model === "Add Blog Post" && <AddBlog />}

          {isOpenFullScreenPanel?.model === "Edit Blog Post" && (
            <AddBlog blog={isOpenFullScreenPanel.blog} />
          )}

          {isOpenFullScreenPanel?.model === "Add New Category" && (
            <AddCategory />
          )}

          {isOpenFullScreenPanel?.model === "Edit Category" && (
            <AddCategory category={isOpenFullScreenPanel.category} />
          )}

          {isOpenFullScreenPanel?.model === "Add New Subcategory" && (
            <AddSubCategory />
          )}

          {isOpenFullScreenPanel?.model === "Edit Subcategory" && (
            <AddSubCategory
              subCategory={isOpenFullScreenPanel.subCategory}
            />
          )}

          {isOpenFullScreenPanel?.model === "Add Third-level Category" && (
            <AddSubCategory
              level={3}
              initialParentId={isOpenFullScreenPanel.initialParentId}
            />
          )}

          {isOpenFullScreenPanel?.model === "Edit Third-level Category" && (
            <AddSubCategory
              level={3}
              subCategory={isOpenFullScreenPanel.subCategory}
            />
          )}

          {isOpenFullScreenPanel?.model === "Add New Address" && <AddAddress />}
        </Dialog>
      </MyContext.Provider>
    </>
  );
}

export default App;
export { MyContext };
