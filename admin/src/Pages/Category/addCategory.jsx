import { useContext, useEffect, useMemo, useState } from "react";
import UploadBox from "../../components/UploadBox";
import { Button, CircularProgress } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MyContext } from "../../App";
import { editData, postData, uploadImages } from "../../utils/api";

const AddCategory = ({ category = null }) => {
  const context = useContext(MyContext);
  const [name, setName] = useState(category?.name || "");
  const [existingImages, setExistingImages] = useState(category?.images || []);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const chooseImages = (event) => {
    const selected = Array.from(event.target.files || []);
    const invalid = selected.find((file) => !file.type.startsWith("image/"));
    if (invalid) return context.alertBox("error", "Choose Image");
    setFiles((current) => [...current, ...selected]);
    event.target.value = "";
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim())
      return context.alertBox("error", "Please Provide Category Name");
    if (!category && files.length === 0)
      return context.alertBox("error", "Choose at least 1 image");

    setLoading(true);
    try {
      let images = existingImages;
      if (files.length) {
        const uploaded = await uploadImages(
          "/api/category/uploadImages",
          files,
        );
        if (uploaded?.error || !uploaded?.images)
          throw new Error(uploaded?.message || "Upload Image Failed");
        images = [...existingImages, ...uploaded.images];
      }

      const payload = {
        name: name.trim(),
        images,
        parentId: null,
        parentCatName: "",
      };
      const result = category
        ? await editData(`/api/category/${category._id}`, payload)
        : await postData("/api/category/create", payload);

      if (result?.error || !result?.success)
        throw new Error(result?.message || "Can not save category");
      context.alertBox(
        "success",
        category ? "Updated Successfully" : "Added Successfully",
      );
      context.setCategoryRefreshKey((key) => key + 1);
      context.setIsOpenFullScreenPanel({ open: false, model: "" });
    } catch (error) {
      context.alertBox("error", error.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-5 bg-gray-50 min-h-full">
      <form className="form py-3 p-8" onSubmit={submit}>
        <div className="max-w-[1100px]">
          <div className="mb-6 max-w-[500px]">
            <label className="block text-[14px] font-[600] mb-2 text-black">
              Category Name
            </label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[42px] border border-gray-300 focus:outline-none focus:border-blue-500 rounded p-3 text-sm"
              placeholder="Name"
            />
          </div>
          <h3 className="text-[16px] font-[600] mb-3 text-black">
            Category Images
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {existingImages.map((src, index) => (
              <div
                className="relative h-[150px] rounded-md overflow-hidden border"
                key={src}
              >
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() =>
                    setExistingImages((items) =>
                      items.filter((_, i) => i !== index),
                    )
                  }
                  className="absolute right-1 top-1 w-7 h-7 rounded-full bg-red-600 text-white z-10 flex items-center justify-center"
                >
                  <IoMdClose />
                </button>
                <img
                  src={src}
                  alt={name || "Category"}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {previews.map((src, index) => (
              <div
                className="relative h-[150px] rounded-md overflow-hidden border"
                key={src}
              >
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() =>
                    setFiles((items) => items.filter((_, i) => i !== index))
                  }
                  className="absolute right-1 top-1 w-7 h-7 rounded-full bg-red-600 text-white z-10 flex items-center justify-center"
                >
                  <IoMdClose />
                </button>
                <img
                  src={src}
                  alt="Ảnh xem trước"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <UploadBox multiple onChange={chooseImages} accept="image/*" />
          </div>
        </div>
        <div className="w-[250px] mt-8">
          <Button
            disabled={loading}
            type="submit"
            className="btn-blue btn-lg w-full !flex !gap-2"
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              <FaCloudUploadAlt className="text-[25px]" />
            )}
            {category ? "Update Category" : "Publish Category"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default AddCategory;
