import { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import { Navigation } from "swiper/modules";
import { MyContext } from "../../App";

const HomeCatSlider = () => {
  const { catData } = useContext(MyContext);
  if (!catData.length) return null;
  return <div className="homeCatSlider py-8"><div className="container py-2"><Swiper slidesPerView={Math.min(8, catData.length)} spaceBetween={10} navigation modules={[Navigation]}>
    {catData.map((category) => <SwiperSlide key={category._id}><Link to={`/productListing?category=${category._id}`}><div className="item py-7 px-3 bg-white rounded-sm text-center flex items-center justify-center flex-col">
      <img src={category.images?.[0] || "/placeholder-image.png"} alt={category.name} className="w-[90px] h-[90px] object-cover transition-all rounded-full" />
      <h3 className="text-[16px] font-[500] mt-3">{category.name}</h3>
    </div></Link></SwiperSlide>)}
  </Swiper></div></div>;
};

export default HomeCatSlider;
