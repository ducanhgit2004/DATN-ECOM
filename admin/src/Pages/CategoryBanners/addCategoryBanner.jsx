import { useContext, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
} from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import UploadBox from "../../components/UploadBox";
import { MyContext } from "../../App";
import { editData, postData, uploadImages } from "../../utils/api";

const AddCategoryBanner = ({ banner = null }) => {
  const context = useContext(MyContext);
  const [form, setForm] = useState({
    subtitle: banner?.subtitle || "",
    title: banner?.title || "",
    buttonText: banner?.buttonText || "BUY NOW",
    textAlign: banner?.textAlign || "left",
    placement: banner?.placement || "category-slider",
    categoryId: banner?.categoryId?._id || banner?.categoryId || "",
    order: banner?.order ?? 0,
    active: banner?.active ?? true,
  });
  const [image, setImage] = useState(banner?.image || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const chooseImage = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    if (!selected.type.startsWith("image/"))
      return context.alertBox("error", "Please choose an image file.");
    setFile(selected);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.categoryId)
      return context.alertBox("error", "Please select a destination category.");
    if (!image && !file)
      return context.alertBox("error", "Please choose a banner image.");
    setLoading(true);
    try {
      let imageUrl = image;
      if (file) {
        const uploaded = await uploadImages(
          "/api/category-banners/uploadImages",
          [file],
        );
        if (!uploaded?.success || !uploaded.images?.[0])
          throw new Error(uploaded?.message || "Image upload failed.");
        imageUrl = uploaded.images[0];
      }
      const payload = {
        ...form,
        image: imageUrl,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        buttonText: form.buttonText.trim() || "BUY NOW",
        order: Number(form.order) || 0,
      };
      const result = banner
        ? await editData(`/api/category-banners/${banner._id}`, payload)
        : await postData("/api/category-banners/create", payload);
      if (!result?.success)
        throw new Error(result?.message || "Unable to save category banner.");
      context.alertBox(
        "success",
        banner ? "Category banner updated." : "Category banner created.",
      );
      context.setCategoryBannerRefreshKey((key) => key + 1);
      context.setIsOpenFullScreenPanel({ open: false, model: "" });
    } catch (error) {
      context.alertBox(
        "error",
        error.message || "Unable to save category banner.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-5 bg-gray-50 min-h-full">
      <form className="form p-8 max-w-[1100px]" onSubmit={submit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <label className="text-sm font-semibold">
            Display position
            <select
              value={form.placement}
              onChange={(e) => update("placement", e.target.value)}
              className="block mt-2 w-full h-[42px] border rounded px-3 font-normal bg-white"
            >
              <option value="category-slider">Lower category slider</option>
              <option value="hero-side">Beside main slider</option>
              <option value="latest-products">After Latest Products</option>
              <option value="featured-products">After Featured Products</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Destination category
            <select
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className="block mt-2 w-full h-[42px] border rounded px-3 font-normal bg-white"
            >
              <option value="">Select category</option>
              {context.catData.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Text alignment
            <select
              value={form.textAlign}
              onChange={(e) => update("textAlign", e.target.value)}
              className="block mt-2 w-full h-[42px] border rounded px-3 font-normal bg-white"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Small heading
            <input
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              className="block mt-2 w-full h-[42px] border rounded p-3 font-normal"
              placeholder="New collection"
            />
          </label>
          <label className="text-sm font-semibold">
            Main heading
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="block mt-2 w-full h-[42px] border rounded p-3 font-normal"
              placeholder="Leave empty to use category name"
            />
          </label>
          <label className="text-sm font-semibold">
            Button text
            <input
              value={form.buttonText}
              onChange={(e) => update("buttonText", e.target.value)}
              className="block mt-2 w-full h-[42px] border rounded p-3 font-normal"
            />
          </label>
          <label className="text-sm font-semibold">
            Display order
            <input
              type="number"
              min="0"
              value={form.order}
              onChange={(e) => update("order", e.target.value)}
              className="block mt-2 w-full h-[42px] border rounded p-3 font-normal"
            />
          </label>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.active}
                onChange={(e) => update("active", e.target.checked)}
              />
            }
            label="Active on storefront"
          />
        </div>
        <h3 className="text-[16px] font-[600] mb-2">Banner image</h3>
        <p className="text-sm text-gray-500 mb-4">
          Recommended ratio: 16:9, for example 1600 × 900 px. Other image
          sizes will be center-cropped to this ratio.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(preview || image) && (
            <div className="relative col-span-2 aspect-video rounded-md overflow-hidden border bg-white">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setImage("");
                }}
                className="absolute right-2 top-2 w-7 h-7 rounded-full bg-red-600 text-white z-10 flex items-center justify-center"
              >
                <IoMdClose />
              </button>
              <img
                src={preview || image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <UploadBox accept="image/*" onChange={chooseImage} />
        </div>
        <Button
          disabled={loading}
          type="submit"
          className="btn-blue btn-lg !mt-8 !w-[250px] !flex !gap-2"
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <FaCloudUploadAlt className="text-[25px]" />
          )}
          {banner ? "Update Banner" : "Publish Banner"}
        </Button>
      </form>
    </section>
  );
};

export default AddCategoryBanner;
