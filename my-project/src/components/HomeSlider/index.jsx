import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { fetchDataFromApi } from "../../utils/api";
import { Link } from "react-router-dom";

const HomeSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchDataFromApi("/api/home-sliders?active=true").then((result) => {
      if (active && result?.success) setSlides(result.data || []);
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="homeSlider py-4"><div className="container"><div className="w-full aspect-[3/1] max-h-[500px] rounded-[20px] bg-gray-100 animate-pulse" /></div></div>;
  if (!slides.length) return null;

  return (
    <div className="homeSlider py-4">
      <div className="container">
        <Swiper loop={slides.length > 1} spaceBetween={20} navigation={slides.length > 1} modules={[Navigation, Autoplay]} autoplay={slides.length > 1 ? { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true } : false} className="sliderHome">
          {slides.map((slide, index) => (
            <SwiperSlide key={slide._id}>
              {slide.link ? (
                /^https?:\/\//i.test(slide.link) ? (
                  <a href={slide.link} aria-label={slide.title || `Banner ${index + 1}`} className="block item rounded-[20px] overflow-hidden"><img src={slide.image} alt={slide.title || `Home banner ${index + 1}`} className="w-full aspect-[3/1] max-h-[500px] object-cover" loading={index === 0 ? "eager" : "lazy"} /></a>
                ) : (
                  <Link to={slide.link} aria-label={slide.title || `Banner ${index + 1}`} className="block item rounded-[20px] overflow-hidden"><img src={slide.image} alt={slide.title || `Home banner ${index + 1}`} className="w-full aspect-[3/1] max-h-[500px] object-cover" loading={index === 0 ? "eager" : "lazy"} /></Link>
                )
              ) : <div className="item rounded-[20px] overflow-hidden"><img src={slide.image} alt={slide.title || `Home banner ${index + 1}`} className="w-full aspect-[3/1] max-h-[500px] object-cover" loading={index === 0 ? "eager" : "lazy"} /></div>}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default HomeSlider;
