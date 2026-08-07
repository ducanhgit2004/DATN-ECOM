import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, Checkbox, MenuItem, Pagination, Select } from "@mui/material";
import { FaPlus, FaRegEye } from "react-icons/fa";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import DashboardBoxes from "../../components/DashboardBoxes";
import ConfirmDialog from "../../components/ConfirmDialog";
import { MyContext } from "../../App";
import { deleteData, fetchDataFromApi } from "../../utils/api";

const money = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value || 0));

const Dashboard = () => {
  const context = useContext(MyContext);
  const { alertBox, productRefreshKey } = context;
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [stats, setStats] = useState({});
  const [chart, setChart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [performanceSearch, setPerformanceSearch] = useState("");
  const [performanceStatus, setPerformanceStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const perPage = 5;

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchDataFromApi(`/api/order/admin/dashboard-stats?year=${year}`),
      fetchDataFromApi("/api/product/getAllProducts?perPage=10000&page=1"),
      fetchDataFromApi("/api/order/admin/orders"),
    ]).then(([statsResult, productResult, orderResult]) => {
      if (!active) return;
      if (statsResult?.success) {
        setStats(statsResult.summary || {});
        setTopProducts(statsResult.topProducts || []);
        setProductSales(statsResult.productSales || []);
        const names = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        setChart((statsResult.data || []).map((item, index) => ({
          name: names[index], users: item.totalUsers || 0, sales: item.totalSales || 0,
        })));
      } else alertBox("error", statsResult?.message || "Dashboard statistics could not be loaded.");
      if (productResult?.success) setProducts(productResult.products || []);
      if (orderResult?.success) setOrders(orderResult.data || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [year, productRefreshKey, alertBox]);

  const categories = useMemo(
    () => [...new Set(products.map((item) => item.catName || item.category?.name).filter(Boolean))],
    [products],
  );
  const filteredProducts = useMemo(
    () => products.filter((item) => !category || (item.catName || item.category?.name) === category),
    [products, category],
  );
  const pageProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);
  const productPerformance = useMemo(() => {
    const salesMap = new Map(productSales.map((item) => [String(item._id), item]));
    return products
      .map((product) => {
        const sales = salesMap.get(String(product._id));
        return {
          ...product,
          unitsSold: Number(sales?.unitsSold || 0),
          salesRevenue: Number(sales?.revenue || 0),
          salesOrders: Number(sales?.orderCount || 0),
          performance: Number(sales?.unitsSold || 0) > 0 ? "selling" : "no-sales",
        };
      })
      .filter((product) => {
        const query = performanceSearch.trim().toLowerCase();
        const matchesSearch = !query || `${product.name} ${product.brand || ""} ${product.catName || ""}`
          .toLowerCase()
          .includes(query);
        return matchesSearch && (performanceStatus === "all" || product.performance === performanceStatus);
      })
      .sort((a, b) => b.unitsSold - a.unitsSold || b.salesRevenue - a.salesRevenue);
  }, [performanceSearch, performanceStatus, productSales, products]);
  const visibleIds = pageProducts.map((item) => item._id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const openProduct = (model, product) =>
    context.setIsOpenFullScreenPanel({ open: true, model, product });

  const removeProduct = async () => {
    const result = await deleteData(`/api/product/${deleteTarget._id}`);
    if (result?.success) {
      setProducts((items) => items.filter((item) => item._id !== deleteTarget._id));
      setSelected((ids) => ids.filter((id) => id !== deleteTarget._id));
      context.alertBox("success", "Product deleted successfully.");
    } else context.alertBox("error", result?.message || "Product could not be deleted.");
    setDeleteTarget(null);
  };

  const exportProducts = () => {
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [["Product", "Category", "Sub category", "Price", "Stock"], ...filteredProducts.map(
      (item) => [item.name, item.catName, item.subCatName || item.subCat, item.price, item.countInStock],
    )];
    const blob = new Blob([rows.map((row) => row.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <>
    <div className="mb-5 flex w-full items-center justify-between gap-8 rounded-md border border-black/10 bg-[#f1faff] p-5 py-2">
      <div>
        <h1 className="mb-3 text-[30px] font-bold leading-10">Good Morning,<br />{context.userData?.name || "Admin"}</h1>
        <p>Here&apos;s what&apos;s happening in your store today.</p><br />
        <Button className="btn-blue !capitalize" onClick={() => openProduct("Add Product")}><FaPlus /> Add Product</Button>
      </div>
      <img src="/manager.png" className="w-[400px]" alt="Store manager" />
    </div>

    <DashboardBoxes stats={stats} loading={loading} />

    <div className="card my-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
        <div>
          <h2 className="text-[18px] font-semibold">Best-Selling Products</h2>
          <p className="mt-1 text-xs text-gray-500">Ranked by units sold over the last 30 days</p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          Top {topProducts.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr><th className="p-4">Rank</th><th>Product</th><th>Shop</th><th>Orders</th><th>Units Sold</th><th>Revenue</th><th>Stock</th><th>Sales Performance</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="8" className="p-8 text-center">Loading sales statistics...</td></tr> :
              topProducts.length === 0 ? <tr><td colSpan="8" className="p-8 text-center text-gray-500">No sales data is available for the last 30 days.</td></tr> :
              topProducts.map((product, index) => {
                const maximum = Number(topProducts[0]?.unitsSold || 1);
                const percentage = Math.max(4, Math.round((Number(product.unitsSold) / maximum) * 100));
                return <tr key={product._id} className="border-t border-gray-100">
                  <td className="p-4"><span className={`grid h-8 w-8 place-items-center rounded-full font-bold ${index < 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{index + 1}</span></td>
                  <td><div className="flex w-[280px] items-center gap-3 py-2"><img src={product.image || "/Sample_User_Icon.png"} className="h-12 w-12 rounded-lg object-cover" alt="" /><div><b className="line-clamp-2 text-xs text-gray-800">{product.name}</b><small className="mt-1 block text-gray-400">{product.category || "Uncategorized"}</small></div></div></td>
                  <td>{product.sellerName || "Admin"}</td>
                  <td>{product.orderCount}</td>
                  <td><b className="text-blue-600">{product.unitsSold}</b></td>
                  <td><b className="text-green-600">{money(product.revenue)}</b></td>
                  <td><span className={Number(product.stock) <= 5 ? "font-semibold text-red-500" : ""}>{product.stock}</span></td>
                  <td><div className="h-2 w-28 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${percentage}%` }} /></div></td>
                </tr>;
              })}
          </tbody>
        </table>
      </div>
    </div>

    <div className="card my-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 p-5">
        <div>
          <h2 className="text-[18px] font-semibold">Product Sales Performance</h2>
          <p className="mt-1 text-xs text-gray-500">Detailed performance for every product over the last 30 days, including products with no sales.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={performanceSearch}
            onChange={(event) => setPerformanceSearch(event.target.value)}
            placeholder="Search product..."
            className="h-10 w-[230px] rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
          />
          <Select size="small" className="w-[150px]" value={performanceStatus} onChange={(event) => setPerformanceStatus(event.target.value)}>
            <MenuItem value="all">All Products</MenuItem>
            <MenuItem value="selling">Selling</MenuItem>
            <MenuItem value="no-sales">No Sales</MenuItem>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 border-b bg-gray-50 p-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4"><small className="text-gray-500">Products Analyzed</small><b className="mt-1 block text-xl">{products.length}</b></div>
        <div className="rounded-lg border bg-white p-4"><small className="text-gray-500">Products With Sales</small><b className="mt-1 block text-xl text-green-600">{products.filter((item) => productSales.some((sale) => String(sale._id) === String(item._id) && Number(sale.unitsSold) > 0)).length}</b></div>
        <div className="rounded-lg border bg-white p-4"><small className="text-gray-500">Products With No Sales</small><b className="mt-1 block text-xl text-red-500">{products.filter((item) => !productSales.some((sale) => String(sale._id) === String(item._id) && Number(sale.unitsSold) > 0)).length}</b></div>
      </div>
      <div className="max-h-[620px] overflow-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-xs uppercase text-gray-500">
            <tr><th className="p-4">Product</th><th>Category</th><th>Price</th><th>Orders</th><th>Units Sold</th><th>Revenue</th><th>Stock</th><th>Performance</th></tr>
          </thead>
          <tbody>
            {productPerformance.map((product) => (
              <tr key={product._id} className="border-t border-gray-100">
                <td className="p-4"><div className="flex w-[300px] items-center gap-3"><img src={product.images?.[0] || "/Sample_User_Icon.png"} className="h-12 w-12 rounded-lg object-cover" alt="" /><div><b className="line-clamp-2 text-xs">{product.name}</b><small className="mt-1 block text-gray-400">{product.brand || "No brand"}</small></div></div></td>
                <td>{product.catName || product.category?.name || "Uncategorized"}</td>
                <td>{money(product.price)}</td>
                <td>{product.salesOrders}</td>
                <td><b className={product.unitsSold ? "text-blue-600" : "text-gray-400"}>{product.unitsSold}</b></td>
                <td><b className={product.salesRevenue ? "text-green-600" : "text-gray-400"}>{money(product.salesRevenue)}</b></td>
                <td><span className={Number(product.countInStock) <= 5 ? "font-semibold text-red-500" : ""}>{product.countInStock || 0}</span></td>
                <td><span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.performance === "selling" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{product.performance === "selling" ? "Selling" : "No Sales"}</span></td>
              </tr>
            ))}
            {!loading && productPerformance.length === 0 && <tr><td colSpan="8" className="p-10 text-center text-gray-500">No products match the selected filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    <div className="card my-4 rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-wrap items-end justify-between gap-4 p-5">
        <div><h2 className="text-[18px] font-semibold">Products <span className="text-xs font-normal">({filteredProducts.length})</span></h2>
          <label className="mt-4 block text-[13px] font-semibold">Category By</label>
          <Select size="small" className="mt-2 w-[190px]" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <MenuItem value="">All categories</MenuItem>
            {categories.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </Select>
        </div>
        <div className="flex gap-3">
          <Button className="btn-blue !bg-green-500" onClick={exportProducts}>Export</Button>
          <Button className="btn-blue !text-white" onClick={() => openProduct("Add Product")}>Add Product</Button>
        </div>
      </div>
      <div className="overflow-x-auto border-t border-gray-200">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-black"><tr>
            <th className="p-4"><Checkbox size="small" checked={allSelected} onChange={() => setSelected((ids) => allSelected ? ids.filter((id) => !visibleIds.includes(id)) : [...new Set([...ids, ...visibleIds])])} /></th>
            <th>Product</th><th>Category</th><th>Sub Category</th><th>Price</th><th>Stock</th><th>Action</th>
          </tr></thead>
          <tbody>{loading ? <tr><td colSpan="7" className="p-8 text-center">Loading products...</td></tr> :
            pageProducts.length === 0 ? <tr><td colSpan="7" className="p-8 text-center">No products found.</td></tr> :
            pageProducts.map((product) => <tr key={product._id} className="border-t border-gray-200">
              <td className="p-4"><Checkbox size="small" checked={selected.includes(product._id)} onChange={() => setSelected((ids) => ids.includes(product._id) ? ids.filter((id) => id !== product._id) : [...ids, product._id])} /></td>
              <td className="py-2"><div className="flex w-[390px] items-center gap-4"><img src={product.images?.[0] || "/Sample_User_Icon.png"} className="h-16 w-16 rounded-md object-cover" alt="" /><div><b className="line-clamp-2 text-xs text-gray-800">{product.name}</b><span className="text-xs">{product.brand}</span></div></div></td>
              <td>{product.catName || product.category?.name || "—"}</td><td>{product.subCatName || product.subCat || "—"}</td>
              <td><span className="block text-gray-400 line-through">{product.oldPrice > product.price ? money(product.oldPrice) : ""}</span><b className="text-blue-600">{money(product.price)}</b></td>
              <td><b>{product.countInStock || 0}</b></td>
              <td><div className="flex gap-1"><Button onClick={() => openProduct("Edit Product", product)} className="!min-w-9"><AiOutlineEdit size={19} /></Button><Button onClick={() => openProduct("Product Details", product)} className="!min-w-9"><FaRegEye size={18} /></Button><Button onClick={() => setDeleteTarget(product)} className="!min-w-9 !text-red-500"><GoTrash size={18} /></Button></div></td>
            </tr>)}</tbody>
        </table>
      </div>
      <div className="flex justify-end p-4"><Pagination page={page} count={Math.max(1, Math.ceil(filteredProducts.length / perPage))} onChange={(_, value) => setPage(value)} color="primary" /></div>
    </div>

    <div className="card my-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <h2 className="p-5 text-[18px] font-semibold">Recent Orders</h2>
      <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase"><tr><th className="p-4"></th><th>Order ID</th><th>Payment</th><th>Customer</th><th>Phone</th><th>Address</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>{orders.slice(0, 5).map((order) => <Fragment key={order._id}><tr className="border-t">
          <td className="p-4"><Button className="!min-w-8" onClick={() => setExpandedOrder(expandedOrder === order._id ? "" : order._id)}>{expandedOrder === order._id ? "−" : "+"}</Button></td>
          <td className="font-semibold text-blue-600">{order.orderId}</td><td>{order.paymentMethod}</td><td>{order.customer?.name}</td><td>{order.deliveryAddress?.mobile}</td>
          <td>{[order.deliveryAddress?.address_line1, order.deliveryAddress?.city].filter(Boolean).join(", ")}</td><td className="capitalize">{order.orderStatus}</td><td className="font-semibold">{money(order.totalAmt, order.currency)}</td>
        </tr>{expandedOrder === order._id && <tr><td colSpan="8" className="bg-gray-50 p-4"><div className="flex flex-wrap gap-4">{order.items?.map((item) => <div key={item.productId} className="flex items-center gap-3 rounded border bg-white p-2"><img src={item.image || "/Sample_User_Icon.png"} className="h-12 w-12 rounded object-cover" alt="" /><span>{item.name}<br /><small>Qty: {item.quantity} · {money(item.subTotal, order.currency)}</small></span></div>)}</div></td></tr>}</Fragment>)}
        {!loading && orders.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-500">No orders yet.</td></tr>}</tbody>
      </table></div>
    </div>

    <div className="card my-4 rounded-lg border border-gray-200 bg-white p-5 shadow-md">
      <div className="flex items-center justify-between"><div><h2 className="text-[18px] font-semibold">Users & Sales Overview</h2><p className="text-xs text-gray-500">Monthly performance</p></div>
        <Select size="small" value={year} onChange={(e) => { setLoading(true); setYear(Number(e.target.value)); }}>{Array.from({ length: 5 }, (_, i) => currentYear - i).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></div>
      <div className="mt-5 h-[420px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis yAxisId="users" allowDecimals={false} /><YAxis yAxisId="sales" orientation="right" tickFormatter={(v) => `$${v}`} /><Tooltip formatter={(value, name) => [name === "Sales" ? money(value) : value, name]} /><Bar yAxisId="users" dataKey="users" name="New Users" fill="#16a34a" radius={[5,5,0,0]} /><Bar yAxisId="sales" dataKey="sales" name="Sales" fill="#7829fa" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div>
    </div>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete product?" message={`Delete "${deleteTarget?.name || ""}" permanently?`} confirmText="Delete" loading={false} onCancel={() => setDeleteTarget(null)} onConfirm={removeProduct} />
  </>;
};

export default Dashboard;
