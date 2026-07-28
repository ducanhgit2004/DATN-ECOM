import { useContext, useEffect, useState } from "react";
import { Button, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import { MyContext } from "../../App";
import ConfirmDialog from "../../components/ConfirmDialog";
import { deleteData, fetchDataFromApi } from "../../utils/api";

const HomeSliderBanners = () => {
  const context = useContext(MyContext);
  const { alertBox, homeSliderRefreshKey } = context;
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let active = true;
    fetchDataFromApi("/api/home-sliders").then((result) => {
      if (!active) return;
      if (result?.success) setSlides(result.data || []);
      else alertBox("error", result?.message || "Unable to load home sliders.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [alertBox, homeSliderRefreshKey]);

  const openEditor = (slide = null) => context.setIsOpenFullScreenPanel({ open: true, model: slide ? "Edit Home Slide" : "Add Home Slide", slide });
  const remove = async () => {
    setDeleting(deleteTarget._id);
    const result = await deleteData(`/api/home-sliders/${deleteTarget._id}`);
    if (result?.success) {
      setSlides((items) => items.filter((item) => item._id !== deleteTarget._id));
      alertBox("success", "Home slider deleted successfully.");
    } else alertBox("error", result?.message || "Unable to delete the home slider.");
    setDeleting(null);
    setDeleteTarget(null);
  };
  const safePage = Math.min(page, Math.max(0, Math.ceil(slides.length / rowsPerPage) - 1));
  const rows = slides.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

  return <>
    <div className="flex items-center justify-between px-2 mt-3"><h2 className="text-[20px] font-[600]">Home Slider Banners <span className="font-normal text-xs">({slides.length} slides)</span></h2><Button className="btn-blue !text-white" onClick={() => openEditor()}>Add Home Slide</Button></div>
    <div className="card my-4 pt-5 shadow-md rounded-lg border bg-white"><TableContainer sx={{ maxHeight: 600 }}><Table stickyHeader><TableHead><TableRow><TableCell>IMAGE</TableCell><TableCell>TITLE / LINK</TableCell><TableCell width={90}>ORDER</TableCell><TableCell width={100}>STATUS</TableCell><TableCell width={130}>ACTION</TableCell></TableRow></TableHead><TableBody>
      {loading ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 7 }}><CircularProgress /></TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 7 }}>No home sliders found.</TableCell></TableRow> : rows.map((slide) => <TableRow hover key={slide._id}><TableCell><div className="w-[240px] h-[90px] rounded-md overflow-hidden bg-gray-100"><img src={slide.image} alt={slide.title || "Home slider"} className="w-full h-full object-cover" /></div></TableCell><TableCell><div className="font-medium">{slide.title || "Untitled banner"}</div><div className="text-xs text-gray-500 max-w-[360px] truncate">{slide.link || "No destination link"}</div></TableCell><TableCell>{slide.order}</TableCell><TableCell><Chip size="small" color={slide.active ? "success" : "default"} label={slide.active ? "Active" : "Hidden"} /></TableCell><TableCell><div className="flex gap-2"><Button aria-label="Edit slider" onClick={() => openEditor(slide)} className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-gray-100"><AiOutlineEdit className="text-[20px]" /></Button><Button aria-label="Delete slider" disabled={deleting === slide._id} onClick={() => setDeleteTarget(slide)} className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-red-50 !text-red-600">{deleting === slide._id ? <CircularProgress size={18} /> : <GoTrash className="text-[19px]" />}</Button></div></TableCell></TableRow>)}
    </TableBody></Table></TableContainer><TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={slides.length} rowsPerPage={rowsPerPage} page={safePage} onPageChange={(_, value) => setPage(value)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} /></div>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete home slider?" message={`You are about to delete “${deleteTarget?.title || "this banner"}”. This action cannot be undone.`} loading={Boolean(deleting)} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
  </>;
};

export default HomeSliderBanners;
