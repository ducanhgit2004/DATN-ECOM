import mongoose from "mongoose";

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn(
      "MONGODB_URI is not set. Server will start without a database connection.",
    );
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error("MongoDB connect error", error.message || error);
    return false;
  }
}

export default connectDB;
