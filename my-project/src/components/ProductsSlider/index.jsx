import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import ProductItem from "../ProductItem";
import { Navigation } from "swiper/modules";

const ProductsSlider = ({ items = 5, products = [] }) => {
  if (!products.length) return <div className="py-8 text-center text-gray-500">No products available.</div>;
  return <div className="productsSlider py-3"><Swiper slidesPerView={items} spaceBetween={10} navigation modules={[Navigation]} className="mySwiper">
    {products.map((product) => <SwiperSlide key={product._id}><ProductItem product={product} /></SwiperSlide>)}
  </Swiper></div>;
};

export default ProductsSlider;
