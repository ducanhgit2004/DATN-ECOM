import { useContext, useEffect, useState } from "react";
import { Button, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import { MyContext } from "../../App";
import ConfirmDialog from "../../components/ConfirmDialog";
import { deleteData, fetchDataFromApi } from "../../utils/api";

const Blogs = () => {
  const context = useContext(MyContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  useEffect(() => { let active = true; fetchDataFromApi("/api/blogs").then((result) => { if (!active) return; setItems(result?.success ? result.data || [] : []); setLoading(false); }); return () => { active = false; }; }, [context.blogRefreshKey]);
  const openEditor = (blog = null) => context.setIsOpenFullScreenPanel({ open: true, model: blog ? "Edit Blog Post" : "Add Blog Post", blog });
  const remove = async () => { const result = await deleteData(`/api/blogs/${target._id}`); if (result?.success) { setItems((current) => current.filter((item) => item._id !== target._id)); context.alertBox("success", result.message || "Blog post deleted successfully."); } else context.alertBox("error", result?.message || "Unable to delete the blog post."); setTarget(null); };
  return <><div className="flex items-center justify-between px-2 mt-3"><h2 className="text-[20px] font-[600]">Blog Posts <span className="font-normal text-xs">({items.length})</span></h2><Button className="btn-blue !text-white" onClick={() => openEditor()}>Add Blog Post</Button></div>
    <div className="card my-4 pt-5 shadow-md rounded-lg border bg-white"><TableContainer><Table><TableHead><TableRow><TableCell>IMAGE</TableCell><TableCell>CONTENT</TableCell><TableCell>PUBLISH DATE</TableCell><TableCell>ORDER</TableCell><TableCell>STATUS</TableCell><TableCell>ACTION</TableCell></TableRow></TableHead><TableBody>{loading ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 7 }}><CircularProgress /></TableCell></TableRow> : !items.length ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 7 }}>No blog posts found.</TableCell></TableRow> : items.map((blog) => <TableRow key={blog._id}><TableCell><div className="w-[180px] h-[105px] rounded overflow-hidden"><img src={blog.image} alt={blog.title} className="w-full h-full object-cover" /></div></TableCell><TableCell><div className="font-medium max-w-[420px]">{blog.title}</div><div className="text-xs text-gray-500 max-w-[420px] truncate">{blog.excerpt}</div></TableCell><TableCell>{new Date(blog.publishedAt).toLocaleDateString("en-GB")}</TableCell><TableCell>{blog.order}</TableCell><TableCell><Chip size="small" color={blog.active ? "success" : "default"} label={blog.active ? "Published" : "Draft"} /></TableCell><TableCell><div className="flex gap-2"><Button aria-label="Edit blog post" onClick={() => openEditor(blog)} className="!min-w-[35px] !w-[35px] !rounded-full"><AiOutlineEdit /></Button><Button aria-label="Delete blog post" onClick={() => setTarget(blog)} className="!min-w-[35px] !w-[35px] !rounded-full !text-red-600"><GoTrash /></Button></div></TableCell></TableRow>)}</TableBody></Table></TableContainer></div>
    <ConfirmDialog open={Boolean(target)} title="Delete blog post?" message={`You are about to delete “${target?.title || "this blog post"}”. This action cannot be undone.`} onClose={() => setTarget(null)} onConfirm={remove} />
  </>;
};

export default Blogs;
