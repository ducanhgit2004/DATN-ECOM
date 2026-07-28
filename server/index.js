import "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import myListRouter from "./route/mylist.route.js";
import addressRouter from "./route/address.route.js";
import homeSliderRouter from "./route/homeSlider.route.js";
import categoryBannerRouter from "./route/categoryBanner.route.js";
import blogRouter from "./route/blog.route.js";
import orderRouter from "./route/order.route.js";
import sellerRouter from "./route/seller.route.js";

const app = express();

// middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// ❌ XÓA app.options("*", cors()); vì gây lỗi Express 5
// app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

// test route
app.get("/", (req, res) => {
  res.json({
    message: "Server is running " + process.env.PORT,
  });
});

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/myList", myListRouter);
app.use("/api/address", addressRouter);
app.use("/api/home-sliders", homeSliderRouter);
app.use("/api/category-banners", categoryBannerRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/order", orderRouter);
app.use("/api/seller", sellerRouter);

const PORT = process.env.PORT || 5000;

// start server after DB connect
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
  });
});
