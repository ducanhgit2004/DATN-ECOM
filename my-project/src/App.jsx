import { useState, createContext, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";

import Header from "./components/Header";
import Home from "./Pages/Home";
import ProductListing from "./Pages/ProductListing";
import Footer from "./components/Footer";
import ProductDetails from "./Pages/ProductDetails";
import ProductZoom from "./components/ProductZoom";
import ProductDetailsComponent from "./components/ProductDetails";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CartPanel from "./components/CartPanel";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Drawer from "@mui/material/Drawer";

import { IoCloseSharp } from "react-icons/io5";
import CartPage from "./Pages/Cart";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";

import toast, { Toaster } from "react-hot-toast";
import Checkout from "./Pages/Checkout";
import MyAccount from "./Pages/MyAccount";
import MyList from "./Pages/MyList";
import Orders from "./Pages/Orders";
import { deleteData, fetchDataFromApi, postData, putData } from "./utils/api";
import Address from "./Pages/MyAccount/address";
import BlogDetails from "./Pages/BlogDetails";
import SearchPage from "./Pages/Search";
import StorePage from "./Pages/Store";
import ComparePage from "./Pages/Compare";
import Messages from "./Pages/Messages";
import HelpCenter from "./Pages/HelpCenter";

const MyContext = createContext();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

const ProtectedRoute = ({ isLogin, children }) =>
  isLogin ? children : <Navigate to="/login" replace />;

function App() {
  const [openProductDetailsModal, setOpenProductDetailsModal] = useState(false);
  const [openCartPanel, setOpenCartPanel] = useState(false);

  const [maxWidth] = useState("xl");
  const [fullWidth] = useState(true);
  const [isLogin, setIsLogin] = useState(() =>
    Boolean(localStorage.getItem("accesstoken")),
  );
  const [userData, setUserData] = useState(null);
  const [catData, setCatData] = useState([]);
  const [products, setProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [myListItems, setMyListItems] = useState([]);
  const [myListLoading, setMyListLoading] = useState(false);
  const [compareIds, setCompareIds] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("compareProductIds") || "[]");
      return Array.isArray(stored) ? stored.slice(0, 4) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("compareProductIds", JSON.stringify(compareIds));
  }, [compareIds]);

  const handleCloseProductDetailsModal = () => {
    setOpenProductDetailsModal(false);
  };

  const toggleCartPanel = (newOpen) => () => {
    setOpenCartPanel(newOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");

    if (!token) {
      return;
    }

    let isMounted = true;

    const loadUserDetails = async () => {
      try {
        const response = await fetchDataFromApi(`/api/user/user-details`);

        if (!isMounted) {
          return;
        }

        if (response?.error !== true) {
          setUserData(response?.data || null);
          setIsLogin(true);
        } else {
          localStorage.removeItem("accesstoken");
          localStorage.removeItem("refreshToken");
          setUserData(null);
          setCartItems([]);
          setMyListItems([]);
          setIsLogin(false);
        }
      } catch {
        if (!isMounted) {
          return;
        }

        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshToken");
        setUserData(null);
        setCartItems([]);
        setMyListItems([]);
        setIsLogin(false);
      }
    };

    loadUserDetails();

    return () => {
      isMounted = false;
    };
  }, [isLogin]);

  useEffect(() => {
    if (!isLogin) return;

    let active = true;
    Promise.all([
      fetchDataFromApi("/api/cart/get"),
      fetchDataFromApi("/api/myList"),
    ]).then(([cartResult, myListResult]) => {
      if (!active) return;
      setCartItems(
        cartResult?.success && Array.isArray(cartResult.data)
          ? cartResult.data
          : [],
      );
      setMyListItems(
        myListResult?.success && Array.isArray(myListResult.data)
          ? myListResult.data
          : [],
      );
    });

    return () => {
      active = false;
    };
  }, [isLogin]);

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      setCatalogLoading(true);
      const [categoryResult, productResult] = await Promise.all([
        fetchDataFromApi("/api/category"),
        fetchDataFromApi("/api/product/getAllProducts?perPage=1000"),
      ]);
      if (!active) return;
      setCatData(categoryResult?.success ? categoryResult.data || [] : []);
      setProducts(productResult?.success ? productResult.products || [] : []);
      setCatalogLoading(false);
    };
    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  const openProductPreview = (product) => {
    setSelectedProduct(product);
    setOpenProductDetailsModal(true);
  };

  async function loadCart() {
    if (!isLogin) {
      setCartItems([]);
      return;
    }

    setCartLoading(true);
    const result = await fetchDataFromApi("/api/cart/get");
    if (result?.success) {
      setCartItems(Array.isArray(result.data) ? result.data : []);
    } else {
      setCartItems([]);
    }
    setCartLoading(false);
  }

  const addToCart = async (productId, options = {}) => {
    if (!productId) {
      alertBox("error", "No product selected.");
      return;
    }

    if (!isLogin) {
      alertBox("error", "Please login to add items to your cart.");
      return;
    }

    const result = await postData("/api/cart/add", {
      productId,
      size: options?.size || "",
      quantity: options?.quantity || 1,
    });

    if (result?.success) {
      alertBox("success", "Product added to cart.");
      setOpenCartPanel(true);
      await loadCart();
    } else {
      alertBox("error", result?.message || "Unable to add product to cart.");
    }
  };

  async function loadMyList() {
    if (!isLogin) {
      setMyListItems([]);
      return;
    }
    setMyListLoading(true);
    const result = await fetchDataFromApi("/api/myList");
    setMyListItems(
      result?.success && Array.isArray(result.data) ? result.data : [],
    );
    setMyListLoading(false);
  }

  const addToMyList = async (product) => {
    if (!isLogin) {
      alertBox("error", "Please login to add products to My List.");
      return;
    }
    if (!product?._id) return;
    if (myListItems.some((item) => item.productId === product._id)) {
      alertBox("error", "This product is already in My List.");
      return;
    }

    const result = await postData("/api/myList/add", {
      productId: product._id,
    });

    if (result?.success) {
      alertBox("success", "Product added to My List.");
      await loadMyList();
    } else {
      alertBox("error", result?.message || "Unable to add product.");
    }
  };

  const removeFromMyList = async (itemId) => {
    if (!itemId) return;
    const result = await deleteData(`/api/myList/${itemId}`);
    if (result?.success) {
      setMyListItems((items) => items.filter((item) => item._id !== itemId));
      alertBox("success", "Product removed from My List.");
    } else {
      alertBox("error", result?.message || "Unable to remove product.");
    }
  };

  const addToCompare = (product) => {
    if (!product?._id) return;
    if (compareIds.includes(product._id)) {
      alertBox("error", "This product is already in Compare.");
      return;
    }
    if (compareIds.length >= 4) {
      alertBox("error", "You can compare up to 4 products.");
      return;
    }
    setCompareIds((ids) => [...ids, product._id]);
    alertBox("success", "Product added to Compare.");
  };

  const removeFromCompare = (productId) =>
    setCompareIds((ids) => ids.filter((id) => id !== productId));

  const clearCompare = () => setCompareIds([]);

  const updateCartQty = async (cartItemId, qty, size) => {
    if (!cartItemId) {
      return null;
    }

    const result = await putData("/api/cart/update-qty", {
      _id: cartItemId,
      qty,
      size,
    });

    if (result?.success) {
      await loadCart();
    }

    return result;
  };

  const removeFromCart = async (cartItemId, productId) => {
    if (!cartItemId) {
      return null;
    }

    const result = await deleteData("/api/cart/delete-cart-item", {
      _id: cartItemId,
      productId,
    });

    if (result?.success) {
      await loadCart();
    }

    return result;
  };

  const alertBox = (status, msg) => {
    if (status === "success") {
      toast.success(msg);
    }
    if (status === "error") {
      toast.error(msg);
    }
  };

  const logout = async () => {
    try {
      await fetchDataFromApi("/api/user/logout");
    } finally {
      localStorage.removeItem("accesstoken");
      localStorage.removeItem("refreshToken");
      setUserData(null);
      setCartItems([]);
      setMyListItems([]);
      setOpenCartPanel(false);
      setIsLogin(false);
    }
  };

  const values = {
    setOpenProductDetailsModal,
    setOpenCartPanel,
    alertBox,
    isLogin,
    setIsLogin,
    setUserData,
    logout,
    userData,
    catData,
    products,
    catalogLoading,
    selectedProduct,
    openProductPreview,
    setProducts,
    cartItems,
    cartLoading,
    addToCart,
    loadCart,
    updateCartQty,
    removeFromCart,
    myListItems,
    myListLoading,
    loadMyList,
    addToMyList,
    removeFromMyList,
    compareIds,
    compareItems: compareIds
      .map((id) => products.find((product) => product._id === id))
      .filter(Boolean),
    addToCompare,
    removeFromCompare,
    clearCompare,
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        <ScrollToTop />
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productListing" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/shop/:sellerId" element={<StorePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route
            path="/my-list"
            element={
              <ProtectedRoute isLogin={isLogin}>
                <MyList />
              </ProtectedRoute>
            }
          />
          <Route path="/my-orders" element={<Orders />} />
          <Route path="/address" element={<Address />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/help-center" element={<HelpCenter />} />
        </Routes>

        <Footer />

        <Toaster />

        <Dialog
          open={openProductDetailsModal}
          onClose={handleCloseProductDetailsModal}
          fullWidth={fullWidth}
          maxWidth={maxWidth}
          className="productDetailsModal"
        >
          <DialogContent>
            <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10 w-full productDetailsModalContainer relative">
              <Button
                className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] !absolute top-0 right-0 !bg-[#f1f1f1] !z-20"
                onClick={handleCloseProductDetailsModal}
              >
                <IoCloseSharp className="text-[20px]" />
              </Button>

              <div className="col1 w-full lg:w-[48%] pt-12 lg:pt-0 min-w-0">
                <ProductZoom product={selectedProduct} />
              </div>

              <div className="col2 w-full lg:w-[52%] py-5 lg:py-8 lg:pr-16 productContent">
                <ProductDetailsComponent product={selectedProduct} />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Drawer
          open={openCartPanel}
          onClose={toggleCartPanel(false)}
          anchor="right"
          className="cartPanel"
        >
          <div
            className="flex items-center justify-between py-3 px-4 gap-3 border-b
           border-[rgba(51,51,51,0.1)] overflow-hidden"
          >
            <h4>Shopping Cart ({cartItems.length})</h4>

            <IoCloseSharp
              className="text-[20px] cursor-pointer"
              onClick={toggleCartPanel(false)}
            />
          </div>

          <CartPanel />
        </Drawer>
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
export { MyContext };
