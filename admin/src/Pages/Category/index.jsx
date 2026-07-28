import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, CircularProgress } from "@mui/material";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { MyContext } from "../../App";
import ConfirmDialog from "../../components/ConfirmDialog";
import { deleteData, fetchDataFromApi } from "../../utils/api";

const CategoryList = () => {
  const context = useContext(MyContext);
  const { alertBox, categoryRefreshKey } = context;
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
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
      else
        alertBox(
          "error",
          result?.message || "Không thể tải danh sách danh mục",
        );
      setLoading(false);
    };
    loadCategories();
    return () => {
      active = false;
    };
  }, [alertBox, categoryRefreshKey]);

  const filtered = useMemo(
    () =>
      categories.filter((item) =>
        item.name?.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [categories, search],
  );
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1),
  );
  const visibleRows = filtered.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage,
  );
  const visibleIds = visibleRows.map((item) => item._id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;
  const toggleOne = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const toggleVisible = () => setSelectedIds((ids) => allVisibleSelected ? ids.filter((id) => !visibleIds.includes(id)) : [...new Set([...ids, ...visibleIds])]);
  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    setBulkDeleting(true);
    const results = await Promise.all(selectedIds.map((id) => deleteData(`/api/category/${id}`)));
    const deletedIds = selectedIds.filter((_, index) => results[index]?.success);
    setCategories((items) => items.filter((item) => !deletedIds.includes(item._id)));
    setSelectedIds((ids) => ids.filter((id) => !deletedIds.includes(id)));
    setBulkDeleting(false);
    if (deletedIds.length) alertBox("success", `${deletedIds.length} categories deleted successfully.`);
    if (deletedIds.length !== results.length) alertBox("error", `${results.length - deletedIds.length} categories could not be deleted.`);
    if (deletedIds.length) context.setCategoryRefreshKey((key) => key + 1);
    setDeleteDialog(null);
  };

  const removeCategory = async (category) => {
    setDeletingId(category._id);
    const result = await deleteData(`/api/category/${category._id}`);
    if (result?.success) {
      setCategories((items) =>
        items.filter((item) => item._id !== category._id),
      );
      setSelectedIds((ids) => ids.filter((id) => id !== category._id));
      context.alertBox("success", "Deleted");
    } else context.alertBox("error", result?.message || "Delete Failed");
    setDeletingId(null);
    setDeleteDialog(null);
  };

  const openEditor = (category = null) =>
    context.setIsOpenFullScreenPanel({
      open: true,
      model: category ? "Edit Category" : "Add New Category",
      category,
    });

  return (
    <>
      <div className="flex items-center justify-between px-2 mt-3 gap-4">
        <h2 className="text-[20px] font-[600]">
          Category List{" "}
          <span className="font-[400] text-[12px]">
            ({filtered.length} categories)
          </span>
        </h2>
        <div className="flex gap-2">{selectedIds.length > 0 && <Button color="error" variant="contained" disabled={bulkDeleting} onClick={() => setDeleteDialog({ type: "bulk" })}>{bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}</Button>}<Button className="btn-blue !text-white" onClick={() => openEditor()}>
          Add New Category
        </Button></div>
      </div>
      <div className="card my-4 pt-5 shadow-md rounded-lg border border-gray-200 bg-white">
        <div className="px-5 pb-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search...."
            className="w-full max-w-[420px] h-[40px] border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="category table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox checked={allVisibleSelected} indeterminate={someVisibleSelected} onChange={toggleVisible} inputProps={{ "aria-label": "Select all visible categories" }} /></TableCell>
                <TableCell width={130}>IMAGE</TableCell>
                <TableCell>CATEGORY NAME</TableCell>
                <TableCell width={150}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    There is 0 category
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((category) => (
                  <TableRow hover key={category._id}>
                    <TableCell padding="checkbox"><Checkbox checked={selectedIds.includes(category._id)} onChange={() => toggleOne(category._id)} inputProps={{ "aria-label": `Select ${category.name}` }} /></TableCell>
                    <TableCell>
                      <div className="w-[72px] h-[72px] rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={category.images?.[0] || "/placeholder-image.png"}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-[500]">{category.name}</span>
                      {category.children?.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({category.children.length} subcategories)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          title="Chỉnh sửa"
                          aria-label={`Chỉnh sửa ${category.name}`}
                          onClick={() => openEditor(category)}
                          className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-gray-100"
                        >
                          <AiOutlineEdit className="text-[20px]" />
                        </Button>
                        <Button
                          disabled={deletingId === category._id}
                          title="Xóa"
                          aria-label={`Xóa ${category.name}`}
                          onClick={() => setDeleteDialog({ type: "single", category })}
                          className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-red-50 !text-red-600"
                        >
                          {deletingId === category._id ? (
                            <CircularProgress size={18} />
                          ) : (
                            <GoTrash className="text-[19px]" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={safePage}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </div>
      <ConfirmDialog
        open={Boolean(deleteDialog)}
        title={deleteDialog?.type === "bulk" ? "Delete selected categories?" : "Delete category?"}
        message={deleteDialog?.type === "bulk" ? `You are about to delete ${selectedIds.length} selected categories and their nested categories. This action cannot be undone.` : `You are about to delete “${deleteDialog?.category?.name || "this category"}” and all of its nested categories. This action cannot be undone.`}
        loading={bulkDeleting || Boolean(deletingId)}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteDialog?.type === "bulk" ? deleteSelected() : removeCategory(deleteDialog.category)}
      />
    </>
  );
};

export default CategoryList;
