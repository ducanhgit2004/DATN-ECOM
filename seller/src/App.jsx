import { useCallback, useEffect, useMemo, useState } from "react";
import { IoBag } from "react-icons/io5";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { request, uploadProductImages, uploadStoreImage } from "./api";
import Messages from "./Messages";
import "./review.css";
import "./order-details.css";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const calculateDiscount = (price, oldPrice) => {
  const current = Number(price);
  const original = Number(oldPrice);
  if (!Number.isFinite(current) || !Number.isFinite(original) || original <= 0)
    return 0;
  return Math.min(
    100,
    Math.max(0, Math.round(((original - current) / original) * 10000) / 100),
  );
};

const AuthCard = ({ mode }) => {
  const navigate = useNavigate();
  const registering = mode === "register";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    storeDescription: "",
  });
  const [feedback, setFeedback] = useState({ error: "", message: "" });
  const [busy, setBusy] = useState(false);
  const change = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFeedback({ error: "", message: "" });
    const result = await request(
      registering ? "/api/user/seller/register" : "/api/user/login",
      {
        method: "POST",
        body: registering ? form : { ...form, client: "seller" },
      },
    );
    if (!result?.success) {
      setFeedback({ error: result?.message || "Request failed", message: "" });
    } else if (registering) {
      setFeedback({ error: "", message: result.message });
      window.setTimeout(() => navigate("/login"), 1200);
    } else {
      localStorage.setItem("sellerAccessToken", result.data.accesstoken);
      localStorage.setItem("sellerRefreshToken", result.data.refreshToken);
      navigate("/dashboard");
    }
    setBusy(false);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="brand">
          NovaCart <span>Seller</span>
        </Link>
        <h1>{registering ? "Become a seller" : "Seller sign in"}</h1>
        <p className="muted">
          {registering
            ? "Submit your store for admin approval."
            : "Manage your NovaCart store."}
        </p>
        <form onSubmit={submit}>
          {registering && (
            <>
              <label>
                Owner name
                <input required value={form.name} onChange={change("name")} />
              </label>
              <label>
                Store name
                <input
                  required
                  value={form.storeName}
                  onChange={change("storeName")}
                />
              </label>
              <label>
                Store description
                <textarea
                  rows="3"
                  value={form.storeDescription}
                  onChange={change("storeDescription")}
                />
              </label>
            </>
          )}
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={change("email")}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              minLength="6"
              required
              value={form.password}
              onChange={change("password")}
            />
          </label>
          {feedback.error && <p className="notice error">{feedback.error}</p>}
          {feedback.message && (
            <p className="notice success">{feedback.message}</p>
          )}
          <button disabled={busy}>
            {busy
              ? "Please wait..."
              : registering
                ? "Submit application"
                : "Sign in"}
          </button>
        </form>
        <p className="switch">
          {registering ? "Already applied?" : "Want to sell on NovaCart?"}{" "}
          <Link to={registering ? "/login" : "/register"}>
            {registering ? "Sign in" : "Apply now"}
          </Link>
        </p>
      </section>
    </main>
  );
};

const Layout = ({ seller, children }) => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("sellerAccessToken");
    localStorage.removeItem("sellerRefreshToken");
    navigate("/login");
  };
  return (
    <div className="shell">
      <aside>
        <div className="brand white">
          NovaCart <span>Seller</span>
        </div>
        <nav>
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/reviews">Customer reviews</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/store">Store profile</NavLink>
        </nav>
        <button className="logout" onClick={logout}>
          Sign out
        </button>
      </aside>
      <main className="dashboard">
        <header>
          <div>
            <p className="muted">Seller workspace</p>
            <h1>{seller.storeName}</h1>
          </div>
          <div className="avatar">{seller.name?.[0]}</div>
        </header>
        {children}
      </main>
    </div>
  );
};

const DashboardHome = ({ seller }) => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    request("/api/seller/dashboard").then((result) => {
      if (active && result.success) setStats(result.data);
      else if (active) setError(result.message || "Unable to load dashboard");
    });
    return () => {
      active = false;
    };
  }, []);
  const trendMax = Math.max(
    1,
    ...(stats?.revenueTrend || []).map((item) => item.revenue),
  );
  return (
    <>
      <section className="welcome">
        <div>
          <p className="welcome-label">Store overview</p>
          <h2>Good to see you, {seller.name}</h2>
          <p>Here is what is happening with {seller.storeName} today.</p>
        </div>
        <Link to="/products" className="welcome-action">
          Add a product
        </Link>
      </section>
      {error && <p className="notice error">{error}</p>}
      <section className="stats">
        <article className="stat-card">
          <div className="stat-icon revenue-icon">$</div>
          <div>
            <span>Total revenue</span>
            <strong>{stats ? money(stats.revenue) : "—"}</strong>
            <small>
              {stats ? `${money(stats.todayRevenue)} today` : "Loading..."}
            </small>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-icon order-icon">↗</div>
          <div>
            <span>Total orders</span>
            <strong>{stats?.orders ?? "—"}</strong>
            <small>
              {stats ? `${stats.todayOrders} new today` : "Loading..."}
            </small>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-icon product-icon">
            <IoBag />
          </div>
          <div>
            <span>Products</span>
            <strong>{stats?.products ?? "—"}</strong>
            <small>
              {stats ? `${stats.stock} units in stock` : "Loading..."}
            </small>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-icon rating-icon">★</div>
          <div>
            <span>Customer rating</span>
            <strong>
              {stats ? Number(stats.averageRating).toFixed(1) : "—"}
            </strong>
            <small>
              {stats ? `${stats.reviewCount} reviews` : "Loading..."}
            </small>
          </div>
        </article>
      </section>
      <section className="attention-grid">
        <Link to="/orders" className="attention-card">
          <span>Orders requiring attention</span>
          <strong>{stats?.processingOrders ?? "—"}</strong>
          <small>Pending, confirmed or processing →</small>
        </Link>
        <Link to="/products" className="attention-card warning-card">
          <span>Low-stock products</span>
          <strong>{stats?.lowStock ?? "—"}</strong>
          <small>Five units or fewer remaining →</small>
        </Link>
      </section>
      <section className="dashboard-grid">
        <article className="dashboard-card chart-card">
          <div className="card-heading">
            <div>
              <h3>Revenue overview</h3>
              <p>Last 7 days</p>
            </div>
            <strong>
              {money(
                (stats?.revenueTrend || []).reduce(
                  (sum, item) => sum + item.revenue,
                  0,
                ),
              )}
            </strong>
          </div>
          <div className="bar-chart">
            {(stats?.revenueTrend || []).map((item) => (
              <div className="bar-column" key={item.date}>
                <span className="bar-value">
                  {item.revenue ? money(item.revenue) : ""}
                </span>
                <div className="bar-track">
                  <i
                    style={{
                      height: `${Math.max(item.revenue ? 8 : 2, (item.revenue / trendMax) * 100)}%`,
                    }}
                  />
                </div>
                <small>
                  {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                    "en-US",
                    { weekday: "short" },
                  )}
                </small>
              </div>
            ))}
          </div>
        </article>
        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <h3>Top products</h3>
              <p>Ranked by units sold</p>
            </div>
          </div>
          <div className="top-products">
            {stats?.topProducts?.length ? (
              stats.topProducts.map((product, index) => (
                <div className="top-product" key={product._id}>
                  <span className="rank">{index + 1}</span>
                  <img src={product.image} alt="" />
                  <div>
                    <strong>{product.name}</strong>
                    <small>{product.units} units sold</small>
                  </div>
                  <b>{money(product.revenue)}</b>
                </div>
              ))
            ) : (
              <div className="mini-empty">No sales data yet.</div>
            )}
          </div>
        </article>
      </section>
      <section className="dashboard-card recent-card">
        <div className="card-heading">
          <div>
            <h3>Recent orders</h3>
            <p>Your latest store activity</p>
          </div>
          <Link to="/orders">View all →</Link>
        </div>
        {stats?.recentOrders?.length ? (
          <div className="recent-table">
            <div className="recent-row recent-head">
              <span>Order</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Status</span>
              <span>Total</span>
            </div>
            {stats.recentOrders.map((order) => (
              <div className="recent-row" key={order._id}>
                <span>
                  <strong>{order.orderId}</strong>
                  <small>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </small>
                </span>
                <span>{order.customerName}</span>
                <span>{order.itemCount}</span>
                <span>
                  <i className={`status ${order.orderStatus}`}>
                    {order.orderStatus}
                  </i>
                </span>
                <span>
                  <strong>{money(order.total)}</strong>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mini-empty">No orders have been placed yet.</div>
        )}
      </section>
    </>
  );
};

const emptyProduct = {
  name: "",
  description: "",
  images: [],
  brand: "",
  price: "",
  oldPrice: "",
  countInStock: "",
  discount: "",
  catName: "",
  catId: "",
  subCat: "",
  subCatName: "",
  subCatId: "",
  thirdsubCat: "",
  thirdsubCatName: "",
  thirdsubCatId: "",
  category: null,
  isFeatured: false,
  productRam: [],
  size: [],
  productWeight: [],
  inventoryType: "none",
  inventoryVariants: [],
};

const OptionChecks = ({ title, values, selected, onToggle }) => (
  <div className="option-row">
    <strong>{title}</strong>
    <div>
      {values.map((value) => (
        <label className="option-chip" key={value}>
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => onToggle(value)}
          />
          {value}
        </label>
      ))}
    </div>
  </div>
);

const Products = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const load = useCallback(async () => {
    const [productsResult, categoriesResult] = await Promise.all([
      request("/api/seller/products"),
      request("/api/category"),
    ]);
    if (productsResult.success) setItems(productsResult.data || []);
    else setMessage(productsResult.message);
    if (categoriesResult.success) setCategories(categoriesResult.data || []);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const change = (key) => (event) =>
    setForm((current) => {
      const next = { ...current, [key]: event.target.value };
      if (key === "price" || key === "oldPrice") {
        next.discount = calculateDiscount(next.price, next.oldPrice);
      }
      return next;
    });
  const selectedCategory = useMemo(
    () => categories.find((item) => item._id === form.catId),
    [categories, form.catId],
  );
  const subCategories = selectedCategory?.children || [];
  const selectedSubCategory = subCategories.find(
    (item) => item._id === form.subCatId,
  );
  const thirdCategories = selectedSubCategory?.children || [];
  const variantOptions =
    form.inventoryType === "size"
      ? form.size
      : form.inventoryType === "ram"
        ? form.productRam
        : form.inventoryType === "weight"
          ? form.productWeight
          : [];
  const variants = variantOptions.map((value) => ({
    value,
    stock: Number(
      form.inventoryVariants.find((item) => item.value === value)?.stock || 0,
    ),
  }));
  const totalVariantStock = variants.reduce((sum, item) => sum + item.stock, 0);
  const toggleOption = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  const updateVariant = (value, stock) =>
    setForm((current) => ({
      ...current,
      inventoryVariants: [
        ...current.inventoryVariants.filter((item) => item.value !== value),
        { value, stock: Math.max(0, Number(stock) || 0) },
      ],
    }));
  const selectCategory = (event) => {
    const category = categories.find((item) => item._id === event.target.value);
    setForm((current) => ({
      ...current,
      catId: category?._id || "",
      catName: category?.name || "",
      category: category?._id || null,
      subCat: "",
      subCatName: "",
      subCatId: "",
      thirdsubCat: "",
      thirdsubCatName: "",
      thirdsubCatId: "",
    }));
  };
  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setFormError("");
    setUploading(true);
    const result = await uploadProductImages(files);
    setUploading(false);
    if (!result.success || !result.images?.length) {
      setFormError(result.message || "Image upload failed");
      return;
    }
    setForm((current) => ({
      ...current,
      images: [...current.images, ...result.images],
    }));
  };
  const startEdit = (product) => {
    setEditingId(product._id);
    setFormError("");
    setForm({
      ...emptyProduct,
      ...product,
      images: product.images || [],
      productRam: product.productRam || [],
      size: product.size || [],
      productWeight: product.productWeight || [],
      inventoryVariants: product.inventoryVariants || [],
    });
    setOpen(true);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!form.catId || !form.images.length) {
      setFormError("Category and at least one product image are required.");
      return;
    }
    setFormError("");
    setSaving(true);
    const productData = {
      ...form,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice || 0),
      discount: Number(form.discount || 0),
      countInStock:
        form.inventoryType === "none"
          ? Number(form.countInStock)
          : totalVariantStock,
      inventoryVariants: variants,
    };
    const result = await request(
      editingId ? `/api/seller/products/${editingId}` : "/api/seller/products",
      { method: editingId ? "PUT" : "POST", body: productData },
    );
    setMessage(result.message || "");
    if (result.success) {
      setOpen(false);
      setEditingId("");
      setForm(emptyProduct);
      await load();
    } else {
      setFormError(result.message || "Product could not be saved.");
    }
    setSaving(false);
  };
  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    const result = await request(`/api/seller/products/${product._id}`, {
      method: "DELETE",
    });
    setMessage(result.message || "");
    if (result.success) await load();
  };
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Products</h2>
          <p className="muted">{items.length} products in your store</p>
        </div>
        <button
          onClick={() => {
            setEditingId("");
            setForm(emptyProduct);
            setFormError("");
            setOpen(true);
          }}
        >
          Add product
        </button>
      </div>
      {message && <p className="notice success">{message}</p>}
      {items.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Approval</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="product-cell">
                      <img src={product.images?.[0]} alt="" />
                      <div>
                        <strong>{product.name}</strong>
                        <small>{product.brand}</small>
                      </div>
                    </div>
                  </td>
                  <td>{money(product.price)}</td>
                  <td>{product.countInStock}</td>
                  <td>
                    <span className={`status ${product.saleStatus === "discontinued" ? "cancelled" : product.approvalStatus || "approved"}`}>
                      {product.saleStatus === "discontinued"
                        ? "Discontinued"
                        : product.approvalStatus || "approved"}
                    </span>
                    {product.approvalReason && <small>{product.approvalReason}</small>}
                  </td>
                  <td>{product.catName || "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="secondary"
                        disabled={product.saleStatus === "discontinued"}
                        onClick={() => startEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="danger"
                        disabled={product.saleStatus === "discontinued"}
                        onClick={() => remove(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">No products yet. Add your first product.</div>
      )}
      {open && (
        <div className="modal-backdrop">
          <form className="product-form" onSubmit={submit}>
            <div className="panel-head">
              <h2>{editingId ? "Edit product" : "Add product"}</h2>
              <button
                type="button"
                className="close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="form-sections">
              {editingId && (
                <p className="notice">
                  Saving changes will send this product back to admin for approval.
                  It will not be visible to customers until it is approved again.
                </p>
              )}
              {formError && <p className="notice error">{formError}</p>}
              <div className="form-grid">
                <label className="full">
                  Product name
                  <input required value={form.name} onChange={change("name")} />
                </label>
                <label className="full">
                  Description
                  <textarea
                    required
                    rows="4"
                    value={form.description}
                    onChange={change("description")}
                  />
                </label>
                <label>
                  Category
                  <select required value={form.catId} onChange={selectCategory}>
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Subcategory
                  <select
                    value={form.subCatId}
                    onChange={(event) => {
                      const item = subCategories.find(
                        (cat) => cat._id === event.target.value,
                      );
                      setForm((current) => ({
                        ...current,
                        subCatId: item?._id || "",
                        subCat: item?.name || "",
                        subCatName: item?.name || "",
                        thirdsubCatId: "",
                        thirdsubCat: "",
                        thirdsubCatName: "",
                      }));
                    }}
                  >
                    <option value="">None</option>
                    {subCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Third-level category
                  <select
                    value={form.thirdsubCatId}
                    onChange={(event) => {
                      const item = thirdCategories.find(
                        (cat) => cat._id === event.target.value,
                      );
                      setForm((current) => ({
                        ...current,
                        thirdsubCatId: item?._id || "",
                        thirdsubCat: item?.name || "",
                        thirdsubCatName: item?.name || "",
                      }));
                    }}
                  >
                    <option value="">None</option>
                    {thirdCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Brand
                  <input value={form.brand} onChange={change("brand")} />
                </label>
                <label>
                  Price
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={change("price")}
                  />
                </label>
                <label>
                  Old price
                  <input
                    type="number"
                    min="0"
                    value={form.oldPrice}
                    onChange={change("oldPrice")}
                  />
                </label>
                <label>
                  Discount %
                  <input type="number" readOnly value={form.discount} />
                  <small className="muted">
                    Calculated automatically from price and old price.
                  </small>
                </label>
              </div>

              <fieldset>
                <legend>Options and variant inventory</legend>
                <OptionChecks
                  title="Sizes"
                  values={["XS", "S", "M", "L", "XL", "XXL"]}
                  selected={form.size}
                  onToggle={(value) => toggleOption("size", value)}
                />
                <OptionChecks
                  title="RAM"
                  values={["4GB", "6GB", "8GB", "12GB", "16GB", "32GB"]}
                  selected={form.productRam}
                  onToggle={(value) => toggleOption("productRam", value)}
                />
                <OptionChecks
                  title="Weights"
                  values={["250g", "500g", "1kg", "2kg", "5kg"]}
                  selected={form.productWeight}
                  onToggle={(value) => toggleOption("productWeight", value)}
                />
                <div className="form-grid compact">
                  <label>
                    Track stock by
                    <select
                      value={form.inventoryType}
                      onChange={change("inventoryType")}
                    >
                      <option value="none">Total stock only</option>
                      <option value="size" disabled={!form.size.length}>
                        Size
                      </option>
                      <option value="ram" disabled={!form.productRam.length}>
                        RAM
                      </option>
                      <option
                        value="weight"
                        disabled={!form.productWeight.length}
                      >
                        Weight
                      </option>
                    </select>
                  </label>
                  <label>
                    Total stock
                    <input
                      type="number"
                      min="0"
                      disabled={form.inventoryType !== "none"}
                      value={
                        form.inventoryType === "none"
                          ? form.countInStock
                          : totalVariantStock
                      }
                      onChange={change("countInStock")}
                    />
                  </label>
                </div>
                {form.inventoryType !== "none" && (
                  <div className="variant-grid">
                    {variants.map((variant) => (
                      <label key={variant.value}>
                        {variant.value}
                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(event) =>
                            updateVariant(variant.value, event.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>

              <fieldset>
                <legend>Media & images</legend>
                <div className="media-grid">
                  {form.images.map((image) => (
                    <div className="media-tile" key={image}>
                      <img src={image} alt="Product" />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            images: current.images.filter(
                              (item) => item !== image,
                            ),
                          }))
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="upload-tile">
                    + Upload images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(event) => {
                        uploadFiles(event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {uploading && (
                  <p className="upload-status">
                    Uploading to Cloudinary, please wait...
                  </p>
                )}
              </fieldset>
            </div>
            <button disabled={saving || uploading}>
              {saving
                ? "Saving product..."
                : uploading
                  ? "Uploading images..."
                  : editingId
                    ? "Save changes"
                    : "Create product"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

const Orders = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmingId, setConfirmingId] = useState("");
  useEffect(() => {
    let active = true;
    request("/api/seller/orders").then((result) => {
      if (!active) return;
      if (result.success) setItems(result.data || []);
      else setError(result.message);
    });
    return () => {
      active = false;
    };
  }, []);
  const confirmOrder = async (orderId) => {
    setError("");
    setSuccess("");
    setConfirmingId(orderId);
    const result = await request(`/api/seller/orders/${orderId}/confirm`, {
      method: "PUT",
    });
    if (result.success) {
      setItems((current) =>
        current.map((order) => (order._id === orderId ? result.data : order)),
      );
      setSuccess(result.message || "Order confirmed.");
    } else {
      setError(result.message || "Unable to confirm order.");
    }
    setConfirmingId("");
  };
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Orders</h2>
          <p className="muted">
            Only your products are shown inside multi-seller orders.
          </p>
        </div>
      </div>
      {error && <p className="notice error">{error}</p>}
      {success && <p className="notice success">{success}</p>}
      {items.length ? (
        <div className="order-list">
          {items.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="panel-head">
                <div>
                  <strong>{order.orderId}</strong>
                  <small>{new Date(order.createdAt).toLocaleString()}</small>
                </div>
                <span className={`status ${order.orderStatus}`}>
                  {order.orderStatus}
                </span>
              </div>
              <p>
                Customer: <strong>{order.customer?.name}</strong> ·{" "}
                {order.customer?.email}
              </p>
              {order.items.map((item) => (
                <div
                  className="order-item"
                  key={`${order._id}-${item.productId}`}
                >
                  <img src={item.image} alt="" />
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <strong>{money(item.subTotal)}</strong>
                </div>
              ))}
              <div className="order-total">
                Seller total: <strong>{money(order.sellerTotal)}</strong>
              </div>
              <details className="order-details">
                <summary>View order details</summary>
                <div className="order-details-grid">
                  <section>
                    <h4>Delivery address</h4>
                    <strong>{order.customer?.name || "Customer"}</strong>
                    <p>{order.deliveryAddress?.mobile || "No phone number"}</p>
                    <p>
                      {[
                        order.deliveryAddress?.address_line1,
                        order.deliveryAddress?.city,
                        order.deliveryAddress?.state,
                        order.deliveryAddress?.pincode,
                        order.deliveryAddress?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "No delivery address"}
                    </p>
                  </section>
                  <section>
                    <h4>Order information</h4>
                    <dl>
                      <div><dt>Order ID</dt><dd>{order.orderId}</dd></div>
                      <div><dt>Payment</dt><dd>{order.paymentMethod || "—"}</dd></div>
                      <div><dt>Payment status</dt><dd>{order.paymentStatus || "pending"}</dd></div>
                      <div><dt>Order status</dt><dd>{order.orderStatus}</dd></div>
                      <div><dt>Placed at</dt><dd>{new Date(order.createdAt).toLocaleString()}</dd></div>
                    </dl>
                  </section>
                </div>
                <div className="order-detail-items">
                  <h4>Your items in this order</h4>
                  {order.items.map((item, index) => (
                    <div className="order-detail-item" key={`${order._id}-detail-${item.productId}-${index}`}>
                      <img src={item.image} alt={item.name} />
                      <span>
                        <strong>{item.name}</strong>
                        <small>
                          Quantity: {item.quantity}
                          {item.size ? ` · Option: ${item.size}` : ""}
                        </small>
                      </span>
                      <strong>{money(item.subTotal)}</strong>
                    </div>
                  ))}
                </div>
              </details>
              {order.paymentMethod === "COD" && order.orderStatus === "pending" && (
                <button
                  type="button"
                  disabled={confirmingId === order._id}
                  onClick={() => confirmOrder(order._id)}
                >
                  {confirmingId === order._id
                    ? "Confirming..."
                    : "Confirm COD order"}
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">No orders for your products yet.</div>
      )}
    </section>
  );
};

const Stars = ({ value }) => (
  <span className="stars" aria-label={`${value} out of 5 stars`}>
    {"★".repeat(Math.round(value))}
    <span>{"★".repeat(5 - Math.round(value))}</span>
  </span>
);

const Reviews = () => {
  const [data, setData] = useState({
    reviews: [],
    summary: { total: 0, average: 0, distribution: [] },
  });
  const [rating, setRating] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [drafts, setDrafts] = useState({});
  const [replying, setReplying] = useState("");
  useEffect(() => {
    let active = true;
    request("/api/seller/reviews").then((result) => {
      if (!active) return;
      if (result.success) setData(result.data);
      else setError(result.message);
    });
    return () => {
      active = false;
    };
  }, []);
  const filtered = data.reviews.filter((review) => {
    const matchesRating = rating === "all" || review.rating === Number(rating);
    const text =
      `${review.productName} ${review.userName} ${review.comment}`.toLowerCase();
    return matchesRating && text.includes(query.trim().toLowerCase());
  });
  const saveReply = async (review) => {
    const reply = String(drafts[review._id] ?? review.sellerReply ?? "").trim();
    if (!reply) {
      setError("Please enter a reply.");
      return;
    }
    setReplying(review._id);
    setError("");
    setSuccess("");
    const result = await request(
      `/api/seller/reviews/${review.productId}/${review._id}/reply`,
      { method: "PUT", body: { reply } },
    );
    if (result.success) {
      setData((current) => ({
        ...current,
        reviews: current.reviews.map((item) =>
          item._id === review._id
            ? { ...item, sellerReply: result.data.sellerReply, sellerRepliedAt: result.data.sellerRepliedAt }
            : item,
        ),
      }));
      setSuccess(
        review.sellerReply
          ? "Your reply was updated successfully."
          : "Your reply was posted successfully.",
      );
      window.setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.message || "Unable to save reply.");
    }
    setReplying("");
  };
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Customer reviews</h2>
          <p className="muted">Feedback on products sold by your store.</p>
        </div>
      </div>
      {error && <p className="notice error">{error}</p>}
      {success && <p className="notice success">{success}</p>}
      <div className="review-summary">
        <div className="average-rating">
          <strong>{data.summary.average.toFixed(1)}</strong>
          <Stars value={data.summary.average} />
          <small>{data.summary.total} reviews</small>
        </div>
        <div className="rating-bars">
          {data.summary.distribution.map((item) => (
            <div key={item.rating}>
              <span>{item.rating} star</span>
              <i>
                <b
                  style={{
                    width: `${
                      data.summary.total
                        ? (item.count / data.summary.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </i>
              <small>{item.count}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="review-tools">
        <input
          placeholder="Search product, customer, or review..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
        >
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
      </div>
      {filtered.length ? (
        <div className="review-list">
          {filtered.map((review) => (
            <article className="review-card" key={review._id}>
              <img src={review.productImage} alt="" />
              <div>
                <div className="review-meta">
                  <strong>{review.productName}</strong>
                  <time>{new Date(review.createdAt).toLocaleDateString()}</time>
                </div>
                <Stars value={review.rating} />
                <p>{review.comment}</p>
                <small>By {review.userName || "Customer"}</small>
                <div className="seller-reply">
                  <label>
                    Your reply
                    <textarea
                      rows="2"
                      maxLength="1000"
                      placeholder="Reply publicly to this customer..."
                      value={drafts[review._id] ?? review.sellerReply ?? ""}
                      onChange={(event) => setDrafts((current) => ({ ...current, [review._id]: event.target.value }))}
                    />
                  </label>
                  <button type="button" disabled={replying === review._id} onClick={() => saveReply(review)}>
                    {replying === review._id ? "Saving..." : review.sellerReply ? "Update reply" : "Post reply"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">No reviews match this filter.</div>
      )}
    </section>
  );
};

const StoreProfile = ({ onUpdated }) => {
  const [form, setForm] = useState({
    storeName: "",
    storeDescription: "",
    storeLogo: "",
    storeCover: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  useEffect(() => {
    let active = true;
    request("/api/seller/store").then((result) => {
      if (active && result.success) setForm(result.data);
      else if (active) setError(result.message);
    });
    return () => {
      active = false;
    };
  }, []);
  const change = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  const upload = async (key, file) => {
    if (!file) return;
    setError("");
    setUploading(key);
    const result = await uploadStoreImage(file);
    if (result.success) {
      setForm((current) => ({ ...current, [key]: result.data.url }));
    } else setError(result.message);
    setUploading("");
  };
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const result = await request("/api/seller/store", {
      method: "PUT",
      body: form,
    });
    if (result.success) {
      setForm(result.data);
      setMessage(result.message);
      onUpdated?.(result.data);
    } else setError(result.message);
    setBusy(false);
  };
  return (
    <section className="panel store-panel">
      <div className="panel-head">
        <div>
          <h2>Store profile</h2>
          <p className="muted">Customize how customers see your store.</p>
        </div>
      </div>
      {form.storeCover ? (
        <div
          className="store-cover"
          style={{ backgroundImage: `url("${form.storeCover}")` }}
        />
      ) : (
        <div className="store-cover empty-cover">Cover image preview</div>
      )}
      <div className="store-identity">
        <div className="store-logo">
          {form.storeLogo ? (
            <img src={form.storeLogo} alt="Store logo" />
          ) : (
            <span>{form.storeName?.[0] || "S"}</span>
          )}
        </div>
        <div>
          <h3>{form.storeName || "Your store"}</h3>
          <p>{form.storeDescription || "Add a description for your store."}</p>
        </div>
      </div>
      <form className="store-form" onSubmit={submit}>
        {error && <p className="notice error">{error}</p>}
        {message && <p className="notice success">{message}</p>}
        <label>
          Store name
          <input
            required
            maxLength="80"
            value={form.storeName}
            onChange={change("storeName")}
          />
        </label>
        <label>
          Store description
          <textarea
            rows="5"
            maxLength="600"
            value={form.storeDescription}
            onChange={change("storeDescription")}
          />
          <small>{form.storeDescription?.length || 0}/600 characters</small>
        </label>
        <div className="store-upload-grid">
          <label className="file-button">
            {uploading === "storeLogo" ? "Uploading logo..." : "Upload logo"}
            <input
              type="file"
              accept="image/*"
              disabled={Boolean(uploading)}
              onChange={(event) => upload("storeLogo", event.target.files?.[0])}
            />
          </label>
          <label className="file-button">
            {uploading === "storeCover" ? "Uploading cover..." : "Upload cover"}
            <input
              type="file"
              accept="image/*"
              disabled={Boolean(uploading)}
              onChange={(event) =>
                upload("storeCover", event.target.files?.[0])
              }
            />
          </label>
        </div>
        <p className="muted image-hint">
          Recommended: square logo and a cover image at least 1400 × 400 px.
        </p>
        <button disabled={busy || Boolean(uploading)}>
          {busy ? "Saving..." : "Save store profile"}
        </button>
      </form>
    </section>
  );
};

const SellerArea = () => {
  const [state, setState] = useState({
    loading: true,
    seller: null,
    error: "",
  });
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    request("/api/user/seller/session").then((result) => {
      if (!active) return;
      setState({
        loading: false,
        seller: result.data || null,
        error: result.success ? "" : result.message,
      });
    });
    return () => {
      active = false;
    };
  }, []);
  const logout = () => {
    localStorage.removeItem("sellerAccessToken");
    localStorage.removeItem("sellerRefreshToken");
    navigate("/login");
  };
  if (state.loading)
    return <main className="center">Checking seller access...</main>;
  if (state.error)
    return (
      <main className="center">
        <section className="status-card">
          <div className="clock">⌛</div>
          <h1>Seller access unavailable</h1>
          <p>{state.error}</p>
          {state.seller?.sellerRejectionReason && (
            <p className="reason">
              Reason: {state.seller.sellerRejectionReason}
            </p>
          )}
          <button onClick={logout}>Back to sign in</button>
        </section>
      </main>
    );
  return (
    <Layout seller={state.seller}>
      <Routes>
        <Route path="dashboard" element={<DashboardHome seller={state.seller} />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="messages" element={<Messages />} />
        <Route
          path="store"
          element={
            <StoreProfile
              onUpdated={(store) =>
                setState((current) => ({
                  ...current,
                  seller: { ...current.seller, ...store },
                }))
              }
            />
          }
        />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<AuthCard mode="login" />} />
    <Route path="/register" element={<AuthCard mode="register" />} />
    <Route
      path="/*"
      element={
        localStorage.getItem("sellerAccessToken") ? (
          <SellerArea />
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
  </Routes>
);

export default App;
