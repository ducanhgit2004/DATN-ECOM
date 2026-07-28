import "../config/env.js";
import mongoose from "mongoose";
import UserModel from "../models/user.model.js";

const email = String(process.argv[2] || "").trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run make-admin -- admin@example.com");
  process.exitCode = 1;
} else if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not configured in server/.env");
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await UserModel.findOneAndUpdate(
      { email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
      { $set: { role: "ADMIN", status: "Active" } },
      { new: true },
    ).select("name email role status");

    if (!user) {
      console.error(`No registered user found with email: ${email}`);
      process.exitCode = 1;
    } else {
      console.log(`Admin enabled: ${user.email} (${user.name})`);
    }
  } catch (error) {
    console.error("Unable to promote user:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
