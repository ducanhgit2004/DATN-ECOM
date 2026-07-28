import { useContext, useEffect, useState } from "react";
import { Button, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import { MyContext } from "../../App";
import ConfirmDialog from "../../components/ConfirmDialog";
import { deleteData, fetchDataFromApi } from "../../utils/api";

const CategoryBanners = () => {
  const context = useContext(MyContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const placementLabel = {
    "hero-side": "Beside main slider",
    "category-slider": "Lower category slider",
    "latest-products": "After Latest Products",
    "featured-products": "After Featured Products",
  };

  useEffect(() => {
    let active = true;
    fetchDataFromApi("/api/category-banners").then((result) => {
      if (!active) return;
      if (result?.success) setItems(result.data || []);
      else context.alertBox("error", result?.message || "Unable to load banners.");
      setLoading(false);
    });
    return () => { active = false; };
    // The refresh key intentionally controls when this list reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.categoryBannerRefreshKey]);

  const openEditor = (banner = null) => context.setIsOpenFullScreenPanel({
    open: true,
    model: banner ? "Edit Category Banner" : "Add Category Banner",
    banner,
  });

  const remove = async () => {
    const result = await deleteData(`/api/category-banners/${target._id}`);
    if (result?.success) {
      setItems((current) => current.filter((item) => item._id !== target._id));
      context.alertBox("success", "Category banner deleted.");
    } else context.alertBox("error", result?.message || "Unable to delete banner.");
    setTarget(null);
  };

  return <>
    <div className="flex items-center justify-between px-2 mt-3">
      <h2 className="text-[20px] font-[600]">Category Banners <span className="font-normal text-xs">({items.length})</span></h2>
      <Button className="btn-blue !text-white" onClick={() => openEditor()}>Add Category Banner</Button>
    </div>
    <div className="card my-4 pt-5 shadow-md rounded-lg border bg-white">
      <TableContainer><Table>
        <TableHead><TableRow><TableCell>IMAGE</TableCell><TableCell>CONTENT</TableCell><TableCell>POSITION</TableCell><TableCell>CATEGORY</TableCell><TableCell>ALIGN</TableCell><TableCell>ORDER</TableCell><TableCell>STATUS</TableCell><TableCell>ACTION</TableCell></TableRow></TableHead>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={8} align="center" sx={{ py: 7 }}><CircularProgress /></TableCell></TableRow>
            : !items.length ? <TableRow><TableCell colSpan={8} align="center" sx={{ py: 7 }}>No category banners found.</TableCell></TableRow>
              : items.map((banner) => <TableRow key={banner._id}>
                <TableCell><div className="w-[180px] h-[100px] rounded overflow-hidden"><img src={banner.image} alt={banner.title} className="w-full h-full object-cover" /></div></TableCell>
                <TableCell><div className="font-medium">{banner.title || banner.categoryId?.name}</div><div className="text-xs text-gray-500">{banner.subtitle}</div></TableCell>
                <TableCell>{placementLabel[banner.placement] || "Lower category slider"}</TableCell>
                <TableCell>{banner.categoryId?.name || "Deleted category"}</TableCell>
                <TableCell className="capitalize">{banner.textAlign}</TableCell>
                <TableCell>{banner.order}</TableCell>
                <TableCell><Chip size="small" color={banner.active ? "success" : "default"} label={banner.active ? "Active" : "Hidden"} /></TableCell>
                <TableCell><div className="flex gap-2"><Button aria-label="Edit banner" onClick={() => openEditor(banner)} className="!min-w-[35px] !w-[35px] !rounded-full"><AiOutlineEdit /></Button><Button aria-label="Delete banner" onClick={() => setTarget(banner)} className="!min-w-[35px] !w-[35px] !rounded-full !text-red-600"><GoTrash /></Button></div></TableCell>
              </TableRow>)}
        </TableBody>
      </Table></TableContainer>
    </div>
    <ConfirmDialog open={Boolean(target)} title="Delete category banner?" message={`Delete “${target?.title || "this banner"}”?`} onClose={() => setTarget(null)} onConfirm={remove} />
  </>;
};

export default CategoryBanners;
