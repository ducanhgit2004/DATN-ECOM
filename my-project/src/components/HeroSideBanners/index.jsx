import { useEffect, useState } from "react";
import { fetchDataFromApi } from "../../utils/api";
import BannerBoxV2 from "../bannerBoxV2";

const HeroSideBanners = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    let active = true;
    fetchDataFromApi(
      "/api/category-banners?active=true&placement=hero-side",
    ).then((result) => {
      if (active && result?.success) setBanners((result.data || []).slice(0, 2));
    });
    return () => {
      active = false;
    };
  }, []);

  if (!banners.length) return null;

  return banners.map((banner) => (
    <BannerBoxV2
      key={banner._id}
      info={banner.textAlign}
      image={banner.image}
      subtitle={banner.subtitle}
      title={banner.title || banner.categoryId?.name}
      buttonText={banner.buttonText || "BUY NOW"}
      link={`/productListing?category=${banner.categoryId?._id || banner.categoryId}`}
    />
  ));
};

export default HeroSideBanners;
