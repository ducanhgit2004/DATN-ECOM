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

const toDateInput = (value) =>
  value
    ? new Date(value).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

const AddBlog = ({ blog = null }) => {
  const context = useContext(MyContext);
  const [form, setForm] = useState({
    title: blog?.title || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content || "",
    publishedAt: toDateInput(blog?.publishedAt),
    order: blog?.order ?? 0,
    active: blog?.active ?? true,
  });
  const [image, setImage] = useState(blog?.image || "");
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
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim())
      return context.alertBox(
        "error",
        "Title, excerpt, and content are required.",
      );
    if (!image && !file)
      return context.alertBox("error", "Please choose a featured image.");
    setLoading(true);
    try {
      let imageUrl = image;
      if (file) {
        const uploaded = await uploadImages("/api/blogs/uploadImages", [file]);
        if (!uploaded?.success || !uploaded.images?.[0])
          throw new Error(uploaded?.message || "Image upload failed.");
        imageUrl = uploaded.images[0];
      }
      const payload = {
        ...form,
        image: imageUrl,
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        order: Number(form.order) || 0,
        publishedAt: new Date(`${form.publishedAt}T00:00:00`).toISOString(),
      };
      const result = blog
        ? await editData(`/api/blogs/${blog._id}`, payload)
        : await postData("/api/blogs/create", payload);
      if (!result?.success)
        throw new Error(result?.message || "Unable to save the blog post.");
      context.alertBox(
        "success",
        result.message ||
          (blog
            ? "Blog post updated successfully."
            : "Blog post created successfully."),
      );
      context.setBlogRefreshKey((key) => key + 1);
      context.setIsOpenFullScreenPanel({ open: false, model: "" });
    } catch (error) {
      context.alertBox(
        "error",
        error.message || "Unable to save the blog post.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-5 bg-gray-50 min-h-full">
      <form className="form p-8 max-w-[1100px]" onSubmit={submit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <label className="text-sm font-semibold md:col-span-2">
            Title
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="block mt-2 w-full h-[42px] border rounded p-3 font-normal"
              placeholder="Enter the blog title"
            />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Short description
            <textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              rows="3"
              className="block mt-2 w-full border rounded p-3 font-normal"
              placeholder="Displayed on the home page card"
            />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Article content
            <textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              rows="12"
              className="block mt-2 w-full border rounded p-3 font-normal"
              placeholder="Write the full article content"
            />
          </label>
          <label className="text-sm font-semibold">
            Publish date
            <input
              type="date"
              value={form.publishedAt}
              onChange={(e) => update("publishedAt", e.target.value)}
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
            label="Published on storefront"
          />
        </div>
        <h3 className="text-[16px] font-[600] mb-2">Featured image</h3>
        <p className="text-sm text-gray-500 mb-4">
          Recommended ratio: 16:10 or wider.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(preview || image) && (
            <div className="relative col-span-2 h-[260px] rounded-md overflow-hidden border bg-white">
              <button
                type="button"
                aria-label="Remove featured image"
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
                alt="Blog preview"
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
            <FaCloudUploadAlt className="text-[20px]" />
          )}
          {blog ? "Update Blog Post" : "Publish Blog Post"}
        </Button>
      </form>
    </section>
  );
};

export default AddBlog;
