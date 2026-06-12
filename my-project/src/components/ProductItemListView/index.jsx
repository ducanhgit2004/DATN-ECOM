import React, {useContext} from 'react'
import '../ProductItem/style.css'
import { Link } from 'react-router-dom'
import Rating from '@mui/material/Rating'
import Button from '@mui/material/Button'
import { FaRegHeart } from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";
import { MdZoomOutMap } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MyContext } from '../../App'


const ProductItem = () => {

  
  const context = useContext(MyContext);
  return (
    <div className="productItem w-full shadow-lg overflow-hidden rounded-md border
     border-[rgba(0,0,0,0.1)] flex items-center">
      
      <div className="group imgWrapper w-[25%] h-[220px] overflow-hidden rounded-md relative ml-4">
        <Link to="/">
          <div className="img h-[220px] overflow-hidden">
              <img 
              src="/vay1.PNG"
              className="w-full"/>

               <img 
              src="https://static.juno.vn/cmsimage/public/nau_jnvng023_6_20260331165636.jpeg"
              className="w-full transition-all duration-700 absolute top-0 left-0 opacity-0 
              group-hover:opacity-100 group-hover:scale-105"/>
              
          </div>
        </Link>
        <span className="discount flex items-center absolute top-[10px] left-[10px] z-50
        bg-[#ff5252] text-white rounded-lg p-1 text-[12px] font-[500]">10%</span>

        <div className="actions absolute top-[-200px] right-[15px] z-50 flex items-center 
        gap-2 flex-col w-[50px] transition-all duration-300 group-hover:top-[15px] opacity-0 group-hover:opacity-100">          
            <Button className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black
            hover:!bg-[#ff5252] hover:text-white group" onClick={()=>context.
              setOpenProductDetailsModal(true)
            }>
              <MdZoomOutMap className='text-[18px] !text-black group-hover:text-white hover:!text-white'/>
            </Button>

          <Button className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black
          hover:!bg-[#ff5252] hover:text-white group ">
            <IoIosGitCompare className='text-[18px] !text-black group-hover:text-white hover:!text-white'/>
          </Button>

          <Button className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black
          hover:!bg-[#ff5252] hover:text-white group">
            <FaRegHeart className='text-[18px] !text-black group-hover:text-white hover:!text-white'/>
          </Button>
        </div>

      </div>
        
      <div className="info p-3 rounded-b-lg py-5 px-8 w-[75%]">
        <h6 className='text-[15px] !font-[400]'>
          <Link to="/" className='link transition-all'>Áo phông</Link>
        </h6>

        <h3 className='text-[18px] title mt-3 mb-3 font-[500] mb-1 text-[#000]'>
          <Link to="/" className='link transition-all'>
            Áo thun ngắn tay có cổ phong cách thể thao
          </Link>
        </h3>

        <p className='text-[14px] mb-3'>Được làm từ sợi tre cao cấp, phù hợp với đủ mọi loại thời 
          tiết hạn chế bai dão
        </p>

        <Rating name="size-small" defaultValue={2} size="small" readOnly />

          <div className="flex items-center gap-4">
            <span className="oldPrice line-through text-gray-500 text-[15px] font-[500]">$58.00</span>
            <span className="price text-[#ff5252] font-[600] text-[15px]">$30.00</span>
          </div>

        <div className='mt-3'>
        <Button className="btn-org flex gap-2 ">
          <MdOutlineShoppingCart className="text-[20px]"/>
          Add to Cart
        </Button>
        </div>
      </div> 
      
    </div>
  )
}

export default ProductItem