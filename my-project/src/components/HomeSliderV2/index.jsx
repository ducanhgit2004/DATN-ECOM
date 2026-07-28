import { useContext } from "react";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { MyContext } from "../../App";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const HomeBannerV2 = () => {
  const { products } = useContext(MyContext);
  const banners = products.filter(
    (product) => product.bannerEnabled && product.bannerImage,
  );

  if (!banners.length) return null;

  return (
    <Swiper
      loop={banners.length > 1}
      spaceBetween={30}
      effect="fade"
      navigation={banners.length > 1}
      pagination={banners.length > 1 ? { clickable: true } : false}
      autoplay={banners.length > 1 ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
      modules={[EffectFade, Navigation, Pagination, Autoplay]}
      className="homeSliderV2"
    >
      {banners.map((product) => (
        <SwiperSlide key={product._id}>
          <div className="item w-full aspect-[2/1] max-h-[520px] min-h-[260px] rounded-md overflow-hidden relative bg-gray-100">
            <img src={product.bannerImage} alt={product.bannerTitle || product.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-white/35" />
            <div className="info absolute -right-[100%] opacity-0 top-0 w-[52%] h-full z-10 px-5 sm:px-8 flex items-start flex-col justify-center transition-all duration-700">
              <h4 className="text-[13px] sm:text-[18px] font-[500] w-full text-left mb-2 sm:mb-3 relative -right-[100%] opacity-0">
                {product.bannerSubtitle || product.brand || "Featured Product"}
              </h4>
              <h2 className="text-[20px] sm:text-[28px] lg:text-[35px] font-[650] w-full relative -right-[100%] opacity-0 line-clamp-2">
                {product.bannerTitle || product.name}
              </h2>
              <h3 className="flex flex-wrap items-center gap-2 sm:gap-3 text-[13px] sm:text-[18px] font-[500] w-full text-left mt-2 sm:mt-3 mb-3 relative -right-[100%] opacity-0">
                {product.bannerPriceLabel || "Starting at"}
                <span className="text-[#ff5252] text-[18px] sm:text-[25px] lg:text-[30px] font-[700]">
                  {product.bannerPriceText || formatPrice(product.price)}
                </span>
              </h3>
              <div className="w-full relative -right-[100%] opacity-0 btn_">
                <Button component={Link} to={`/product/${product._id}`} className="btn-org">
                  {product.bannerButtonText || "SHOP NOW"}
                </Button>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HomeBannerV2;
