import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, CircularProgress } from "@mui/material";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { MyContext } from "../../App";
import ConfirmDialog from "../../components/ConfirmDialog";
import { deleteData, fetchDataFromApi } from "../../utils/api";

const SubCategoryList = () => {
  const context = useContext(MyContext);
  const { alertBox, categoryRefreshKey } = context;
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      setLoading(true);
      const result = await fetchDataFromApi("/api/category");
      if (!active) return;
      if (result?.success) setCategories(result.data || []);
      else alertBox("error", result?.message || "Unable to load categories.");
      setLoading(false);
    };
    loadCategories();
    return () => {
      active = false;
    };
  }, [alertBox, categoryRefreshKey]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories
      .filter((category) => !categoryFilter || category._id === categoryFilter)
      .map((category) => {
        const rootMatches = category.name?.toLowerCase().includes(query);
        const children = (category.children || [])
          .map((subCategory) => {
            const subMatches = subCategory.name?.toLowerCase().includes(query);
            const thirdLevel = (subCategory.children || []).filter(
              (item) => !query || item.name?.toLowerCase().includes(query),
            );

            if (!query || rootMatches || subMatches || thirdLevel.length) {
              return {
                ...subCategory,
                children:
                  rootMatches || subMatches
                    ? subCategory.children || []
                    : thirdLevel,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (!query || rootMatches || children.length) {
          return { ...category, children };
        }
        return null;
      })
      .filter(Boolean);
  }, [categories, categoryFilter, search]);

  const toggle = (id) =>
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  const isOpen = (id) => Boolean(search.trim()) || expanded[id];
  const selectableItems = useMemo(() => filteredCategories.flatMap((category) =>
    (category.children || []).flatMap((sub) => [sub, ...(sub.children || [])])), [filteredCategories]);
  const selectableIds = selectableItems.map((item) => item._id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
  const someSelected = selectableIds.some((id) => selectedIds.includes(id)) && !allSelected;
  const toggleOne = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const toggleAll = () => setSelectedIds(allSelected ? [] : selectableIds);
  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    const selectedSet = new Set(selectedIds);
    const idsToDelete = selectedIds.filter((id) => !selectableItems.some((item) => item._id === id && item.parentId && selectedSet.has(String(item.parentId))));
    setBulkDeleting(true);
    const results = await Promise.all(idsToDelete.map((id) => deleteData(`/api/category/${id}`)));
    const successfulRootIds = idsToDelete.filter((_, index) => results[index]?.success);
    setBulkDeleting(false);
    if (successfulRootIds.length) {
      setSelectedIds([]);
      context.setCategoryRefreshKey((key) => key + 1);
      alertBox("success", `${selectedIds.length} selected subcategories deleted successfully.`);
    }
    if (successfulRootIds.length !== idsToDelete.length) alertBox("error", `${idsToDelete.length - successfulRootIds.length} deletion requests failed.`);
    setDeleteDialog(null);
  };

  const openEditor = (item = null, level = 2, parentId = "") =>
    context.setIsOpenFullScreenPanel({
      open: true,
      model: item
        ? level === 3
          ? "Edit Third-level Category"
          : "Edit Subcategory"
        : level === 3
          ? "Add Third-level Category"
          : "Add New Subcategory",
      subCategory: item
        ? { ...item, level, parentId: item.parentId || parentId }
        : null,
      initialParentId: parentId,
    });

  const removeCategory = async (item, level) => {
    setDeletingId(item._id);
    const result = await deleteData(`/api/category/${item._id}`);
    if (result?.success) {
      setSelectedIds((ids) => ids.filter((id) => id !== item._id));
      context.setCategoryRefreshKey((key) => key + 1);
      alertBox(
        "success",
        `${level === 3 ? "Third-level category" : "Subcategory"} deleted successfully.`,
      );
    } else {
      alertBox("error", result?.message || "Unable to delete the category.");
    }
    setDeletingId(null);
    setDeleteDialog(null);
  };

  const actionButtons = (item, level, parentId) => (
    <div className="flex items-center gap-1">
      {level === 2 && (
        <Button
          title="Add third-level category"
          aria-label={`Add a category inside ${item.name}`}
          onClick={() => openEditor(null, 3, item._id)}
          className="!w-[32px] !h-[32px] !min-w-[32px] !rounded-full !bg-blue-50 !text-blue-600"
        >
          <IoMdAdd className="text-[19px]" />
        </Button>
      )}
      <Button
        title="Edit"
        aria-label={`Edit ${item.name}`}
        onClick={() => openEditor(item, level, parentId)}
        className="!w-[32px] !h-[32px] !min-w-[32px] !rounded-full !bg-gray-100"
      >
        <AiOutlineEdit className="text-[18px]" />
      </Button>
      <Button
        disabled={deletingId === item._id}
        title="Delete"
        aria-label={`Delete ${item.name}`}
        onClick={() => setDeleteDialog({ type: "single", item, level })}
        className="!w-[32px] !h-[32px] !min-w-[32px] !rounded-full !bg-red-50 !text-red-600"
      >
        {deletingId === item._id ? (
          <CircularProgress size={16} />
        ) : (
          <GoTrash className="text-[17px]" />
        )}
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between px-2 mt-3 gap-4">
        <h2 className="text-[20px] font-[600]">Subcategory</h2>
        <div className="flex flex-wrap gap-3">
          {selectedIds.length > 0 && <Button color="error" variant="contained" disabled={bulkDeleting} onClick={() => setDeleteDialog({ type: "bulk" })}>{bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}</Button>}
          <Button className="btn-blue !text-white" onClick={() => openEditor()}>
            Add Subcategory
          </Button>
          <Button
            className="btn-blue !text-white"
            onClick={() => openEditor(null, 3)}
          >
            Add Third-level Category
          </Button>
        </div>
      </div>

      <div className="card my-4 p-5 shadow-md rounded-lg border border-gray-200 bg-white">
        <div className="pb-5 flex flex-col md:flex-row gap-3">
          <div className="flex items-center"><Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} inputProps={{ "aria-label": "Select all visible subcategories" }} /><span className="text-sm whitespace-nowrap">Select all</span></div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            className="w-full md:max-w-[420px] h-[40px] border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="w-full md:max-w-[260px] h-[40px] border border-gray-300 rounded px-3 text-sm bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option value={category._id} key={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <CircularProgress />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No categories found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="overflow-hidden rounded-lg border border-gray-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(category._id)}
                  className="w-full flex items-center gap-3 bg-gray-50 px-4 py-3 text-left hover:bg-gray-100"
                >
                  {isOpen(category._id) ? (
                    <IoIosArrowDown />
                  ) : (
                    <IoIosArrowForward />
                  )}
                  <img
                    src={category.images?.[0] || "/placeholder-image.png"}
                    alt={category.name}
                    className="w-10 h-10 rounded object-cover bg-gray-200"
                  />
                  <span className="font-[600] flex-1">{category.name}</span>
                  <span className="text-xs text-gray-500">
                    {(category.children || []).length} subcategories
                  </span>
                </button>

                {isOpen(category._id) && (
                  <div className="bg-white px-4 py-2">
                    {(category.children || []).length === 0 ? (
                      <div className="py-4 pl-10 text-sm text-gray-400">
                        No subcategories.
                      </div>
                    ) : (
                      category.children.map((subCategory) => (
                        <div
                          key={subCategory._id}
                          className="ml-5 border-l-2 border-blue-100"
                        >
                          <div className="flex items-center gap-2 py-2 pl-4">
                            <Checkbox size="small" checked={selectedIds.includes(subCategory._id)} onChange={() => toggleOne(subCategory._id)} inputProps={{ "aria-label": `Select ${subCategory.name}` }} />
                            <button
                              type="button"
                              onClick={() => toggle(subCategory._id)}
                              className="p-1 text-gray-500"
                              aria-label={`Toggle ${subCategory.name}`}
                            >
                              {isOpen(subCategory._id) ? (
                                <IoIosArrowDown />
                              ) : (
                                <IoIosArrowForward />
                              )}
                            </button>
                            <span className="rounded bg-blue-50 px-2 py-1 text-xs font-[600] text-blue-700">
                              Subcategory
                            </span>
                            <span className="font-[500] flex-1">
                              {subCategory.name}
                            </span>
                            {actionButtons(subCategory, 2, category._id)}
                          </div>

                          {isOpen(subCategory._id) && (
                            <div className="ml-9 mb-2 border-l-2 border-purple-100">
                              {(subCategory.children || []).length === 0 ? (
                                <div className="py-2 pl-5 text-sm text-gray-400">
                                  No third-level categories.
                                </div>
                              ) : (
                                subCategory.children.map((item) => (
                                  <div
                                    key={item._id}
                                    className="flex items-center gap-2 py-2 pl-5 border-b border-gray-50 last:border-0"
                                  >
                                    <Checkbox size="small" checked={selectedIds.includes(item._id)} onChange={() => toggleOne(item._id)} inputProps={{ "aria-label": `Select ${item.name}` }} />
                                    <span className="rounded bg-purple-50 px-2 py-1 text-xs font-[600] text-purple-700">
                                      Third level
                                    </span>
                                    <span className="flex-1 text-sm">
                                      {item.name}
                                    </span>
                                    {actionButtons(item, 3, subCategory._id)}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(deleteDialog)}
        title={deleteDialog?.type === "bulk" ? "Delete selected categories?" : `Delete ${deleteDialog?.level === 3 ? "third-level category" : "subcategory"}?`}
        message={deleteDialog?.type === "bulk" ? `You are about to delete ${selectedIds.length} selected subcategories. Their nested categories will also be deleted. This action cannot be undone.` : `You are about to delete “${deleteDialog?.item?.name || "this category"}”. Any nested categories will also be deleted. This action cannot be undone.`}
        loading={bulkDeleting || Boolean(deletingId)}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteDialog?.type === "bulk" ? deleteSelected() : removeCategory(deleteDialog.item, deleteDialog.level)}
      />
    </>
  );
};

export default SubCategoryList;
