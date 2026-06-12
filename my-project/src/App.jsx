import React, { useState, createContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const MyContext = createContext();

function App() {
  const [openProductDetailsModal, setOpenProductDetailsModal] = useState(false);
  const [openCartPanel, setOpenCartPanel] = useState(false);

  const [maxWidth] = useState("xl");
  const [fullWidth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  const handleCloseProductDetailsModal = () => {
    setOpenProductDetailsModal(false);
  };

  const toggleCartPanel = (newOpen) => () => {
    setOpenCartPanel(newOpen);
  };

  const openAlertBox = (status, msg) => {
    if (status === "success") {
      toast.success(msg);
    }
    if (status === "error") {
      toast.error(msg);
    }
  };

  const values = {
    setOpenProductDetailsModal,
    setOpenCartPanel,
    openAlertBox,
    isLogin,
    setIsLogin,
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productListing" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/my-orders" element={<Orders />} />
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
            <div className="flex items-center w-full productDetailsModalContainer relative">
              <Button
                className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] !absolute top-[15px] right-[15px] !bg-[#f1f1f1]"
                onClick={handleCloseProductDetailsModal}
              >
                <IoCloseSharp className="text-[20px]" />
              </Button>

              <div className="col1 w-[40%] px-3">
                <ProductZoom />
              </div>

              <div className="col2 w-[60%] py-8 px-8 pr-16 productContent">
                <ProductDetailsComponent />
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
            <h4>Shopping Cart (1)</h4>

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
