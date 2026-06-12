import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'

import { Navigation, Autoplay } from 'swiper/modules'

const HomeSlider = () => {
  return (
    <div className="homeSlider py-4">
      <div className="container">
        <Swiper
          loop={true}
          spaceBetween={20}
          navigation={true}
          modules={[Navigation, Autoplay]}
          autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
          className="sliderHome"
        >
          <SwiperSlide>
            <div className="item rounded-[20px] overflow-hidden">
              <img src="/banner11.jpg" alt="Banner slide" className="h-150 w-full object-cover" />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="item rounded-[20px] overflow-hidden">
              <img src="/banner 2.jpg" alt="Banner slide" className="h-150 w-full object-cover" />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="item rounded-[20px] overflow-hidden">
              <img src="/banner 3.jpg" alt="Banner slide" className="h-150 w-full object-cover" />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="item rounded-[20px] overflow-hidden">
              <img src="/ESSENTIALS-BANNER-min.gif" alt="Banner slide" className="h-150 w-full object-cover" />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="item rounded-[20px] overflow-hidden">
              <img src="/banner 5.gif" alt="Banner slide" className="h-150 w-full object-cover" />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="item rounded-[20px] overflow-hidden">
              <img src="/banner 6.jpg" alt="Banner slide" className="h-150 w-full object-cover" />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  )
}

export default HomeSlider