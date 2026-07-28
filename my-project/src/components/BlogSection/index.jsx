import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import BlogItem from "../BlogItem";
import { fetchDataFromApi } from "../../utils/api";

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => { let active = true; fetchDataFromApi("/api/blogs?active=true").then((result) => { if (active && result?.success) setBlogs(result.data || []); }); return () => { active = false; }; }, []);
  if (!blogs.length) return null;
  return <section className="py-5 pb-8 pt-0 bg-white blogSection">
    <div className="container">
      <h2 className="text-[20px] font-[600] mb-4">From The Blog</h2>
      <Swiper slidesPerView={1} spaceBetween={20} navigation={blogs.length > 1} modules={[Navigation]} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }} className="blogSlider">
        {blogs.map((blog) => <SwiperSlide key={blog._id} className="h-auto"><BlogItem blog={blog} /></SwiperSlide>)}
      </Swiper>
    </div>
  </section>;
};

export default BlogSection;
