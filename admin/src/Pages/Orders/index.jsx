import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { IoRefreshOutline, IoSearchOutline } from "react-icons/io5";
import { MyContext } from "../../App";
import { editData, fetchDataFromApi } from "../../utils/api";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "delivered", label: "Delivered" },
];

const statusRank = { pending: 0, confirmed: 1, processing: 1, shipped: 1, delivered: 2 };

const money = (value, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(Number(value) || 0);
  } catch {
    return `$${Number(value || 0).toFixed(2)}`;
  }
};

const dateTime = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const PaymentBadge = ({ status }) => {
  const style =
    status === "paid"
      ? "bg-emerald-100 text-emerald-700"
      : status === "failed"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {status || "pending"}
    </span>
  );
};

const Orders = () => {
  const context = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [page, setPage] = useState(1);
  const ordersPerPage = 10;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const result = await fetchDataFromApi("/api/order/admin/orders");
    if (result?.success) {
      setOrders(Array.isArray(result.data) ? result.data : []);
      setPage(1);
      setExpandedId("");
    } else {
      context?.alertBox?.("error", result?.message || "Orders could not be loaded.");
    }
    setLoading(false);
  }, [context]);

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return orders;
    return orders.filter((order) =>
      [
        order.orderId,
        order.customer?.name,
        order.customer?.email,
        order.deliveryAddress?.mobile,
        order.paymentMethod,
        order.orderStatus,
      ].some((value) => String(value || "").toLowerCase().includes(keyword)),
    );
  }, [orders, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ordersPerPage),
  );
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage,
  );

  const updateStatus = async (order, orderStatus) => {
    if (orderStatus === order.orderStatus) return;
    setUpdatingId(order._id);
    const result = await editData(`/api/order/admin/orders/${order._id}/status`, {
      orderStatus,
    });
    if (result?.success) {
      setOrders((current) =>
        current.map((item) => (item._id === order._id ? result.data : item)),
      );
      context?.alertBox?.("success", `Order updated to ${orderStatus}.`);
    } else {
      context?.alertBox?.("error", result?.message || "Unable to update order status.");
    }
    setUpdatingId("");
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length} order{orders.length === 1 ? "" : "s"} in total
          </p>
        </div>
        <div className="flex w-full gap-2 lg:w-auto">
          <div className="relative min-w-0 flex-1 lg:w-[340px]">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setExpandedId("");
              }}
              placeholder="Search order, customer, email..."
              className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
          <Button
            onClick={loadOrders}
            disabled={loading}
            className="!min-w-10 !border !border-gray-200 !text-gray-600"
            aria-label="Refresh orders"
          >
            <IoRefreshOutline className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <CircularProgress size={34} />
        </div>
      ) : !filteredOrders.length ? (
        <div className="px-5 py-16 text-center text-gray-500">
          {search ? "No orders match your search." : "No orders have been placed yet."}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="w-14 px-4 py-4" />
                <th className="px-4 py-4">Order</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-4 py-4">Items</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Date</th>
                <th className="min-w-[175px] px-4 py-4">Order status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order) => {
                const expanded = expandedId === order._id;
                const currentRank = statusRank[order.orderStatus] ?? 0;
                const itemCount = (order.items || []).reduce(
                  (total, item) => total + Number(item.quantity || 0),
                  0,
                );
                return (
                  <FragmentRow
                    key={order._id}
                    order={order}
                    expanded={expanded}
                    currentRank={currentRank}
                    itemCount={itemCount}
                    updating={updatingId === order._id}
                    onToggle={() => setExpandedId(expanded ? "" : order._id)}
                    onStatusChange={(status) => updateStatus(order, status)}
                  />
                );
              })}
            </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * ordersPerPage + 1}–
              {Math.min(page * ordersPerPage, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </p>
            <Pagination
              page={page}
              count={totalPages}
              color="primary"
              shape="rounded"
              onChange={(_, value) => {
                setPage(value);
                setExpandedId("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

const FragmentRow = ({
  order,
  expanded,
  currentRank,
  itemCount,
  updating,
  onToggle,
  onStatusChange,
}) => (
  <>
    <tr className="bg-white align-middle transition hover:bg-gray-50/70">
      <td className="px-4 py-4">
        <Button
          onClick={onToggle}
          className="!h-8 !w-8 !min-w-8 !rounded-full !bg-gray-100 !text-gray-600"
          aria-label={expanded ? "Hide products" : "Show products"}
        >
          {expanded ? <FaAngleUp /> : <FaAngleDown />}
        </Button>
      </td>
      <td className="px-4 py-4">
        <p className="max-w-[190px] truncate font-bold text-blue-600">{order.orderId}</p>
        <p className="mt-1 text-xs text-gray-400">{order._id}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-semibold text-gray-800">{order.customer?.name || "—"}</p>
        <p className="mt-1 text-xs text-gray-500">{order.customer?.email || "—"}</p>
      </td>
      <td className="px-4 py-4">
        <p className="mb-2 font-semibold text-gray-700">{order.paymentMethod}</p>
        <PaymentBadge status={order.paymentStatus} />
      </td>
      <td className="px-4 py-4 font-medium text-gray-700">{itemCount}</td>
      <td className="px-4 py-4 font-bold text-gray-900">
        {money(order.totalAmt, order.currency)}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-gray-500">
        {dateTime(order.createdAt)}
      </td>
      <td className="px-4 py-4">
        <Select
          size="small"
          fullWidth
          value={
            ["processing", "shipped"].includes(order.orderStatus)
              ? "confirmed"
              : order.orderStatus
          }
          disabled={updating || order.orderStatus === "cancelled"}
          onChange={(event) => onStatusChange(event.target.value)}
          className="!bg-white !text-sm !font-semibold"
        >
          {statusOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={statusRank[option.value] < currentRank}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </td>
    </tr>
    {expanded && (
      <tr className="bg-slate-50">
        <td colSpan={8} className="px-8 py-5">
          <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
            <div className="space-y-2">
              {(order.items || []).map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}-${index}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-800">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Qty: {item.quantity}
                      {item.size ? ` · Size: ${item.size}` : ""}
                      {` · ${money(item.price, order.currency)} each`}
                    </p>
                  </div>
                  <p className="font-bold text-gray-800">
                    {money(item.subTotal, order.currency)}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-4 text-sm">
              <h3 className="font-bold text-gray-900">Delivery details</h3>
              <p className="mt-3 font-semibold">{order.customer?.name}</p>
              <p className="mt-1 text-gray-500">{order.deliveryAddress?.mobile}</p>
              <p className="mt-2 leading-5 text-gray-500">
                {[
                  order.deliveryAddress?.address_line1,
                  order.deliveryAddress?.city,
                  order.deliveryAddress?.state,
                  order.deliveryAddress?.pincode,
                  order.deliveryAddress?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {order.paymentId && (
                <p className="mt-4 break-all border-t pt-3 text-xs text-gray-400">
                  Payment ID: {order.paymentId}
                </p>
              )}
            </div>
          </div>
        </td>
      </tr>
    )}
  </>
);

export default Orders;
