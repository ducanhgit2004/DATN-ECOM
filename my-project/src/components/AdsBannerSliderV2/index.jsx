import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import BannerBoxV2 from "../bannerBoxV2";
import { fetchDataFromApi } from "../../utils/api";

const AdsBannerSliderV2 = ({ items = 4 }) => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    let active = true;
    fetchDataFromApi("/api/category-banners?active=true&placement=category-slider").then((result) => {
      if (active && result?.success) setBanners(result.data || []);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!banners.length) return null;

  return (
    <div className="py-5 w-full">
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        navigation={banners.length > 1}
        modules={[Navigation]}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: items },
        }}
        className="smlBtn"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id}>
            <BannerBoxV2
              info={banner.textAlign}
              image={banner.image}
              subtitle={banner.subtitle}
              title={banner.title || banner.categoryId?.name}
              buttonText={banner.buttonText || "BUY NOW"}
              link={`/productListing?category=${banner.categoryId?._id || banner.categoryId}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AdsBannerSliderV2;
