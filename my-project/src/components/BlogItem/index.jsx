import React from 'react'
import { IoMdTime } from "react-icons/io";
import { Link } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";


const BlogItem = () => {
  return (
    <div className='blogItem group'>
        <div className="imgWrapper w-full overflow-hidden rounded-md cursor-pointer relative">
            <img src="https://birchwoodfurniture.ca/wp-content/uploads/2023/07/Modern-Living-Room-Furniture-Ideas-Hero-scaled.jpg"
            className="w-full transition-all group-hover:scale-105
            group-hover:rotate-1" alt="blog image" />


            <span className="flex items-center justify-center text-white absolute bottom-[15px]
            right-[15px] z-50 bg-[#ff5252] rounded-md p-1 text-[11px] font-[500] gap-1">
                <IoMdTime className='text-[16px]'/> 5 MAY, 2026
            </span>

        </div>


        <div className="info py-4">
            <h2 className="text-[15px] font-[600] text-black">
                <Link className="link" to="/">Bàn ghế, nội thất chuẩn bị cập bến NovaCart</Link>
            </h2>
            <p className="text-[13px] font-[400] text-[rgba(0,0,0,0.8)] mb-4">Lorem Ipsum is simply dummy text of the 
            printing and typesetting industry..... </p>

                    <Link className="link font-[500] text-[14px] flex items-center gap-1">Read More
                    <IoIosArrowForward/></Link>
        </div>
    </div>
  )
}

export default BlogItem
