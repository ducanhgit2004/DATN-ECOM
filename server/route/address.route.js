import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  addAddressController,
  getAllAddressController,
  updateAddressController,
  deleteAddressController,
} from "../controllers/address.controller.js";

const addressRouter = Router();

addressRouter.post("/add", auth, addAddressController);
addressRouter.get("/get", auth, getAllAddressController);
addressRouter.put("/:addressId", auth, updateAddressController);
addressRouter.delete("/:addressId", auth, deleteAddressController);

export default addressRouter;
