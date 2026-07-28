import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import BannerBox from "../BannerBox";
import { fetchDataFromApi } from "../../utils/api";

const fallbackBanners = [
  { _id: "fallback-1", image: "/adidasbanner.jpg", link: "/" },
  { _id: "fallback-2", image: "/adidasbanner.jpg", link: "/" },
  { _id: "fallback-3", image: "/bannernho.jpg", link: "/" },
];

const AdsBannerSlider = ({ items = 3, placement }) => {
  const [banners, setBanners] = useState([]);
  const [configured, setConfigured] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchDataFromApi(
      `/api/category-banners?placement=${placement}`,
    ).then((result) => {
      if (!active) return;
      const records = result?.success ? result.data || [] : [];
      setConfigured(records.length > 0);
      setBanners(records.filter((banner) => banner.active));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [placement]);

  if (!loaded) return null;
  const visibleBanners = configured ? banners : fallbackBanners;
  if (!visibleBanners.length) return null;

  return (
    <div className="py-5 w-full">
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        navigation={visibleBanners.length > 1}
        modules={[Navigation]}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: items },
        }}
        className="smlBtn"
      >
        {visibleBanners.map((banner) => (
          <SwiperSlide key={banner._id}>
            <BannerBox
              img={banner.image}
              link={
                banner.link ||
                `/productListing?category=${
                  banner.categoryId?._id || banner.categoryId
                }`
              }
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AdsBannerSlider;
