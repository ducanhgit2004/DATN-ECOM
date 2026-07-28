import { useContext, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import { MyContext } from "../../App";
import { deleteData, fetchDataFromApi } from "../../utils/api";
import ConfirmDialog from "../../components/ConfirmDialog";

const Products = ({ seller = null }) => {
  const context = useContext(MyContext);
  const { alertBox, catData, productRefreshKey, setIsOpenFullScreenPanel } =
    context;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [thirdCategory, setThirdCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchDataFromApi(
        seller?._id
          ? `/api/user/admin/sellers/${seller._id}/products`
          : "/api/product/getAllProducts?perPage=10000&page=1",
      );
      if (!active) return;
      if (result?.success)
        setProducts(
          seller?._id ? result.data?.products || [] : result.products || [],
        );
      else
        alertBox("error", result?.message || "Products could not be loaded.");
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [alertBox, productRefreshKey, seller?._id]);

  const selectedCategory = useMemo(
    () => catData?.find((item) => item._id === category),
    [catData, category],
  );
  const allSubCategories = useMemo(
    () => (catData || []).flatMap((parent) =>
      (parent.children || []).map((item) => ({ ...item, parentCategoryId: parent._id })),
    ),
    [catData],
  );
  const subCategories = category ? selectedCategory?.children || [] : allSubCategories;
  const selectedSubCategory = useMemo(
    () => allSubCategories.find((item) => item._id === subCategory),
    [allSubCategories, subCategory],
  );
  const allThirdCategories = useMemo(
    () => allSubCategories.flatMap((parent) =>
      (parent.children || []).map((item) => ({
        ...item,
        parentSubCategoryId: parent._id,
        parentCategoryId: parent.parentCategoryId,
      })),
    ),
    [allSubCategories],
  );
  const thirdCategories = subCategory
    ? selectedSubCategory?.children || []
    : category
      ? (selectedCategory?.children || []).flatMap((item) => item.children || [])
      : allThirdCategories;

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const term = search.trim().toLowerCase();
        return (
          (!category || product.catId === category) &&
          (!subCategory || product.subCatId === subCategory) &&
          (!thirdCategory || product.thirdsubCatId === thirdCategory) &&
          (!term ||
            product.name?.toLowerCase().includes(term) ||
            product.brand?.toLowerCase().includes(term))
        );
      }),
    [products, category, subCategory, thirdCategory, search],
  );

  const removeProduct = async (product) => {
    setBulkDeleting(true);
    const result = await deleteData(`/api/product/${product._id}`);
    if (result?.error || !result?.success) {
      alertBox("error", result?.message || "Product could not be deleted.");
      setBulkDeleting(false);
      return;
    }
    alertBox("success", "Product deleted successfully.");
    setProducts((items) => items.filter((item) => item._id !== product._id));
    setSelectedIds((ids) => ids.filter((id) => id !== product._id));
    setBulkDeleting(false);
    setDeleteDialog(null);
  };

  const openForm = (product) =>
    setIsOpenFullScreenPanel({
      open: true,
      model: product ? "Edit Product" : "Add Product",
      product,
    });
  const viewProduct = (product) => setIsOpenFullScreenPanel({ open: true, model: "Product Details", product });
  const visible = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  const visibleIds = visible.map((item) => item._id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;
  const toggleOne = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const toggleVisible = () => setSelectedIds((ids) => allVisibleSelected ? ids.filter((id) => !visibleIds.includes(id)) : [...new Set([...ids, ...visibleIds])]);
  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    setBulkDeleting(true);
    const results = await Promise.all(selectedIds.map((id) => deleteData(`/api/product/${id}`)));
    const deletedIds = selectedIds.filter((_, index) => results[index]?.success);
    setProducts((items) => items.filter((item) => !deletedIds.includes(item._id)));
    setSelectedIds((ids) => ids.filter((id) => !deletedIds.includes(id)));
    setBulkDeleting(false);
    if (deletedIds.length) alertBox("success", `${deletedIds.length} products deleted successfully.`);
    if (deletedIds.length !== results.length) alertBox("error", `${results.length - deletedIds.length} products could not be deleted.`);
    setDeleteDialog(null);
  };

  return (
    <>
      <div className="flex items-center justify-between px-2 mt-3">
        <h2 className="text-[20px] font-[600]">
          {seller ? `${seller.storeName} products` : "Products"}{" "}
          <span className="font-[400] text-[12px]">({filtered.length})</span>
        </h2>
        <div className="flex gap-2">{selectedIds.length > 0 && <Button color="error" variant="contained" disabled={bulkDeleting} onClick={() => setDeleteDialog({ type: "bulk" })}>{bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}</Button>}{!seller && <Button className="btn-blue !text-white" onClick={() => openForm()}>
          <IoMdAdd className="mr-1" />
          Add Product
        </Button>}</div>
      </div>
      <div className="card my-4 pt-5 shadow-md rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
          <div className="flex min-w-[220px] flex-col gap-1">
            <label className="text-[13px] font-[600] text-gray-700">Category</label>
            <Select
            size="small"
            className="w-full"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubCategory("");
              setThirdCategory("");
              setPage(0);
            }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {catData?.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
          </div>
          <div className="flex min-w-[220px] flex-col gap-1">
            <label className="text-[13px] font-[600] text-gray-700">Subcategory</label>
            <Select
            size="small"
            className="w-full"
            value={subCategory}
            onChange={(e) => {
              const nextId = e.target.value;
              const nextSubCategory = allSubCategories.find((item) => item._id === nextId);
              setSubCategory(nextId);
              if (nextSubCategory) setCategory(nextSubCategory.parentCategoryId);
              setThirdCategory("");
              setPage(0);
            }}
          >
            <MenuItem value="">All Subcategories</MenuItem>
            {subCategories.map((item) => (
              <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
            ))}
          </Select>
          </div>
          <div className="flex min-w-[220px] flex-col gap-1">
            <label className="text-[13px] font-[600] text-gray-700">Third-level Category</label>
            <Select
            size="small"
            className="w-full"
            value={thirdCategory}
            onChange={(e) => {
              const nextId = e.target.value;
              const nextThirdCategory = allThirdCategories.find((item) => item._id === nextId);
              setThirdCategory(nextId);
              if (nextThirdCategory) {
                setCategory(nextThirdCategory.parentCategoryId);
                setSubCategory(nextThirdCategory.parentSubCategoryId);
              }
              setPage(0);
            }}
          >
            <MenuItem value="">All Third-level Categories</MenuItem>
            {thirdCategories.map((item) => (
              <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
            ))}
          </Select>
          </div>
          {(category || subCategory || thirdCategory) && (
            <Button
              variant="outlined"
              onClick={() => {
                setCategory("");
                setSubCategory("");
                setThirdCategory("");
                setPage(0);
              }}
            >
              Clear Filters
            </Button>
          )}
          <div className="flex min-w-[260px] flex-1 flex-col gap-1 xl:ml-auto">
            <label className="text-[13px] font-[600] text-gray-700">Search Product</label>
            <input className="h-[40px] w-full border border-gray-300 rounded-md px-3" placeholder="Search by name or brand" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox checked={allVisibleSelected} indeterminate={someVisibleSelected} onChange={toggleVisible} inputProps={{ "aria-label": "Select all visible products" }} /></TableCell>
                <TableCell>PRODUCT</TableCell>
                <TableCell>CATEGORY</TableCell>
                <TableCell>SUBCATEGORY</TableCell>
                <TableCell>PRICE</TableCell>
                <TableCell>STOCK</TableCell>
                <TableCell>FEATURED</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((product) => (
                  <TableRow key={product._id} hover>
                    <TableCell padding="checkbox"><Checkbox checked={selectedIds.includes(product._id)} onChange={() => toggleOne(product._id)} inputProps={{ "aria-label": `Select ${product.name}` }} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[280px]">
                        <img
                          src={product.images?.[0] || "/Sample_User_Icon.png"}
                          alt={product.name}
                          className="w-[60px] h-[60px] rounded-md object-cover"
                        />
                        <div>
                          <p className="font-[600] text-[13px] line-clamp-2">
                            {product.name}
                          </p>
                          <span className="text-[12px] text-gray-500">
                            {product.brand || "No brand"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.catName || "-"}</TableCell>
                    <TableCell>
                      {product.subCatName || product.subCat || "-"}
                    </TableCell>
                    <TableCell>
                      <div>
                        {product.oldPrice > 0 && (
                          <span className="block line-through text-gray-500 text-[12px]">
                            ${Number(product.oldPrice).toFixed(2)}
                          </span>
                        )}
                        <span className="text-blue-600 font-[600]">
                          ${Number(product.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{product.countInStock}</TableCell>
                    <TableCell>{product.isFeatured ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          aria-label="View product details"
                          title="View details"
                          className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full"
                          onClick={() => viewProduct(product)}
                        >
                          <FaRegEye size={18} />
                        </Button>
                        <Button
                          aria-label="Edit product"
                          className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full"
                          onClick={() => openForm(product)}
                        >
                          <AiOutlineEdit size={20} />
                        </Button>
                        <Button
                          aria-label="Delete product"
                          color="error"
                          className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full"
                          onClick={() => setDeleteDialog({ type: "single", product })}
                        >
                          <GoTrash size={19} />
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
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_, value) => setPage(value)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
        />
      </div>
      <ConfirmDialog
        open={Boolean(deleteDialog)}
        title={deleteDialog?.type === "bulk" ? "Delete selected products?" : "Delete product?"}
        message={deleteDialog?.type === "bulk" ? `You are about to delete ${selectedIds.length} selected products. This action cannot be undone.` : `You are about to delete “${deleteDialog?.product?.name || "this product"}”. This action cannot be undone.`}
        loading={bulkDeleting}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteDialog?.type === "bulk" ? deleteSelected() : removeProduct(deleteDialog.product)}
      />
    </>
  );
};

export default Products;
