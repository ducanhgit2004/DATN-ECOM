import React from 'react'
import "../bannerBoxV2/style.css"
import { Link } from 'react-router-dom'

const BannerBoxV2 = (props) => {
  return (
    <div className='bannerBoxV2 w-full rounded-md overflow-hidden group relative'> 
      <img src={props.image} alt="Banner" className='w-full h-full object-cover rounded-md transition-all duration-150 group-hover:scale-105' />


      <div className={`info absolute p-5 top-0 ${props.info === "left" ? "left-0" : "right-0"}
      w-[50%] h-[100%] z-50 flex items-start justify-center flex-col gap-2 text-left
      ${props.info === "left" ? '' : 'pl-10'}`}
      >
        <h2 className='text-[20px] font-[600]'>Go Pro HERO 4</h2>

          <span className='text-[20px] text-[#ff5252] font-[600] w-full'>4.900.000 VNĐ</span>

         <div className="w-full">
           <Link to="/" className='text-[16px] font-[600] link'>MUA NGAY</Link>
         </div>
      </div>

    </div>
  )
}

export default BannerBoxV2
