import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Button from '@mui/material/Button';

import { EffectFade, Navigation, Pagination, Autoplay } from 'swiper/modules';


const HomeBannerV2 = () => {
  return (
    <Swiper
        loop={true}
        spaceBetween={30}
        effect={'fade'}
        navigation={true}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        className="homeSliderV2"
      >
        <SwiperSlide>
          <div className="item w-full rounded-md overflow-hidden relative">
            <img src="cleandas.png" />

              <div className="info absolute -right-[100%] opacity-0 top-0 w-[50%] h-[100%]
               z-50 p-8 flex items-center flex-col justify-center transition-all duration-700">
                <h4 className='text-[18px] font-[500] w-full text-left mb-3 
                relative -right-[100%] opacity-0'>New Arrivals</h4>
                <h2 className='text-[35px] font-[650] w-full relative -right-[100%] opacity-0'>Cập bến Áo Sweater & Hoodie ADIDAS</h2>

                  <h3 className='flex items-center gap-3 text-[18px] font-[500] w-full text-left mt-3 
                  mb-3 relative -right-[100%] opacity-0'>Chỉ từ
                     <span className='text-[#ff5252] text-[30px] font-[700]'>899.000 VNĐ</span></h3>

                    <div className="w-full relative -right-[100%] opacity-0 btn_ ">
                      <Button className='btn-org'>MUA NGAY</Button> 
                    </div>

              </div>

          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="item w-full rounded-md overflow-hidden">
            <img src="backdass.png" width="100%" />

             <div className="info absolute -right-[100%] opacity-0 top-0 w-[50%] h-[100%]
               z-50 p-8 flex items-center flex-col justify-center transition-all duration-700">
                <h4 className='text-[18px] font-[500] w-full text-left mb-3 relative -right-[100%] opacity-0'>New Golf Season</h4>
                <h2 className='text-[35px] font-[650] w-full relative -right-[100%] opacity-0'>Golf Jacket ADIDAS</h2>

                  <h3 className='flex items-center gap-3 text-[18px] font-[500] w-full text-left mt-3 mb-3 relative -right-[100%] opacity-0'>Chỉ từ
                     <span className='text-[#ff5252] text-[30px] font-[700]'>1.899.000 VNĐ</span></h3>

                    <div className="w-full relative -right-[100%] opacity-0 btn_ ">
                      <Button className='btn-org'>MUA NGAY</Button> 
                    </div>

              </div>
          </div>
        </SwiperSlide>
        
      </Swiper>
  )
}

export default HomeBannerV2