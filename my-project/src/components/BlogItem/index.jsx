import { IoMdTime } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";

const formatDate = (value) => new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date(value)).toUpperCase();

const BlogItem = ({ blog }) => {
  const destination = `/blog/${blog._id}`;
  return <article className="blogItem group h-full">
    <Link to={destination} className="imgWrapper block w-full aspect-[1.55/1] overflow-hidden rounded-md relative bg-gray-100">
      <img src={blog.image} className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" alt={blog.title} loading="lazy" />
      <span className="flex items-center justify-center text-white absolute bottom-[15px] right-[15px] z-10 bg-[#ff5252] rounded-md px-2 py-1 text-[11px] font-[600] gap-1"><IoMdTime className="text-[16px]" />{formatDate(blog.publishedAt)}</span>
    </Link>
    <div className="info py-4">
      <h3 className="text-[15px] font-[600] text-black line-clamp-2 min-h-[45px]"><Link className="link" to={destination}>{blog.title}</Link></h3>
      <p className="text-[13px] leading-7 font-[400] text-[rgba(0,0,0,0.65)] mb-3 line-clamp-2">{blog.excerpt}</p>
      <Link to={destination} className="link font-[500] text-[14px] flex items-center gap-1">Read More<IoIosArrowForward /></Link>
    </div>
  </article>;
};

export default BlogItem;
