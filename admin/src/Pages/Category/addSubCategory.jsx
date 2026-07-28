import { useContext, useEffect, useState } from "react";
import { Button, CircularProgress, MenuItem, Select } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MyContext } from "../../App";
import { editData, fetchDataFromApi, postData } from "../../utils/api";

const AddSubCategory = ({
  subCategory = null,
  level = 2,
  initialParentId = "",
}) => {
  const context = useContext(MyContext);
  const { alertBox } = context;
  const categoryLevel = subCategory?.level || level;
  const [categories, setCategories] = useState([]);
  const [parentId, setParentId] = useState(
    subCategory?.parentId || initialParentId,
  );
  const [name, setName] = useState(subCategory?.name || "");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      const result = await fetchDataFromApi("/api/category");
      if (!active) return;

      if (result?.success) setCategories(result.data || []);
      else alertBox("error", result?.message || "Unable to load categories.");
      setLoadingCategories(false);
    };

    loadCategories();
    return () => {
      active = false;
    };
  }, [alertBox]);

  const submit = async (event) => {
    event.preventDefault();

    if (!parentId)
      return context.alertBox(
        "error",
        `Please select a parent ${categoryLevel === 3 ? "subcategory" : "category"}.`,
      );
    if (!name.trim())
      return context.alertBox(
        "error",
        `Please enter a ${categoryLevel === 3 ? "third-level category" : "subcategory"} name.`,
      );

    const parentOptions =
      categoryLevel === 3
        ? categories.flatMap((category) => category.children || [])
        : categories;
    const parent = parentOptions.find((category) => category._id === parentId);
    if (!parent)
      return context.alertBox("error", "The selected category was not found.");

    setSaving(true);
    const payload = {
      name: name.trim(),
      parentId,
      parentCatName: parent.name,
      images: subCategory?.images || [],
    };
    const result = subCategory
      ? await editData(`/api/category/${subCategory._id}`, payload)
      : await postData("/api/category/create", payload);

    if (result?.success) {
      context.alertBox(
        "success",
        subCategory
          ? `${categoryLevel === 3 ? "Third-level category" : "Subcategory"} updated successfully.`
          : `${categoryLevel === 3 ? "Third-level category" : "Subcategory"} added successfully.`,
      );
      context.setCategoryRefreshKey((key) => key + 1);
      context.setIsOpenFullScreenPanel({ open: false, model: "" });
    } else {
      context.alertBox(
        "error",
        result?.message ||
          (subCategory
            ? `Unable to update the ${categoryLevel === 3 ? "third-level category" : "subcategory"}.`
            : `Unable to add the ${categoryLevel === 3 ? "third-level category" : "subcategory"}.`),
      );
    }
    setSaving(false);
  };

  return (
    <section className="p-5 bg-gray-50 min-h-full">
      <form className="form py-3 p-8" onSubmit={submit}>
        <div className="grid grid-cols-1 md:grid-cols-2 mb-3 gap-5 max-w-[900px]">
          <div>
            <label className="block text-[14px] font-[600] mb-2 text-black">
              Parent {categoryLevel === 3 ? "Subcategory" : "Category"}
            </label>
            <Select
              size="small"
              className="w-full bg-white"
              value={parentId}
              displayEmpty
              disabled={loadingCategories || saving}
              onChange={(event) => setParentId(event.target.value)}
            >
              <MenuItem value="" disabled>
                {loadingCategories
                  ? "Loading categories..."
                  : `Select a ${categoryLevel === 3 ? "subcategory" : "category"}`}
              </MenuItem>
              {categoryLevel === 3
                ? categories.flatMap((category) =>
                    (category.children || []).map((item) => (
                      <MenuItem value={item._id} key={item._id}>
                        {category.name} / {item.name}
                      </MenuItem>
                    )),
                  )
                : categories.map((category) => (
                    <MenuItem value={category._id} key={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
            </Select>
          </div>
          <div>
            <label className="block text-[14px] font-[600] mb-2 text-black">
              {categoryLevel === 3
                ? "Third-level Category Name"
                : "Subcategory Name"}
            </label>
            <input
              type="text"
              value={name}
              disabled={saving}
              onChange={(event) => setName(event.target.value)}
              placeholder={`Enter ${categoryLevel === 3 ? "third-level category" : "subcategory"} name`}
              className="w-full h-[40px] border border-gray-300 focus:outline-none focus:border-blue-500 rounded-sm p-3 text-sm disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="w-[250px] mt-8">
          <Button
            type="submit"
            disabled={saving || loadingCategories}
            className="btn-blue btn-lg w-[350px] !flex !gap-2"
          >
            {saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              <FaCloudUploadAlt className="text-[15px]" />
            )}
            {subCategory ? "Update" : "Add"}{" "}
            {categoryLevel === 3 ? "Third-level Category" : "Subcategory"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default AddSubCategory;
