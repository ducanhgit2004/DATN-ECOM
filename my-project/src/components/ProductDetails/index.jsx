
import React, { useState } from 'react'
import Button from "@mui/material/Button";
import QtyBox from "../QtyBox";
import Rating from '@mui/material/Rating'
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";



const ProductDetailsComponent = () => {
        const[productActionIndex, setProductActionIndex] = useState(null);
    
  return (
    <>
                  <h1 className="text-[25px] font-[700] mb-2">Quần giả váy xếp ly nhãn hiệu Juno | Quần thời trang
                cao cấp | Quần nữ
              </h1>
              <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-[15px]">
                    Brands:  <span className="font-[500] text-black opacity-75">  Juno</span>
                    </span>


                  <Rating name="size-small" defaultValue={2} size="small" readOnly />
                  <span className="text-[13px] cursor-pointer ">Review (5)</span>

              </div>
              <div className="flex items-center gap-4 mt-4">
            <span className="oldPrice line-through text-gray-500 text-[20px] font-[500]">$58.00</span>
            <span className="price text-[#ff5252] font-[600] text-[20px]">$30.00</span>

            <span className="text-[14px]">Available In Stock : <span className="text-green-600
            text-[14px] font-bold"> 147 Items</span></span>
          </div>

            <p className="mt-3 pr-10 mb-5">
              - Quần giả váy xếp ly đẹp, tạo hiệu ứng chuyển động nhẹ nhàng và tôn dáng.<br/>

              - Chất liệu mềm mại, thoáng nhẹ, mang lại cảm giác dễ chịu khi mặc cả ngày.<br/>

              - Form váy gọn gàng, dễ phối cùng áo thun, sơ mi hoặc croptop.<br/>

              - Kích thước váy: S - M - L - XL<br/>

              - Chiều dài:<br/>

              S: 31cm - M: 32cm - L: 33cm - XL: 34cm <br/>
            </p>

            <div className="flex items-center gap-3">
                <span className="text-[16px]">Size:</span>
                <div className="flex items-center gap-1 actions">
                    <Button className={`${productActionIndex === 0 ? '!bg-[#ff5252] !text-white':''}`} 
                    onClick={()=>setProductActionIndex(0)}>S</Button>
                    <Button className={`${productActionIndex === 1 ? '!bg-[#ff5252] !text-white':''}`} 
                    onClick={()=>setProductActionIndex(1)}>M</Button>
                    <Button className={`${productActionIndex === 2 ? '!bg-[#ff5252] !text-white':''}`} 
                    onClick={()=>setProductActionIndex(2)}>L</Button>
                    <Button className={`${productActionIndex === 3 ? '!bg-[#ff5252] !text-white':''}`} 
                    onClick={()=>setProductActionIndex(3)}>XL</Button>
                </div>
            </div>


          <p className="text-[14px] !mt-5 mb-5 text-[#000]">
            FreeShipping (Est. Delivery Time 2-3 Days)</p>
            <div className="flex items-center  gap-4">
              <div className="qtyBoxWrapper w-[70px]">
                <QtyBox/>
              </div>
            

            <Button className="btn-org flex gap-2">
              <MdOutlineShoppingCart className="text-[22px]"/> 
            Add to Cart </Button>
            </div>

             <div className="flex items-center gap-4 mt-6">
              <span className="flex items-center gap-2 font-[15px] 
              link cursor-pointer font-[500]"><FaRegHeart className="text-[18px]"/> Add to Wishlist</span>

               <span className="flex items-center gap-2 font-[15px] 
              link cursor-pointer font-[500]"><IoIosGitCompare className="text-[18px]"/> Add to Compare</span>

            </div>

    </>
  )
}

export default ProductDetailsComponent
