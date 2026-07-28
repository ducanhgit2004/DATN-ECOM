import React, { useContext, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";

const AddAddress = () => {
  const noLabelId = React.useId();
  const context = useContext(MyContext);

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    mobile: "",
    status: "",
    userId: context?.userData?._id || "",
  });

  const handleChangeInput = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleChangeStatus = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      status: event.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      address_line1: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      mobile: "",
      status: "",
      userId: context?.userData?._id || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.address_line1.trim()) {
      context?.alertBox?.("error", "Please enter Address Line 1");
      return;
    }

    if (!formData.city.trim()) {
      context?.alertBox?.("error", "Please enter City");
      return;
    }

    if (!formData.state.trim()) {
      context?.alertBox?.("error", "Please enter State");
      return;
    }

    if (!formData.pincode.trim()) {
      context?.alertBox?.("error", "Please enter Pincode");
      return;
    }

    if (!formData.country.trim()) {
      context?.alertBox?.("error", "Please enter Country");
      return;
    }

    if (!formData.mobile.trim()) {
      context?.alertBox?.("error", "Please enter Mobile Number");
      return;
    }

    if (formData.status === "") {
      context?.alertBox?.("error", "Please select Status");
      return;
    }

    const userId = context?.userData?._id;

    if (!userId) {
      context?.alertBox?.("error", "User information was not found");
      return;
    }

    const payload = {
      ...formData,
      userId,
      status: formData.status === true || formData.status === "true",
    };

    try {
      setIsLoading(true);

      const response = await postData("/api/address/add", payload);

      if (response?.success === true) {
        context?.alertBox?.(
          "success",
          response?.message || "Address added successfully",
        );

        context?.setAddressRefreshKey?.((previousValue) => previousValue + 1);
        context?.setIsOpenFullScreenPanel?.({ open: false, model: "" });
        resetForm();
      } else {
        context?.alertBox?.(
          "error",
          response?.message || "Unable to add address",
        );
      }
    } catch (error) {
      console.error("Add address error:", error);

      context?.alertBox?.(
        "error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="p-5 bg-gray-50">
      <form className="form py-3 p-8" onSubmit={handleSubmit}>
        <div className="scroll max-h-[80vh] overflow-y-scroll pr-4 pt-4">
          <div className="grid grid-cols-2 mb-3 gap-4">
            <div className="col w-[100%]">
              <h3 className="text-[14px] font-[500] mb-1 text-black">
                Address Line 1
              </h3>

              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChangeInput}
                disabled={isLoading}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)]
                focus:outline-none focus:border-[rgba(0,0,0,0.4)]
                rounded-sm p-3 text-sm"
              />
            </div>

            <div className="col w-[100%]">
              <h3 className="text-[14px] font-[500] mb-1 text-black">City</h3>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChangeInput}
                disabled={isLoading}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)]
                focus:outline-none focus:border-[rgba(0,0,0,0.4)]
                rounded-sm p-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 mb-3 gap-4">
            <div className="col w-[100%]">
              <h3 className="text-[14px] font-[500] mb-1 text-black">State</h3>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChangeInput}
                disabled={isLoading}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)]
                focus:outline-none focus:border-[rgba(0,0,0,0.4)]
                rounded-sm p-3 text-sm"
              />
            </div>

            <div className="col w-[100%]">
              <h3 className="text-[14px] font-[500] mb-1 text-black">
                Pincode
              </h3>

              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChangeInput}
                disabled={isLoading}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)]
                focus:outline-none focus:border-[rgba(0,0,0,0.4)]
                rounded-sm p-3 text-sm"
              />
            </div>

            <div className="col w-[100%]">
              <h3 className="text-[14px] font-[500] mb-1 text-black">
                Country
              </h3>

              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChangeInput}
                disabled={isLoading}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)]
                focus:outline-none focus:border-[rgba(0,0,0,0.4)]
                rounded-sm p-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 mb-3 gap-4">
            <div className="col w-[100%]">
              <h3 className="text-[14px] font-[500] mb-1 text-black">
                Mobile No
              </h3>

              <PhoneInput
                defaultCountry="vn"
                value={formData.mobile}
                onChange={(value) => {
                  setFormData((previousData) => ({
                    ...previousData,
                    mobile:
                      typeof value === "string" ? value : String(value ?? ""),
                  }));
                }}
                disabled={isLoading}
                inputClassName="!w-full !h-[40px]"
                countrySelectorStyleProps={{
                  buttonClassName: "!border-gray-300 !h-[40px]",
                }}
              />
            </div>

            <div className="col w-[100%]">
              <h3 className="text-[14px] font-[500] mb-1 text-black">Status</h3>

              <Select
                aria-describedby={`${noLabelId}-helper-text`}
                value={formData.status}
                onChange={handleChangeStatus}
                displayEmpty
                inputProps={{ "aria-label": "Status" }}
                size="small"
                className="w-full"
                disabled={isLoading}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>

                <MenuItem value={true}>True</MenuItem>
                <MenuItem value={false}>False</MenuItem>
              </Select>
            </div>
          </div>

          <br />
        </div>

        <br />

        <div className="w-[250px]">
          <Button
            type="submit"
            disabled={isLoading}
            className="btn-blue btn-lg w-full flex gap-2"
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <FaCloudUploadAlt className="text-[25px] text-white" />
                Publish and View
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default AddAddress;
