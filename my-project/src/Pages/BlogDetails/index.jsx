import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IoMdTime } from "react-icons/io";
import { fetchDataFromApi } from "../../utils/api";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; fetchDataFromApi(`/api/blogs/${id}`).then((result) => { if (active) { setBlog(result?.success ? result.data : null); setLoading(false); } }); return () => { active = false; }; }, [id]);
  if (loading) return <main className="container py-16 min-h-[500px]"><div className="h-10 w-2/3 bg-gray-100 animate-pulse rounded" /></main>;
  if (!blog) return <main className="container py-20 min-h-[500px] text-center"><h1 className="text-2xl font-semibold">Blog post not found</h1><Link to="/" className="inline-block mt-5 text-[#ff5252] font-semibold">Return to home</Link></main>;
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(blog.publishedAt));
  return <main className="bg-white py-10 md:py-14">
    <article className="container max-w-[1000px]">
      <Link to="/" className="text-sm text-gray-500 hover:text-[#ff5252]">Home / Blog</Link>
      <h1 className="mt-5 text-[30px] md:text-[42px] leading-tight font-[700] text-gray-900">{blog.title}</h1>
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><IoMdTime className="text-lg text-[#ff5252]" />{date}</div>
      <img src={blog.image} alt={blog.title} className="mt-8 w-full max-h-[580px] object-cover rounded-xl" />
      <p className="mt-8 text-[18px] leading-8 font-medium text-gray-700">{blog.excerpt}</p>
      <div className="mt-6 text-[16px] leading-8 text-gray-700 whitespace-pre-line">{blog.content}</div>
    </article>
  </main>;
};

export default BlogDetails;
