import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { BsFillBagCheckFill } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData, putData } from "../../utils/api";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const loadPaypalScript = ({ clientId, currency }) =>
  new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }
    const existing = document.getElementById("paypal-checkout-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.paypal), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "paypal-checkout-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("Unable to load the PayPal checkout"));
    document.body.appendChild(script);
  });

const Checkout = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const cartItems = useMemo(() => context?.cartItems || [], [context?.cartItems]);
  const alertBox = context?.alertBox;
  const loadCart = context?.loadCart;
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState("");
  const paypalContainerRef = useRef(null);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState("");
  const [addressForm, setAddressForm] = useState({
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
    country: "Việt Nam",
    mobile: "",
  });

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          Number(item?.productId?.price || 0) * Number(item?.quantity || 1),
        0,
      ),
    [cartItems],
  );
  const shipping = subtotal > 0 ? 7 : 0;
  const total = subtotal + shipping;

  const loadAddresses = useCallback(async (preferredAddressId = "") => {
    if (!context?.userData?._id) return;

    try {
      setLoadingAddresses(true);
      const response = await fetchDataFromApi("/api/address/get");
      if (response?.success) {
        const nextAddresses = response.address || [];
        setAddresses(nextAddresses);
        const defaultAddress = nextAddresses.find((address) => address.status);
        setSelectedAddressId(
          preferredAddressId ||
            defaultAddress?._id ||
            nextAddresses[0]?._id ||
            "",
        );
      }
    } catch (error) {
      console.error("Failed to load addresses", error);
    } finally {
      setLoadingAddresses(false);
    }
  }, [context?.userData?._id]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadAddresses(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAddresses]);

  useEffect(() => {
    if (
      paymentMethod !== "PAYPAL" ||
      !selectedAddressId ||
      !cartItems.length ||
      !paypalContainerRef.current
    ) {
      return undefined;
    }

    let cancelled = false;
    let buttons;
    const renderPaypal = async () => {
      try {
        setPaypalLoading(true);
        setPaypalError("");
        const configResponse = await fetchDataFromApi("/api/order/paypal/config");
        if (!configResponse?.success) {
          throw new Error(configResponse?.message || "PayPal is unavailable");
        }
        const paypal = await loadPaypalScript(configResponse.data);
        if (cancelled || !paypalContainerRef.current) return;
        paypalContainerRef.current.innerHTML = "";
        buttons = paypal.Buttons({
          style: { layout: "vertical", shape: "rect", label: "paypal" },
          createOrder: async () => {
            setPlacingOrder(true);
            const result = await postData("/api/order/paypal/create", {
              addressId: selectedAddressId,
            });
            if (!result?.success) {
              setPlacingOrder(false);
              throw new Error(result?.message || "Unable to initialize PayPal payment");
            }
            return result.data.paypalOrderId;
          },
          onApprove: async ({ orderID }) => {
            const result = await postData("/api/order/paypal/capture", {
              paypalOrderId: orderID,
            });
            setPlacingOrder(false);
            if (!result?.success) {
              alertBox?.("error", result?.message || "PayPal payment could not be verified.");
              return;
            }
            alertBox?.("success", "PayPal payment successful. Order placed.");
            await loadCart?.();
            navigate("/my-orders");
          },
          onCancel: () => {
            setPlacingOrder(false);
            alertBox?.("info", "PayPal payment was cancelled.");
          },
          onError: (error) => {
            setPlacingOrder(false);
            alertBox?.("error", error?.message || "PayPal checkout failed. Please try again.");
          },
        });
        if (!buttons.isEligible()) {
          throw new Error("PayPal is not available for this browser or account");
        }
        await buttons.render(paypalContainerRef.current);
      } catch (error) {
        if (!cancelled) setPaypalError(error.message || "Unable to load PayPal");
      } finally {
        if (!cancelled) setPaypalLoading(false);
      }
    };
    renderPaypal();

    return () => {
      cancelled = true;
      buttons?.close?.();
    };
  }, [alertBox, cartItems.length, loadCart, navigate, paymentMethod, selectedAddressId]);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setAddressForm((current) => ({ ...current, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setAddressForm((current) => ({ ...current, mobile: value }));
  };

  const openAddAddress = () => {
    setEditingAddressId("");
    setAddressForm({
      address_line1: "",
      city: "",
      state: "",
      pincode: "",
      country: "Việt Nam",
      mobile: "",
    });
    setOpenAddressDialog(true);
  };

  const openEditAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      address_line1: address.address_line1 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "",
      mobile: address.mobile == null ? "" : String(address.mobile),
    });
    setOpenAddressDialog(true);
  };

  const handleAddAddress = async () => {
    const missingField = Object.values(addressForm).some(
      (value) => !String(value).trim(),
    );
    if (missingField) {
      context?.alertBox?.("error", "Please fill in all address fields.");
      return;
    }

    setSavingAddress(true);
    const payload = {
      ...addressForm,
      status: editingAddressId
        ? Boolean(
            addresses.find((address) => address._id === editingAddressId)
              ?.status,
          )
        : addresses.length === 0,
    };
    const result = editingAddressId
      ? await putData(`/api/address/${editingAddressId}`, payload)
      : await postData("/api/address/add", payload);

    if (result?.success) {
      context?.alertBox?.(
        "success",
        editingAddressId
          ? "Address updated successfully."
          : "Address added successfully.",
      );
      setOpenAddressDialog(false);
      setAddressForm({
        address_line1: "",
        city: "",
        state: "",
        pincode: "",
        country: "Việt Nam",
        mobile: "",
      });
      await loadAddresses(result?.data?._id || editingAddressId);
    } else {
      context?.alertBox?.("error", result?.message || "Unable to add address.");
    }
    setSavingAddress(false);
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      context?.alertBox?.("error", "Your cart is empty.");
      return;
    }
    if (!selectedAddressId) {
      context?.alertBox?.("error", "Please select a delivery address.");
      return;
    }

    if (paymentMethod === "RAZORPAY") {
      await handleRazorpayCheckout();
      return;
    }

    setPlacingOrder(true);
    const result = await postData("/api/order/create", {
      addressId: selectedAddressId,
      paymentMethod: "COD",
    });

    if (result?.success) {
      context?.alertBox?.("success", "Order placed successfully.");
      await context?.loadCart?.();
      navigate("/my-orders");
    } else {
      context?.alertBox?.("error", result?.message || "Unable to place order.");
    }
    setPlacingOrder(false);
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpayCheckout = async () => {
    setPlacingOrder(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      context?.alertBox?.("error", "Unable to load Razorpay Checkout.");
      setPlacingOrder(false);
      return;
    }

    const paymentOrder = await postData("/api/order/razorpay/create", {
      addressId: selectedAddressId,
    });
    if (!paymentOrder?.success) {
      context?.alertBox?.(
        "error",
        paymentOrder?.message || "Unable to initialize Razorpay payment.",
      );
      setPlacingOrder(false);
      return;
    }

    const payment = paymentOrder.data;
    const razorpay = new window.Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      order_id: payment.razorpayOrderId,
      name: "NovaCart",
      description: "Order payment",
      prefill: {
        name: payment.customer?.name || "",
        email: payment.customer?.email || "",
        contact: payment.contact || "",
      },
      theme: { color: "#ff5252" },
      modal: {
        ondismiss: () => setPlacingOrder(false),
      },
      handler: async (razorpayResponse) => {
        const verification = await postData(
          "/api/order/razorpay/verify",
          razorpayResponse,
        );
        if (verification?.success) {
          context?.alertBox?.("success", "Payment successful. Order placed.");
          await context?.loadCart?.();
          navigate("/my-orders");
        } else {
          context?.alertBox?.(
            "error",
            verification?.message || "Payment verification failed.",
          );
        }
        setPlacingOrder(false);
      },
    });
    razorpay.on("payment.failed", (failure) => {
      context?.alertBox?.(
        "error",
        failure?.error?.description || "Payment failed. Please try again.",
      );
      setPlacingOrder(false);
    });
    razorpay.open();
  };

  return (
    <section className="py-10">
      <div className="container flex gap-5">
        <div className="leftCol w-[70%]">
          <div className="card bg-white shadow-md p-5 rounded-md">
            <h1>Billing Details</h1>

            <form
              className="w-full mt-4"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="flex items-center gap-5 pb-5">
                <TextField
                  className="w-1/2"
                  label="Full Name"
                  size="small"
                  value={context?.userData?.name || ""}
                  slotProps={{ input: { readOnly: true } }}
                />
                <TextField
                  className="w-1/2"
                  label="Email"
                  size="small"
                  value={context?.userData?.email || ""}
                  slotProps={{ input: { readOnly: true } }}
                />
              </div>

              <div className="mb-3 flex items-center justify-between">
                <h6 className="text-[14px] font-[500]">Saved Addresses</h6>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={openAddAddress}
                  className="!border-orange-500 !text-orange-500"
                >
                  + Add New Address
                </Button>
              </div>
              {loadingAddresses ? (
                <p className="mb-4 text-sm text-gray-500">
                  Loading saved addresses...
                </p>
              ) : addresses.length ? (
                <FormControl component="fieldset" className="w-full mb-4">
                  <RadioGroup
                    value={selectedAddressId}
                    onChange={(event) =>
                      setSelectedAddressId(event.target.value)
                    }
                  >
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className="relative mb-3 rounded-md border border-gray-200 p-3 pr-14"
                      >
                        <FormControlLabel
                          value={address._id}
                          control={<Radio />}
                          label={`${address.address_line1}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`}
                        />
                        <p className="ml-8 text-sm text-gray-500">
                          Phone: {address.mobile}
                        </p>
                        <Button
                          size="small"
                          aria-label={`Edit ${address.address_line1 || "address"}`}
                          onClick={() => openEditAddress(address)}
                          className="!absolute !right-2 !top-2 !min-w-[36px] !text-blue-600 hover:!bg-blue-50"
                        >
                          <MdEdit className="text-lg" />
                        </Button>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              ) : (
                <p className="mb-4 text-sm text-gray-500">
                  No saved addresses yet. Please add an address from your
                  account.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="rightCol w-[30%]">
          <div className="card shadow-md bg-white p-5 rounded-md">
            <h2 className="mb-4">Your Order</h2>
            <div className="flex items-center justify-between py-3 border-t border-b border-[rgba(0,0,0,0.1)]">
              <span className="text-[14px] font-[600]">Product</span>
              <span className="text-[14px] font-[600]">Subtotal</span>
            </div>

            <div className="mb-3 max-h-[250px] overflow-y-auto overflow-x-hidden pr-2">
              {!cartItems.length ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  Your cart is empty.
                </p>
              ) : (
                cartItems.map((item) => {
                  const product = item?.productId;
                  const quantity = Number(item?.quantity || 1);
                  const lineTotal = Number(product?.price || 0) * quantity;
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {product?.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-[14px]">
                            {product?.name || "Unavailable product"}
                          </h4>
                          <span className="text-[13px] text-gray-500">
                            Qty: {quantity}
                            {item?.size ? ` · ${item.size}` : ""}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-[14px] font-[500]">
                        {money(lineTotal)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-2 border-t py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{money(shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-[#ff5252]">
                  {money(total)}
                </span>
              </div>
            </div>

            <div className="mb-5 border-t pt-3">
              <p className="mb-2 text-[14px] font-semibold">Payment Method</p>
              <RadioGroup
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <FormControlLabel
                  value="COD"
                  control={<Radio size="small" />}
                  label="Cash on Delivery"
                />
                <FormControlLabel
                  value="RAZORPAY"
                  control={<Radio size="small" />}
                  label="Pay Online with Razorpay"
                />
                <FormControlLabel
                  value="PAYPAL"
                  control={<Radio size="small" />}
                  label="Pay securely with PayPal"
                />
              </RadioGroup>
            </div>

            {paymentMethod === "PAYPAL" ? (
              <div>
                {paypalLoading && (
                  <p className="mb-2 text-center text-sm text-gray-500">
                    Loading PayPal...
                  </p>
                )}
                {paypalError && (
                  <p className="mb-2 text-center text-sm text-red-600">{paypalError}</p>
                )}
                {!selectedAddressId && (
                  <p className="mb-2 text-center text-sm text-gray-500">
                    Select a delivery address to continue with PayPal.
                  </p>
                )}
                <div ref={paypalContainerRef} className={placingOrder ? "pointer-events-none opacity-60" : ""} />
              </div>
            ) : (
              <Button
                className="btn-org btn-lg w-full flex gap-2 items-center"
                onClick={handleCheckout}
                disabled={placingOrder || !cartItems.length || !selectedAddressId}
              >
                <BsFillBagCheckFill className="text-[20px]" />
                {placingOrder
                  ? paymentMethod === "RAZORPAY"
                    ? "Opening payment..."
                    : "Placing order..."
                  : paymentMethod === "RAZORPAY"
                    ? "Pay with Razorpay"
                    : "Place Order"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={openAddressDialog}
        onClose={() => !savingAddress && setOpenAddressDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingAddressId ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogContent className="!pt-3">
          <div className="grid grid-cols-2 gap-4 pt-2">
            <TextField
              className="col-span-2"
              label="Street Address"
              name="address_line1"
              value={addressForm.address_line1}
              onChange={handleAddressChange}
              required
              size="small"
            />
            <TextField
              label="Town / City"
              name="city"
              value={addressForm.city}
              onChange={handleAddressChange}
              required
              size="small"
            />
            <TextField
              label="State / County"
              name="state"
              value={addressForm.state}
              onChange={handleAddressChange}
              required
              size="small"
            />
            <TextField
              label="Postcode / ZIP"
              name="pincode"
              value={addressForm.pincode}
              onChange={handleAddressChange}
              required
              size="small"
            />
            <TextField
              label="Country"
              name="country"
              value={addressForm.country}
              onChange={handleAddressChange}
              required
              size="small"
            />
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">
                Phone Number *
              </label>
              <PhoneInput
                defaultCountry="vn"
                value={addressForm.mobile}
                onChange={handlePhoneChange}
                inputClassName="!w-full"
                countrySelectorStyleProps={{
                  buttonClassName: "!border-gray-300",
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="!p-4">
          <Button
            onClick={() => setOpenAddressDialog(false)}
            disabled={savingAddress}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddAddress}
            disabled={savingAddress}
            className="!bg-orange-500 hover:!bg-orange-600"
          >
            {savingAddress
              ? "Saving..."
              : editingAddressId
                ? "Update Address"
                : "Save Address"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default Checkout;
