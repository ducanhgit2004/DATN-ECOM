import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {
  IoBagCheckOutline,
  IoCalendarOutline,
  IoCardOutline,
  IoChevronDown,
  IoChevronUp,
  IoLocationOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import AccountSidebar from "../../components/AccountSidebar";
import { fetchDataFromApi } from "../../utils/api";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  processing: "bg-violet-50 text-violet-700 ring-violet-200",
  shipped: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  refunded: "bg-slate-100 text-slate-700 ring-slate-200",
};

const statusLabel = (status) =>
  String(status || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const StatusPill = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
      statusStyles[status] || statusStyles.pending
    }`}
  >
    {statusLabel(status)}
  </span>
);

const formatMoney = (value, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(Number(value) || 0);
  } catch {
    return `$${Number(value || 0).toFixed(2)}`;
  }
};

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "In progress" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetchDataFromApi("/api/order/my-orders");
    if (response?.success) {
      setOrders(Array.isArray(response.data) ? response.data : []);
    } else {
      setError(response?.message || "Unable to load your orders.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const visibleOrders = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "active") {
      return orders.filter((order) =>
        ["pending", "confirmed", "processing", "shipped"].includes(order.orderStatus),
      );
    }
    return orders.filter((order) => order.orderStatus === filter);
  }, [filter, orders]);

  return (
    <section className="w-full bg-[#f7f4f4] py-8 md:py-10">
      <div className="container flex flex-col gap-5 px-4 lg:flex-row">
        <aside className="w-full lg:w-[22%]">
          <AccountSidebar />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5252]">
                  Purchase history
                </p>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track and review all your purchases in one place.
                </p>
              </div>
              <div className="flex h-12 min-w-12 items-center justify-center rounded-xl bg-red-50 px-4 text-[#ff5252]">
                <IoBagCheckOutline className="mr-2 text-2xl" />
                <span className="text-lg font-bold">{orders.length}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto border-t pt-4">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === item.value
                      ? "bg-[#ff5252] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-white shadow-sm">
              <div className="text-center">
                <CircularProgress size={34} className="!text-[#ff5252]" />
                <p className="mt-3 text-sm text-gray-500">Loading your orders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-white px-6 py-14 text-center shadow-sm">
              <p className="font-semibold text-gray-800">{error}</p>
              <Button
                onClick={loadOrders}
                startIcon={<IoRefreshOutline />}
                className="!mt-4 !bg-[#ff5252] !px-5 !text-white"
              >
                Try again
              </Button>
            </div>
          ) : !visibleOrders.length ? (
            <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <IoBagCheckOutline className="text-3xl text-[#ff5252]" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-gray-900">No orders found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                {filter === "all"
                  ? "You have not placed an order yet. Products you purchase will appear here."
                  : "There are no orders with this status."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleOrders.map((order) => {
                const expanded = expandedOrderId === order._id;
                const address = order.deliveryAddress || {};
                const itemCount = (order.items || []).reduce(
                  (total, item) => total + Number(item.quantity || 0),
                  0,
                );

                return (
                  <article
                    key={order._id}
                    className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
                  >
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-bold text-gray-900">
                              Order #{order.orderId || order._id}
                            </h2>
                            <StatusPill status={order.orderStatus} />
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <IoCalendarOutline />
                              {formatDate(order.createdAt)}
                            </span>
                            <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
                          </div>
                        </div>
                        <div className="md:text-right">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Order total
                          </p>
                          <p className="mt-1 text-xl font-bold text-[#ff5252]">
                            {formatMoney(order.totalAmt, order.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 py-4 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="flex gap-3">
                          <IoCardOutline className="mt-0.5 shrink-0 text-xl text-gray-400" />
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">Payment</p>
                            <p className="mt-1 text-sm font-semibold text-gray-800">
                              {order.paymentMethod || "—"}
                            </p>
                            <div className="mt-1">
                              <StatusPill status={order.paymentStatus} />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 sm:col-span-1 xl:col-span-2">
                          <IoLocationOutline className="mt-0.5 shrink-0 text-xl text-gray-400" />
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">Deliver to</p>
                            <p className="mt-1 text-sm font-semibold text-gray-800">
                              {order.customer?.name || "—"} · {address.mobile || "—"}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-gray-500">
                              {[address.address_line1, address.city, address.state, address.pincode, address.country]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(expanded ? "" : order._id)}
                        className="flex w-full items-center justify-center gap-2 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-600 transition hover:text-[#ff5252]"
                        aria-expanded={expanded}
                      >
                        {expanded ? "Hide order details" : "View order details"}
                        {expanded ? <IoChevronUp /> : <IoChevronDown />}
                      </button>
                    </div>

                    {expanded && (
                      <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-5 md:px-6">
                        <div className="space-y-3">
                          {(order.items || []).map((item, index) => (
                            <div
                              key={`${item.productId}-${item.size}-${index}`}
                              className="flex items-center gap-4 rounded-lg bg-white p-3 ring-1 ring-black/5"
                            >
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xl text-gray-300">
                                    <IoBagCheckOutline />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-gray-900">{item.name}</p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Qty: {item.quantity}
                                  {item.size ? ` · Size: ${item.size}` : ""}
                                  {" · "}
                                  {formatMoney(item.price, order.currency)} each
                                </p>
                              </div>
                              <p className="shrink-0 font-bold text-gray-900">
                                {formatMoney(item.subTotal, order.currency)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="ml-auto mt-5 max-w-xs space-y-2 text-sm">
                          <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>{formatMoney(order.subTotalAmt, order.currency)}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Shipping</span>
                            <span>
                              {Number(order.shippingAmt)
                                ? formatMoney(order.shippingAmt, order.currency)
                                : "Free"}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2 font-bold text-gray-900">
                            <span>Total</span>
                            <span>{formatMoney(order.totalAmt, order.currency)}</span>
                          </div>
                          {order.paymentId && (
                            <p className="break-all pt-2 text-xs text-gray-400">
                              Payment ID: {order.paymentId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </section>
  );
};

export default Orders;
