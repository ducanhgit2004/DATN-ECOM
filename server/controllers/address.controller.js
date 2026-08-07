import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";
import { isValidPhone, normalizePhone } from "../utils/phone.js";

export const addAddressController = async (request, response) => {
  try {
    const userId = request.userId;
    const { address_line1, city, state, pincode, country, mobile, status } =
      request.body;

    if (
      !address_line1 ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !mobile ||
      status === undefined
    ) {
      return response.status(500).json({
        message: "Please provide all the fields",
        error: true,
        success: false,
      });
    }
    if (!isValidPhone(mobile)) {
      return response.status(400).json({
        message: "Phone number must contain 9 to 15 digits",
        error: true,
        success: false,
      });
    }

    const address = new AddressModel({
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile: normalizePhone(mobile),
      status,
      userId,
    });

    const saveAddress = await address.save();

    await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          address_details: saveAddress?._id,
        },
      },
    );

    return response.status(200).json({
      data: saveAddress,
      message: "Address add successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getAllAddressController = async (request, response) => {
  try {
    const userId = request.userId;

    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false,
      });
    }

    const address = await AddressModel.find({ userId }).sort({ createdAt: -1 });

    if (!address || address.length === 0) {
      return response.status(200).json({
        error: false,
        success: true,
        address: [],
        message: "No address found",
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      address,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const selectAddressController = async (request, response) => {
  try {
    const userId = request.userId;
    const addressId =
      request.body?.addressId ||
      request.query?.addressId ||
      request.params?.addressId;

    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false,
      });
    }

    if (!addressId) {
      return response.status(400).json({
        message: "Address ID is required",
        error: true,
        success: false,
      });
    }

    const address = await AddressModel.findOne({ _id: addressId, userId });

    if (!address) {
      return response.status(404).json({
        message: "Address not found",
        error: true,
        success: false,
      });
    }

    await AddressModel.updateMany({ userId }, { $set: { status: false } });
    await AddressModel.updateOne(
      { _id: addressId, userId },
      { $set: { status: true } },
    );

    return response.status(200).json({
      message: "Address selected successfully",
      error: false,
      success: true,
      data: {
        ...address.toObject(),
        status: true,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const updateAddressController = async (request, response) => {
  try {
    const userId = request.userId;
    const { addressId } = request.params;
    const { address_line1, city, state, pincode, country, mobile, status } =
      request.body;

    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false,
      });
    }

    if (!addressId) {
      return response.status(400).json({
        message: "Address ID is required",
        error: true,
        success: false,
      });
    }

    if (!address_line1 || !city || !state || !pincode || !country || !mobile) {
      return response.status(400).json({
        message: "Please provide all required fields",
        error: true,
        success: false,
      });
    }
    if (!isValidPhone(mobile)) {
      return response.status(400).json({
        message: "Phone number must contain 9 to 15 digits",
        error: true,
        success: false,
      });
    }

    const address = await AddressModel.findOne({ _id: addressId, userId });

    if (!address) {
      return response.status(404).json({
        message: "Address not found",
        error: true,
        success: false,
      });
    }

    const updatedAddress = await AddressModel.findByIdAndUpdate(
      addressId,
      {
        address_line1,
        city,
        state,
        pincode,
        country,
        mobile: normalizePhone(mobile),
        status: status ?? address.status,
      },
      { new: true },
    );

    return response.status(200).json({
      data: updatedAddress,
      message: "Address updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteAddressController = async (request, response) => {
  try {
    const userId = request.userId;
    const { addressId } = request.params;

    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false,
      });
    }

    if (!addressId) {
      return response.status(400).json({
        message: "Address ID is required",
        error: true,
        success: false,
      });
    }

    const address = await AddressModel.findOne({ _id: addressId, userId });

    if (!address) {
      return response.status(404).json({
        message: "Address not found",
        error: true,
        success: false,
      });
    }

    await AddressModel.findByIdAndDelete(addressId);

    await UserModel.updateOne(
      { _id: userId },
      {
        $pull: {
          address_details: addressId,
        },
      },
    );

    return response.status(200).json({
      message: "Address deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
