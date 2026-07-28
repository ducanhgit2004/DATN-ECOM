import { useContext, useMemo, useState } from "react";
import { Button, Checkbox, ListItemText, MenuItem, Rating, Select } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import UploadBox from "../../components/UploadBox";
import { MyContext } from "../../App";
import { editData, postData, uploadImages } from "../../utils/api";

const calculateDiscount = (price, oldPrice) => {
  const current = Number(price);
  const original = Number(oldPrice);
  if (!Number.isFinite(current) || !Number.isFinite(original) || original <= 0) {
    return 0;
  }
  return Math.min(
    100,
    Math.max(0, Math.round(((original - current) / original) * 10000) / 100),
  );
};

const emptyForm = {
  name: "",
  description: "",
  images: [],
  brand: "",
  price: "",
  oldPrice: "",
  catName: "",
  catId: "",
  subCat: "",
  subCatName: "",
  subCatId: "",
  thirdsubCat: "",
  thirdsubCatName: "",
  thirdsubCatId: "",
  countInStock: "",
  rating: 0,
  isFeatured: false,
  bannerEnabled: false,
  bannerImage: "",
  bannerSubtitle: "",
  bannerTitle: "",
  bannerPriceLabel: "Starting at",
  bannerPriceText: "",
  bannerButtonText: "SHOP NOW",
  discount: "",
  productRam: [],
  size: [],
  productWeight: [],
  inventoryType: "none",
  inventoryVariants: [],
};

const normalizeProduct = (product) => ({
  ...emptyForm,
  ...product,
  images: product?.images || [],
  rating: Number(product?.rating || 0),
  productRam: Array.isArray(product?.productRam)
    ? product.productRam
    : product?.productRam ? [product.productRam] : [],
  size: product?.size || [],
  productWeight: product?.productWeight || [],
  inventoryType: product?.inventoryType || "none",
  inventoryVariants: Array.isArray(product?.inventoryVariants) ? product.inventoryVariants : [],
});

const AddProduct = ({ product }) => {
  const context = useContext(MyContext);
  const isEditing = Boolean(product?._id);
  const [form, setForm] = useState(() => normalizeProduct(product));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCategory = useMemo(
    () => context.catData?.find((item) => item._id === form.catId),
    [context.catData, form.catId],
  );
  const subCategories = selectedCategory?.children || [];
  const selectedSubCategory = subCategories.find(
    (item) => item._id === form.subCatId,
  );
  const thirdLevelCategories = selectedSubCategory?.children || [];
  const inventoryOptions = form.inventoryType === "size"
    ? form.size
    : form.inventoryType === "ram"
      ? form.productRam
      : form.inventoryType === "weight"
        ? form.productWeight
        : [];
  const inventoryVariants = inventoryOptions.map((value) => ({
    value,
    stock: Number(form.inventoryVariants.find((item) => item.value === value)?.stock || 0),
  }));
  const totalVariantStock = inventoryVariants.reduce((total, item) => total + item.stock, 0);

  const update = (name, value) =>
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "price" || name === "oldPrice") {
        next.discount = calculateDiscount(next.price, next.oldPrice);
      }
      return next;
    });

  const updateVariantStock = (value, stock) => setForm((current) => ({
    ...current,
    inventoryVariants: [
      ...current.inventoryVariants.filter((item) => item.value !== value),
      { value, stock: Math.max(0, Number(stock) || 0) },
    ],
  }));

  const selectCategory = (event) => {
    const category = context.catData?.find(
      (item) => item._id === event.target.value,
    );
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

  const selectSubCategory = (event) => {
    const subCategory = subCategories.find(
      (item) => item._id === event.target.value,
    );
    setForm((current) => ({
      ...current,
      subCatId: subCategory?._id || "",
      subCat: subCategory?.name || "",
      subCatName: subCategory?.name || "",
      thirdsubCat: "",
      thirdsubCatName: "",
      thirdsubCatId: "",
    }));
  };

  const selectThirdLevelCategory = (event) => {
    const category = thirdLevelCategories.find(
      (item) => item._id === event.target.value,
    );
    setForm((current) => ({
      ...current,
      thirdsubCatId: category?._id || "",
      thirdsubCat: category?.name || "",
      thirdsubCatName: category?.name || "",
    }));
  };

  const handleImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const result = await uploadImages("/api/product/uploadImages", files);
    if (result?.error || !result?.images?.length)
      context.alertBox("error", result?.message || "Image upload failed.");
    else
      setForm((current) => ({
        ...current,
        images: [...current.images, ...result.images],
      }));
    setUploading(false);
    event.target.value = "";
  };

  const handleBannerImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      context.alertBox("error", "Please choose an image file.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    const result = await uploadImages("/api/product/uploadImages", [file]);
    if (result?.error || !result?.images?.[0])
      context.alertBox("error", result?.message || "Banner image upload failed.");
    else update("bannerImage", result.images[0]);
    setUploading(false);
    event.target.value = "";
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.catId) {
      context.alertBox(
        "error",
        "Product name, description, and category are required.",
      );
      return;
    }
    if (!form.images.length) {
      context.alertBox("error", "Please upload at least one product image.");
      return;
    }
    if (form.bannerEnabled && !form.bannerImage) {
      context.alertBox("error", "Please upload a promotional banner image.");
      return;
    }
    if (
      form.price === "" ||
      (form.inventoryType === "none" && form.countInStock === "") ||
      form.discount === "" ||
      !form.rating
    ) {
      context.alertBox(
        "error",
        "Price, stock, discount, and rating are required.",
      );
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice || 0),
      countInStock: form.inventoryType === "none" ? Number(form.countInStock) : totalVariantStock,
      inventoryVariants,
      discount: Number(form.discount),
      rating: Number(form.rating),
      isFeatured: Boolean(form.isFeatured),
      bannerEnabled: Boolean(form.bannerEnabled),
    };
    const result = isEditing
      ? await editData(`/api/product/updateProduct/${product._id}`, payload)
      : await postData("/api/product/create", payload);
    setSaving(false);
    if (result?.error || !result?.success) {
      context.alertBox(
        "error",
        result?.message || "Product could not be saved.",
      );
      return;
    }
    context.alertBox(
      "success",
      isEditing
        ? "Product updated successfully."
        : "Product created successfully.",
    );
    context.setProductRefreshKey((key) => key + 1);
    context.setIsOpenFullScreenPanel({ open: false, model: "" });
  };

  const field = (label, name, type = "text") => (
    <div>
      <h3 className="text-[14px] font-[500] mb-1 text-black">{label}</h3>
      <input
        type={type}
        className="w-full h-[40px] border border-gray-300 rounded-sm p-3 text-sm"
        name={name}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
      />
    </div>
  );

  return (
    <section className="p-5 bg-gray-50">
      <form className="form py-3 p-8" onSubmit={submit}>
        <div className="scroll max-h-[80vh] overflow-y-auto pr-2 space-y-4">
          {field("Product Name", "name")}
          <div>
            <h3 className="text-[14px] font-[500] mb-1 text-black">
              Product Description
            </h3>
            <textarea
              className="w-full h-[120px] border border-gray-300 rounded-sm p-3 text-sm"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-[14px] font-[500] mb-1">Product Category</h3>
              <Select
                size="small"
                className="w-full"
                value={form.catId}
                onChange={selectCategory}
              >
                <MenuItem value="">Select category</MenuItem>
                {context.catData?.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div>
              <h3 className="text-[14px] font-[500] mb-1">
                Product Subcategory
              </h3>
              <Select
                size="small"
                className="w-full"
                value={form.subCatId}
                onChange={selectSubCategory}
              >
                <MenuItem value="">None</MenuItem>
                {subCategories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div>
              <h3 className="text-[14px] font-[500] mb-1">
                Third-level Category
              </h3>
              <Select
                size="small"
                className="w-full"
                value={form.thirdsubCatId}
                onChange={selectThirdLevelCategory}
              >
                <MenuItem value="">None</MenuItem>
                {thirdLevelCategories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {field("Product Price", "price", "number")}
            {field("Product Old Price", "oldPrice", "number")}
            <div>
              <h3 className="text-[14px] font-[500] mb-1 text-black">Total Stock</h3>
              <input type="number" min="0" className="w-full h-[40px] border border-gray-300 rounded-sm p-3 text-sm disabled:bg-gray-100" value={form.inventoryType === "none" ? form.countInStock : totalVariantStock} disabled={form.inventoryType !== "none"} onChange={(event) => update("countInStock", event.target.value)} />
            </div>
            <div>
              <h3 className="text-[14px] font-[500] mb-1 text-black">
                Product Discount (%)
              </h3>
              <input
                type="number"
                readOnly
                value={form.discount}
                className="w-full h-[40px] border border-gray-300 rounded-sm p-3 text-sm bg-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Automatically calculated from price and old price.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {field("Product Brand", "brand")}
            <div>
              <h3 className="text-[14px] font-[500] mb-1">Is Featured?</h3>
              <Select
                size="small"
                className="w-full"
                value={form.isFeatured}
                onChange={(e) => update("isFeatured", e.target.value)}
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </div>
            <div>
              <h3 className="text-[14px] font-[500] mb-1">Product RAM</h3>
              <Select
                multiple
                size="small"
                className="w-full"
                value={form.productRam}
                onChange={(e) => update("productRam", e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {["4GB", "6GB", "8GB", "12GB", "16GB", "32GB"].map((v) => (
                  <MenuItem key={v} value={v}>
                    <Checkbox checked={form.productRam.includes(v)} size="small" />
                    <ListItemText primary={v} />
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div>
              <h3 className="text-[14px] font-[500] mb-1">Rating</h3>
              <Rating
                precision={0.5}
                value={form.rating}
                onChange={(_, value) => update("rating", value || 0)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-[14px] font-[500] mb-1">Sizes</h3>
              <Select
                multiple
                size="small"
                className="w-full"
                value={form.size}
                onChange={(e) => update("size", e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {["XS", "S", "M", "L", "XL", "XXL"].map((v) => (
                  <MenuItem key={v} value={v}>
                    <Checkbox checked={form.size.includes(v)} size="small" />
                    <ListItemText primary={v} />
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div>
              <h3 className="text-[14px] font-[500] mb-1">Weights</h3>
              <Select
                multiple
                size="small"
                className="w-full"
                value={form.productWeight}
                onChange={(e) => update("productWeight", e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {["250g", "500g", "1kg", "2kg", "5kg"].map((v) => (
                  <MenuItem key={v} value={v}>
                    <Checkbox checked={form.productWeight.includes(v)} size="small" />
                    <ListItemText primary={v} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
            <h3 className="font-[700] text-[17px] mb-3">Variant Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <h3 className="text-[14px] font-[500] mb-1">Track stock by</h3>
                <Select size="small" className="w-full bg-white" value={form.inventoryType} onChange={(event) => update("inventoryType", event.target.value)}>
                  <MenuItem value="none">No variants (total stock only)</MenuItem>
                  <MenuItem value="size" disabled={!form.size.length}>Size</MenuItem>
                  <MenuItem value="ram" disabled={!form.productRam.length}>RAM</MenuItem>
                  <MenuItem value="weight" disabled={!form.productWeight.length}>Weight</MenuItem>
                </Select>
              </div>
              <div><span className="text-sm text-gray-600">Calculated total stock</span><div className="text-[24px] font-[700] text-blue-700">{form.inventoryType === "none" ? Number(form.countInStock || 0) : totalVariantStock}</div></div>
            </div>
            {form.inventoryType !== "none" && (
              inventoryVariants.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">{inventoryVariants.map((variant) => <label key={variant.value} className="flex items-center gap-3 rounded-md border bg-white p-3"><span className="font-[600] min-w-[60px]">{variant.value}</span><input type="number" min="0" value={variant.stock} onChange={(event) => updateVariantStock(variant.value, event.target.value)} className="w-full h-[38px] border border-gray-300 rounded px-3" aria-label={`Stock for ${variant.value}`} /></label>)}</div> : <p className="mt-3 text-sm text-orange-600">Select at least one option for this variant type first.</p>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-[700] text-[18px]">Promotional Home Banner</h3>
                <p className="text-sm text-gray-500 !my-1">Create a custom Home banner that opens this product when clicked.</p>
              </div>
              <label className="flex items-center gap-2 font-[600] text-sm whitespace-nowrap">
                <Checkbox checked={form.bannerEnabled} onChange={(event) => update("bannerEnabled", event.target.checked)} />
                Show on Home
              </label>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <h4 className="text-[14px] font-[600] mb-2">Banner Image</h4>
                {form.bannerImage ? (
                  <div className="relative w-full aspect-[2/1] rounded-md overflow-hidden border bg-gray-100">
                    <button type="button" aria-label="Remove banner image" onClick={() => update("bannerImage", "")} className="absolute right-2 top-2 z-10 bg-red-600 text-white rounded-full p-1"><IoMdClose /></button>
                    <img src={form.bannerImage} alt="Product promotional banner" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="max-w-[240px]"><UploadBox accept="image/*" onChange={handleBannerImage} /></div>
                )}
                <p className="text-xs text-gray-500 mt-2">Recommended: a wide 2:1 image with the product positioned toward the left.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("Small Heading", "bannerSubtitle")}
                {field("Price Label", "bannerPriceLabel")}
                <div className="sm:col-span-2">{field("Main Heading", "bannerTitle")}</div>
                {field("Custom Price Text", "bannerPriceText")}
                {field("Button Text", "bannerButtonText")}
              </div>
            </div>
            {form.bannerEnabled && !form.bannerImage && <p className="text-sm text-orange-600 mt-3">Upload a banner image before publishing this banner.</p>}
          </div>
          <div>
            <h3 className="font-[700] text-[18px] mb-3">Media & Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {form.images.map((image) => (
                <div
                  key={image}
                  className="relative h-[150px] border rounded-md overflow-hidden"
                >
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() =>
                      update(
                        "images",
                        form.images.filter((item) => item !== image),
                      )
                    }
                    className="absolute right-1 top-1 z-10 bg-red-600 text-white rounded-full p-1"
                  >
                    <IoMdClose />
                  </button>
                  <img
                    src={image}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <UploadBox multiple accept="image/*" onChange={handleImages} />
            </div>
            {uploading && (
              <p className="text-sm text-blue-600 mt-2">Uploading images...</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={saving || uploading}
            className="btn-blue !text-white !mt-3 flex gap-2"
          >
            <FaCloudUploadAlt />
            {saving
              ? "Saving..."
              : isEditing
                ? "Update Product"
                : "Publish Product"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default AddProduct;
