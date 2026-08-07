import React, { useContext, useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Radio from "@mui/material/Radio";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { isValidPhone, normalizePhone } from "../../utils/phone";
import { MyContext } from "../../App";
import { MdDelete, MdEdit } from "react-icons/md";

const Address = () => {
  const context = useContext(MyContext);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });
  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("addresses");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return [];
    }
  };

  const saveToLocalStorage = (addressList) => {
    try {
      localStorage.setItem("addresses", JSON.stringify(addressList));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/address/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Backend API not ready - received HTML instead of JSON",
        );
      }

      const data = await response.json();
      console.log("Fetch addresses response:", data);

      if (data.success) {
        const addressList = (data.address || []).map((addr) => ({
          _id: addr._id,
          name: addr.address_line1,
          street: addr.address_line1,
          city: addr.city,
          state: addr.state,
          postalCode: addr.pincode,
          country: addr.country,
          phone: addr.mobile == null ? "" : String(addr.mobile),
          isDefault: addr.status,
        }));
        setAddresses(addressList);
        saveToLocalStorage(addressList);
        if (addressList.length > 0 && !selectedAddressId) {
          setSelectedAddressId(addressList[0]._id);
        }
      } else {
        console.warn("Failed to fetch addresses:", data.message);
        context?.alertBox?.(
          "warning",
          data.message || "Failed to load addresses",
        );
      }
    } catch (error) {
      console.warn("API failed, using localStorage fallback:", error.message);
      // Fallback to localStorage
      const storedAddresses = loadFromLocalStorage();
      setAddresses(storedAddresses);
      if (storedAddresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(storedAddresses[0]._id);
      }
      context?.alertBox?.(
        "info",
        "Using local storage (Backend API not ready yet)",
      );
    }
  };

  const handleOpenDialog = (address = null) => {
    if (address) {
      setEditingId(address._id);
      setFormData({
        name: address.name || "",
        phone: address.phone == null ? "" : String(address.phone),
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        country: address.country || "",
        isDefault: address.isDefault || false,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        isDefault: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: normalizePhone(value),
    }));
  };

  const handleSaveAddress = async () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.postalCode
    ) {
      context?.alertBox?.("error", "Please fill in all required fields");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      context?.alertBox?.("error", "Phone number must contain 9 to 15 digits.");
      return;
    }

    try {
      setIsLoading(true);
      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/api/address/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/address/add`;

      // Convert frontend fields to backend fields
      const payload = {
        address_line1: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.postalCode,
        country: formData.country,
        mobile: formData.phone,
        status: formData.isDefault,
      };

      console.log("Saving address to:", url);
      console.log("Data:", payload);

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Backend API not ready - received HTML instead of JSON",
        );
      }

      const data = await response.json();
      console.log("Save response:", data);

      if (data.success) {
        context?.alertBox?.(
          "success",
          editingId
            ? "Address updated successfully"
            : "Address added successfully",
        );
        fetchAddresses();
        handleCloseDialog();
      } else {
        context?.alertBox?.("error", data.message || "Failed to save address");
      }
    } catch (error) {
      console.warn("API failed, using localStorage fallback:", error.message);
      // Fallback to localStorage
      const storedAddresses = loadFromLocalStorage();
      let updatedAddresses;

      if (editingId) {
        // Update existing
        updatedAddresses = storedAddresses.map((addr) =>
          addr._id === editingId ? { ...formData, _id: editingId } : addr,
        );
      } else {
        // Add new
        const newAddress = {
          ...formData,
          _id: Date.now().toString(), // Simple ID generation
        };
        updatedAddresses = [...storedAddresses, newAddress];
      }

      saveToLocalStorage(updatedAddresses);
      setAddresses(updatedAddresses);

      context?.alertBox?.(
        "success",
        (editingId ? "Updated" : "Added") +
          " (Using local storage - Backend API not ready)",
      );
      handleCloseDialog();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setIsDeleting(true);
      console.log("Deleting address:", addressId);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/address/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Backend API not ready - received HTML instead of JSON",
        );
      }

      const data = await response.json();
      console.log("Delete response:", data);

      if (data.success) {
        context?.alertBox?.("success", "Address deleted successfully");
        fetchAddresses();
      } else {
        context?.alertBox?.(
          "error",
          data.message || "Failed to delete address",
        );
      }
    } catch (error) {
      console.warn("API failed, using localStorage fallback:", error.message);
      // Fallback to localStorage
      const storedAddresses = loadFromLocalStorage();
      const updatedAddresses = storedAddresses.filter(
        (addr) => addr._id !== addressId,
      );
      saveToLocalStorage(updatedAddresses);
      setAddresses(updatedAddresses);

      context?.alertBox?.(
        "success",
        "Deleted (Using local storage - Backend API not ready)",
      );
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <section className="py-10 w-full">
      <div className="container flex gap-5">
        <div className="col1 w-[20%]">
          <AccountSidebar />
        </div>

        <div className="col2 w-[50%]">
          <div className="card bg-white p-5 shadow-md rounded-md mb-5">
            <div className="flex items-center pb-3">
              <h2 className="pb-0">My Addresses</h2>
              <Button
                variant="contained"
                className="!ml-auto !bg-orange-500 hover:!bg-orange-600"
                onClick={() => handleOpenDialog()}
              >
                + Add New Address
              </Button>
            </div>
            <hr className="text-[rgba(0,0,0,0.2)]" />

            <div className="mt-6">
              {addresses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No addresses found. Add one to get started!
                </p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <label
                      key={address._id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-4 hover:shadow-md transition"
                    >
                      <Radio
                        checked={selectedAddressId === address._id}
                        onChange={() => setSelectedAddressId(address._id)}
                        color="primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">
                            {address.name}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              size="small"
                              aria-label={`Edit ${address.name || "address"}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOpenDialog(address);
                              }}
                              className="!min-w-[36px] !text-blue-600 hover:!bg-blue-50"
                            >
                              <MdEdit className="text-lg" />
                            </Button>
                            <Button
                              size="small"
                              aria-label={`Delete ${address.name || "address"}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteTarget(address);
                              }}
                              className="!min-w-[36px] !text-red-500 hover:!bg-red-50"
                            >
                              <MdDelete className="text-lg" />
                            </Button>
                          </div>
                        </div>
                        {address.isDefault && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-2">
                            Default Address
                          </span>
                        )}
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          {address.country && <p>{address.country}</p>}
                          {address.phone && <p>Phone: {address.phone}</p>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Address Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogContent className="!pt-6">
          <div className="space-y-4 pb-4">
            <TextField
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Address Line 1"
              size="small"
            />

            <div className="grid grid-cols-2 gap-4 pt-3">
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                size="small"
              />
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                size="small"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                size="small"
              />
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                size="small"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <PhoneInput
                defaultCountry="us"
                value={formData.phone}
                onChange={handlePhoneChange}
                inputClassName="!w-full"
                countrySelectorStyleProps={{
                  buttonClassName: "!border-gray-300",
                }}
              />

              <TextField
                fullWidth
                label="Street Address"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                size="small"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                id="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
              />

              <label htmlFor="isDefault" className="text-sm cursor-pointer">
                Set as default address
              </label>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="!p-4">
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveAddress}
            variant="contained"
            className="!bg-orange-500 hover:!bg-orange-600"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Address"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Address?</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete
            {deleteTarget?.street ? ` “${deleteTarget.street}”` : " this address"}?
            This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="!p-4">
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteAddress(deleteTarget?._id)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default Address;
