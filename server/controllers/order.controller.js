import crypto from "crypto";
import mongoose from "mongoose";
import AddressModel from "../models/address.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

const SHIPPING_FEE = 7;

const makeOrderId = () =>
  `ORD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const buildCheckoutData = async (userId, addressId) => {
  if (!mongoose.isValidObjectId(addressId)) {
    const error = new Error("A valid delivery address is required");
    error.status = 400;
    throw error;
  }

  const [user, address, cartItems] = await Promise.all([
    UserModel.findById(userId).select("name email"),
    AddressModel.findOne({ _id: addressId, userId }),
    CartProductModel.find({ userId }).populate("productId"),
  ]);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  if (!address) {
    const error = new Error("Delivery address not found");
    error.status = 404;
    throw error;
  }
  if (!cartItems.length) {
    const error = new Error("Your cart is empty");
    error.status = 400;
    throw error;
  }

  const invalidItem = cartItems.find(
    (item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1,
  );
  if (invalidItem) {
    const error = new Error("Your cart contains an unavailable or invalid product");
    error.status = 400;
    throw error;
  }

  const unavailableItem = cartItems.find((item) => {
    const product = item.productId;
    if (product.inventoryType === "none") return Number(product.countInStock) < item.quantity;
    const variant = product.inventoryVariants?.find(
      (entry) => String(entry.value) === String(item.size),
    );
    return !variant || Number(variant.stock) < item.quantity;
  });
  if (unavailableItem) {
    const error = new Error(`${unavailableItem.productId.name} does not have enough stock`);
    error.status = 409;
    throw error;
  }

  const items = cartItems.map((item) => {
    const price = Number(item.productId.price);
    return {
      sellerId: item.productId.sellerId || null,
      productId: item.productId._id,
      name: item.productId.name,
      image: item.productId.images?.[0] || "",
      price,
      quantity: item.quantity,
      size: item.size || "",
      subTotal: price * item.quantity,
    };
  });
  const subTotalAmt = items.reduce((sum, item) => sum + item.subTotal, 0);
  return {
    user,
    address,
    cartItems,
    items,
    subTotalAmt,
    shippingAmt: subTotalAmt > 0 ? SHIPPING_FEE : 0,
  };
};

const reserveStock = async (items) => {
  const reservedItems = [];
  for (const item of items) {
    const product = await ProductModel.findById(item.productId).select(
      "name inventoryType countInStock inventoryVariants",
    );
    if (!product) throw Object.assign(new Error(`${item.name} is unavailable`), { status: 409 });
    const simple = product.inventoryType === "none";
    const filter = simple
      ? { _id: product._id, countInStock: { $gte: item.quantity } }
      : {
          _id: product._id,
          countInStock: { $gte: item.quantity },
          inventoryVariants: {
            $elemMatch: { value: item.size, stock: { $gte: item.quantity } },
          },
        };
    const update = simple
      ? { $inc: { countInStock: -item.quantity } }
      : {
          $inc: {
            "inventoryVariants.$[variant].stock": -item.quantity,
            countInStock: -item.quantity,
          },
        };
    const options = simple ? {} : { arrayFilters: [{ "variant.value": item.size }] };
    const result = await ProductModel.updateOne(filter, update, options);
    if (result.modifiedCount !== 1) {
      for (const reserved of reservedItems) {
        const rollback = reserved.simple
          ? { $inc: { countInStock: reserved.quantity } }
          : {
              $inc: {
                "inventoryVariants.$[variant].stock": reserved.quantity,
                countInStock: reserved.quantity,
              },
            };
        await ProductModel.updateOne(
          { _id: reserved.productId },
          rollback,
          reserved.simple ? {} : { arrayFilters: [{ "variant.value": reserved.size }] },
        );
      }
      throw Object.assign(new Error(`${item.name} does not have enough stock`), { status: 409 });
    }
    reservedItems.push({ productId: product._id, quantity: item.quantity, size: item.size, simple });
  }
};

const getPaypalConfig = () => {
  const mode = String(process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  const live = mode === "live";
  const clientId = (
    live ? process.env.PAYPAL_CLIENT_ID_LIVE : process.env.PAYPAL_CLIENT_ID_TEST
  )?.trim();
  const secret = (
    live ? process.env.PAYPAL_SECRET_LIVE : process.env.PAYPAL_SECRET_TEST
  )?.trim();
  const baseUrl = (
    process.env.PAYPAL_BASE_URL ||
    (live ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com")
  ).trim();
  const currency = String(process.env.PAYPAL_CURRENCY || "USD").toUpperCase();
  return { clientId, secret, baseUrl, currency };
};

const getPaypalAccessToken = async () => {
  const config = getPaypalConfig();
  if (!config.clientId || !config.secret) {
    throw Object.assign(new Error("PayPal is not configured on the server"), { status: 503 });
  }
  const result = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await result.json();
  if (!result.ok || !data.access_token) {
    throw Object.assign(
      new Error(data?.error_description || "Unable to authenticate with PayPal"),
      { status: 502 },
    );
  }
  return { accessToken: data.access_token, config };
};

export const getPaypalConfigController = async (_request, response) => {
  const { clientId, currency } = getPaypalConfig();
  if (!clientId) {
    return response.status(503).json({
      message: "PayPal is not configured on the server",
      error: true,
      success: false,
    });
  }
  return response.json({ data: { clientId, currency }, error: false, success: true });
};

export const createPaypalOrderController = async (request, response) => {
  try {
    const checkout = await buildCheckoutData(request.userId, request.body?.addressId);
    const { accessToken, config } = await getPaypalAccessToken();
    const total = checkout.subTotalAmt + checkout.shippingAmt;
    if (!Number.isFinite(total) || total <= 0) {
      return response.status(400).json({ message: "Invalid order amount", error: true, success: false });
    }

    const localOrderId = makeOrderId();
    const paypalResponse = await fetch(`${config.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": localOrderId,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: localOrderId,
          custom_id: String(request.userId),
          invoice_id: localOrderId,
          items: checkout.items.map((item) => ({
            name: String(item.name).slice(0, 127),
            quantity: String(item.quantity),
            unit_amount: {
              currency_code: config.currency,
              value: Number(item.price).toFixed(2),
            },
          })),
          amount: {
            currency_code: config.currency,
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: config.currency,
                value: checkout.subTotalAmt.toFixed(2),
              },
              shipping: {
                currency_code: config.currency,
                value: checkout.shippingAmt.toFixed(2),
              },
            },
          },
        }],
      }),
    });
    const paypalOrder = await paypalResponse.json();
    if (!paypalResponse.ok) {
      return response.status(502).json({
        message: paypalOrder?.details?.[0]?.description || paypalOrder?.message || "Unable to create PayPal order",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.create({
      userId: request.userId,
      orderId: localOrderId,
      items: checkout.items,
      customer: { name: checkout.user.name, email: checkout.user.email },
      deliveryAddressId: checkout.address._id,
      deliveryAddress: {
        address_line1: checkout.address.address_line1,
        city: checkout.address.city,
        state: checkout.address.state,
        pincode: checkout.address.pincode,
        country: checkout.address.country,
        mobile: String(checkout.address.mobile),
      },
      paymentMethod: "PAYPAL",
      paypalOrderId: paypalOrder.id,
      currency: config.currency,
      subTotalAmt: checkout.subTotalAmt,
      shippingAmt: checkout.shippingAmt,
      totalAmt: total,
    });

    return response.status(201).json({
      data: { orderId: order._id, paypalOrderId: paypalOrder.id },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to initialize PayPal payment",
      error: true,
      success: false,
    });
  }
};

export const capturePaypalOrderController = async (request, response) => {
  try {
    const paypalOrderId = String(request.body?.paypalOrderId || "").trim();
    if (!paypalOrderId) {
      return response.status(400).json({ message: "PayPal order id is required", error: true, success: false });
    }
    const order = await OrderModel.findOne({
      paypalOrderId,
      userId: request.userId,
      paymentMethod: "PAYPAL",
    });
    if (!order) {
      return response.status(404).json({ message: "Payment order not found", error: true, success: false });
    }
    if (order.paymentStatus === "paid") {
      return response.json({ message: "Payment already captured", data: order, error: false, success: true });
    }

    const { accessToken, config } = await getPaypalAccessToken();
    const paypalOrderResponse = await fetch(
      `${config.baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const paypalOrder = await paypalOrderResponse.json();
    if (!paypalOrderResponse.ok) {
      return response.status(502).json({
        message: paypalOrder?.message || "Unable to verify the PayPal order",
        error: true,
        success: false,
      });
    }
    let capture = paypalOrder;
    if (paypalOrder.status !== "COMPLETED") {
      const captureResponse = await fetch(
        `${config.baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": `capture-${order.orderId}`,
          },
          body: "{}",
        },
      );
      capture = await captureResponse.json();
      if (!captureResponse.ok || capture.status !== "COMPLETED") {
        return response.status(502).json({
          message:
            capture?.details?.[0]?.description ||
            capture?.message ||
            "PayPal payment was not completed",
          error: true,
          success: false,
        });
      }
    }

    const unit = capture.purchase_units?.[0];
    const payment = unit?.payments?.captures?.[0];
    const paidValue = Number(payment?.amount?.value);
    const expectedValue = Number(order.totalAmt.toFixed(2));
    const invoiceMismatch = unit?.invoice_id && unit.invoice_id !== order.orderId;
    const customerMismatch =
      unit?.custom_id && unit.custom_id !== String(request.userId);
    if (
      capture.id !== paypalOrderId ||
      invoiceMismatch ||
      customerMismatch ||
      payment?.status !== "COMPLETED" ||
      payment?.amount?.currency_code !== order.currency ||
      !Number.isFinite(paidValue) ||
      Math.abs(paidValue - expectedValue) > 0.001
    ) {
      order.paymentStatus = "failed";
      await order.save();
      return response.status(400).json({
        message: "PayPal payment details do not match this order",
        error: true,
        success: false,
      });
    }

    await reserveStock(order.items);
    order.paymentId = payment.id;
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    await order.save();
    await Promise.all([
      CartProductModel.deleteMany({ userId: request.userId }),
      UserModel.updateOne(
        { _id: request.userId },
        { $set: { shopping_cart: [] }, $addToSet: { orderHistory: order._id } },
      ),
    ]);

    return response.json({
      message: "PayPal payment captured and order placed successfully",
      data: order,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to capture PayPal payment",
      error: true,
      success: false,
    });
  }
};

export const createRazorpayOrderController = async (request, response) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return response.status(503).json({
        message: "Razorpay is not configured on the server",
        error: true,
        success: false,
      });
    }

    const checkout = await buildCheckoutData(request.userId, request.body?.addressId);
    const currency = String(process.env.RAZORPAY_CURRENCY || "USD").toUpperCase();
    const amount = Math.round((checkout.subTotalAmt + checkout.shippingAmt) * 100);
    if (!Number.isSafeInteger(amount) || amount < 1) {
      return response.status(400).json({ message: "Invalid order amount", error: true, success: false });
    }

    const localOrderId = makeOrderId();
    const gatewayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: localOrderId.slice(0, 40),
        notes: { localOrderId, userId: String(request.userId) },
      }),
    });
    const gatewayOrder = await gatewayResponse.json();
    if (!gatewayResponse.ok) {
      return response.status(502).json({
        message: gatewayOrder?.error?.description || "Unable to create Razorpay order",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.create({
      userId: request.userId,
      orderId: localOrderId,
      items: checkout.items,
      customer: { name: checkout.user.name, email: checkout.user.email },
      deliveryAddressId: checkout.address._id,
      deliveryAddress: {
        address_line1: checkout.address.address_line1,
        city: checkout.address.city,
        state: checkout.address.state,
        pincode: checkout.address.pincode,
        country: checkout.address.country,
        mobile: String(checkout.address.mobile),
      },
      paymentMethod: "RAZORPAY",
      razorpayOrderId: gatewayOrder.id,
      currency,
      subTotalAmt: checkout.subTotalAmt,
      shippingAmt: checkout.shippingAmt,
      totalAmt: checkout.subTotalAmt + checkout.shippingAmt,
    });

    return response.status(201).json({
      data: {
        keyId,
        orderId: order._id,
        razorpayOrderId: gatewayOrder.id,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        customer: order.customer,
        contact: order.deliveryAddress.mobile,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to initialize payment",
      error: true,
      success: false,
    });
  }
};

export const verifyRazorpayPaymentController = async (request, response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return response.status(400).json({
        message: "Incomplete Razorpay payment response",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: request.userId,
      paymentMethod: "RAZORPAY",
    });
    if (!order) {
      return response.status(404).json({ message: "Payment order not found", error: true, success: false });
    }
    if (order.paymentStatus === "paid") {
      return response.json({ message: "Payment already verified", data: order, error: false, success: true });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");
    const supplied = Buffer.from(String(razorpay_signature), "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");
    const signatureValid =
      supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
    if (!signatureValid) {
      order.paymentStatus = "failed";
      await order.save();
      return response.status(400).json({ message: "Invalid payment signature", error: true, success: false });
    }

    await reserveStock(order.items);
    order.paymentId = razorpay_payment_id;
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    await order.save();
    await Promise.all([
      CartProductModel.deleteMany({ userId: request.userId }),
      UserModel.updateOne(
        { _id: request.userId },
        { $set: { shopping_cart: [] }, $addToSet: { orderHistory: order._id } },
      ),
    ]);

    return response.json({
      message: "Payment verified and order placed successfully",
      data: order,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to verify payment",
      error: true,
      success: false,
    });
  }
};

export const createOrderController = async (request, response) => {
  try {
    const userId = request.userId;
    const { addressId, paymentMethod = "COD" } = request.body || {};

    if (!mongoose.isValidObjectId(addressId)) {
      return response.status(400).json({
        message: "A valid delivery address is required",
        error: true,
        success: false,
      });
    }

    if (paymentMethod !== "COD") {
      return response.status(400).json({
        message: "Only cash on delivery is currently supported",
        error: true,
        success: false,
      });
    }

    const [user, address, cartItems] = await Promise.all([
      UserModel.findById(userId).select("name email"),
      AddressModel.findOne({ _id: addressId, userId }),
      CartProductModel.find({ userId }).populate("productId"),
    ]);

    if (!user) {
      return response.status(404).json({ message: "User not found", error: true, success: false });
    }
    if (!address) {
      return response.status(404).json({
        message: "Delivery address not found",
        error: true,
        success: false,
      });
    }
    if (!cartItems.length) {
      return response.status(400).json({ message: "Your cart is empty", error: true, success: false });
    }

    const invalidItem = cartItems.find(
      (item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1,
    );
    if (invalidItem) {
      return response.status(400).json({
        message: "Your cart contains an unavailable or invalid product",
        error: true,
        success: false,
      });
    }

    const unavailableItem = cartItems.find((item) => {
      const product = item.productId;
      if (product.inventoryType === "none") {
        return Number(product.countInStock) < item.quantity;
      }
      const variant = product.inventoryVariants?.find(
        (entry) => String(entry.value) === String(item.size),
      );
      return !variant || Number(variant.stock) < item.quantity;
    });
    if (unavailableItem) {
      return response.status(409).json({
        message: `${unavailableItem.productId.name} does not have enough stock`,
        error: true,
        success: false,
      });
    }

    const items = cartItems.map((item) => {
      const price = Number(item.productId.price);
      return {
        sellerId: item.productId.sellerId || null,
        productId: item.productId._id,
        name: item.productId.name,
        image: item.productId.images?.[0] || "",
        price,
        quantity: item.quantity,
        size: item.size || "",
        subTotal: price * item.quantity,
      };
    });
    const subTotalAmt = items.reduce((sum, item) => sum + item.subTotal, 0);
    const shippingAmt = subTotalAmt > 0 ? SHIPPING_FEE : 0;

    const order = await OrderModel.create({
      userId,
      orderId: makeOrderId(),
      items,
      customer: { name: user.name, email: user.email },
      deliveryAddressId: address._id,
      deliveryAddress: {
        address_line1: address.address_line1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
        mobile: String(address.mobile),
      },
      paymentMethod,
      subTotalAmt,
      shippingAmt,
      totalAmt: subTotalAmt + shippingAmt,
    });

    const reservedItems = [];
    for (const cartItem of cartItems) {
      const product = cartItem.productId;
      const isSimpleInventory = product.inventoryType === "none";
      const filter = isSimpleInventory
        ? { _id: product._id, countInStock: { $gte: cartItem.quantity } }
        : {
            _id: product._id,
            inventoryVariants: {
              $elemMatch: { value: cartItem.size, stock: { $gte: cartItem.quantity } },
            },
          };
      const update = isSimpleInventory
        ? { $inc: { countInStock: -cartItem.quantity } }
        : {
            $inc: {
              "inventoryVariants.$[variant].stock": -cartItem.quantity,
              countInStock: -cartItem.quantity,
            },
          };
      const options = isSimpleInventory
        ? {}
        : { arrayFilters: [{ "variant.value": cartItem.size }] };
      const result = await ProductModel.updateOne(filter, update, options);

      if (result.modifiedCount !== 1) {
        for (const reserved of reservedItems) {
          const rollback = reserved.simple
            ? { $inc: { countInStock: reserved.quantity } }
            : {
                $inc: {
                  "inventoryVariants.$[variant].stock": reserved.quantity,
                  countInStock: reserved.quantity,
                },
              };
          const rollbackOptions = reserved.simple
            ? {}
            : { arrayFilters: [{ "variant.value": reserved.size }] };
          await ProductModel.updateOne({ _id: reserved.productId }, rollback, rollbackOptions);
        }
        await OrderModel.deleteOne({ _id: order._id });
        return response.status(409).json({
          message: `${product.name} has just gone out of stock. Please review your cart.`,
          error: true,
          success: false,
        });
      }

      reservedItems.push({
        productId: product._id,
        quantity: cartItem.quantity,
        size: cartItem.size,
        simple: isSimpleInventory,
      });
    }

    await Promise.all([
      CartProductModel.deleteMany({ userId }),
      UserModel.updateOne(
        { _id: userId },
        { $set: { shopping_cart: [] }, $push: { orderHistory: order._id } },
      ),
    ]);

    return response.status(201).json({
      message: "Order placed successfully",
      error: false,
      success: true,
      data: order,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Unable to place order",
      error: true,
      success: false,
    });
  }
};

export const getMyOrdersController = async (request, response) => {
  try {
    const orders = await OrderModel.find({ userId: request.userId }).sort({ createdAt: -1 });
    return response.json({ data: orders, error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const getMyOrderController = async (request, response) => {
  try {
    const order = await OrderModel.findOne({
      _id: request.params.orderId,
      userId: request.userId,
    });
    if (!order) {
      return response.status(404).json({ message: "Order not found", error: true, success: false });
    }
    return response.json({ data: order, error: false, success: true });
  } catch (error) {
    const status = error instanceof mongoose.Error.CastError ? 400 : 500;
    return response.status(status).json({ message: "Invalid order id", error: true, success: false });
  }
};

const ensureAdmin = async (userId) => {
  const user = await UserModel.findById(userId).select("role");
  if (!user || user.role !== "ADMIN") {
    throw Object.assign(new Error("Administrator access is required"), { status: 403 });
  }
};

export const getAdminOrdersController = async (request, response) => {
  try {
    await ensureAdmin(request.userId);
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    return response.json({ data: orders, error: false, success: true });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to load orders",
      error: true,
      success: false,
    });
  }
};

export const getAdminDashboardStatsController = async (request, response) => {
  try {
    await ensureAdmin(request.userId);

    const currentYear = new Date().getFullYear();
    const year = Number(request.query.year || currentYear);
    if (!Number.isInteger(year) || year < 2000 || year > currentYear + 1) {
      return response.status(400).json({
        message: "A valid year is required",
        error: true,
        success: false,
      });
    }

    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));
    const dateRange = { $gte: startDate, $lt: endDate };

    const [ordersByMonth, usersByMonth, totalProducts, orderSummary] = await Promise.all([
      OrderModel.aggregate([
        { $match: { createdAt: dateRange, orderStatus: { $ne: "cancelled" } } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalOrders: { $sum: 1 },
            totalSales: { $sum: "$totalAmt" },
          },
        },
      ]),
      UserModel.aggregate([
        { $match: { createdAt: dateRange, role: "USER" } },
        { $group: { _id: { $month: "$createdAt" }, totalUsers: { $sum: 1 } } },
      ]),
      ProductModel.countDocuments(),
      OrderModel.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSales: { $sum: { $sum: "$items.quantity" } },
            revenue: { $sum: "$totalAmt" },
          },
        },
      ]),
    ]);

    const orderMap = new Map(ordersByMonth.map((item) => [item._id, item]));
    const userMap = new Map(usersByMonth.map((item) => [item._id, item]));
    const months = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return {
        month,
        totalOrders: orderMap.get(month)?.totalOrders || 0,
        totalSales: Number((orderMap.get(month)?.totalSales || 0).toFixed(2)),
        totalUsers: userMap.get(month)?.totalUsers || 0,
      };
    });

    return response.json({
      year,
      data: months,
      summary: {
        newOrders: orderSummary[0]?.totalOrders || 0,
        totalSales: orderSummary[0]?.totalSales || 0,
        revenue: Number((orderSummary[0]?.revenue || 0).toFixed(2)),
        totalProducts,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to load dashboard statistics",
      error: true,
      success: false,
    });
  }
};

export const updateAdminOrderStatusController = async (request, response) => {
  try {
    await ensureAdmin(request.userId);
    const { orderStatus } = request.body || {};
    const allowedStatuses = ["pending", "confirmed", "delivered"];
    if (!allowedStatuses.includes(orderStatus)) {
      return response.status(400).json({
        message: "Order status must be pending, confirmed, or delivered",
        error: true,
        success: false,
      });
    }
    if (!mongoose.isValidObjectId(request.params.orderId)) {
      return response.status(400).json({
        message: "Invalid order id",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findById(request.params.orderId);
    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    const currentRank = {
      pending: 0,
      confirmed: 1,
      processing: 1,
      shipped: 1,
      delivered: 2,
    }[order.orderStatus];
    const nextRank = { pending: 0, confirmed: 1, delivered: 2 }[orderStatus];
    if (order.orderStatus === "cancelled" || nextRank < currentRank) {
      return response.status(409).json({
        message: "An order cannot be moved back to an earlier status",
        error: true,
        success: false,
      });
    }

    order.orderStatus = orderStatus;
    await order.save();
    return response.json({
      message: `Order status updated to ${orderStatus}`,
      data: order,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      message: error.message || "Unable to update order status",
      error: true,
      success: false,
    });
  }
};
