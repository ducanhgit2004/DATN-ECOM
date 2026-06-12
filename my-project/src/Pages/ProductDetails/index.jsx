import Breadcrumbs from "@mui/material/Breadcrumbs";
import React, { useState } from 'react'
import { Link } from "react-router-dom";
import ProductZoom  from "../../components/ProductZoom"
import Rating from '@mui/material/Rating'
import Button from "@mui/material/Button"

import TextField from '@mui/material/TextField';
import ProductsSlider from "../../components/ProductsSlider";
import ProductDetailsComponent from "../../components/ProductDetails"


const ProductDetails = () => {

    const[activeTab, setActiveTab] = useState(0);

  return (
    <>
      <div className="py-5">
      <div className="container">
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            href="/"
            className="link transition"
          >
            Home
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/"
            className="link transition"
          >
            Fashion
          </Link>

          <Link
            underline="hover"
            color="inherit"
            href="/"
            className="link transition"
          >
            Quần giả váy xếp ly
          </Link>

          
        </Breadcrumbs>
      </div>



       

    </div>  

    <section className="bg-white py-5">
       <div className="container flex gap-8 items-center">
            <div className="productZoomContainer w-[40%] ">
                <ProductZoom/>
            </div>

             <div className="productContent w-[60%] pr-10 pl-10">

                <ProductDetailsComponent/>
        

          </div>
        </div>

      <div className="container pt-12">
        <div className="flex items-center gap-8 mb-5">
          <span className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 0 && 'text-[#ff5252]'}`} onClick={()=>setActiveTab(0)}>Description        
          </span>
          <span className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 1 && 'text-[#ff5252]'}`}  onClick={()=>setActiveTab(1)}>Product Details        
          </span>
          <span className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 2 && 'text-[#ff5252]'}`}  onClick={()=>setActiveTab(2)}>Review (5)        
          </span>
        </div>

        {
          activeTab === 0 && (

          <div className="shadow-md w-full py-5 px-8 p-8 rounded-md">
          <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 
            'Content here, content here', making it look like readable English.</p>

          <h4>Lightweight Design</h4>

          <p>Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years,
             sometimes by accident, sometimes on purpose</p>

          <h4>Free Shipping & Return</h4>

          <p>We offer free shipping for products on orders above 50$ and free delivery 
            in Nam Dinh</p>   

          <h4>Money Back Guarantee</h4>
          <p>We guarantee our products and you could get back all of your money 
            anytime</p>

          <h4>Online Support</h4>
          <p>You will 24 hours support with this purchase product</p>    

        </div>

        )}



       {
        activeTab === 1 && (
          <div className="shadow-md w-full py-5 px-8 p-8 rounded-md">
          <div className="relative overflow-x-auto shadow-md rounded-lg border border-[rgba(0,0,0,0.1)]">
            <table className="w-full text-sm text-left text-gray-500">
              <tbody>

                <tr className="border-b">
                  <th className="px-6 py-4 w-[30%] bg-gray-50 text-black font-semibold">
                    Product Name
                  </th>
                  <td className="px-6 py-4">
                    Juno Pleated Skort for Women
                  </td>
                </tr>

                <tr className="border-b">
                  <th className="px-6 py-4 bg-gray-50 text-black font-semibold">
                    Brand
                  </th>
                  <td className="px-6 py-4">
                    Juno
                  </td>
                </tr>

                <tr className="border-b">
                  <th className="px-6 py-4 bg-gray-50 text-black font-semibold">
                    Category
                  </th>
                  <td className="px-6 py-4">
                    Women’s Fashion / Skirts
                  </td>
                </tr>

                <tr className="border-b">
                  <th className="px-6 py-4 bg-gray-50 text-black font-semibold">
                    Material
                  </th>
                  <td className="px-6 py-4">
                    Premium stretch khaki fabric
                  </td>
                </tr>

                <tr className="border-b">
                  <th className="px-6 py-4 bg-gray-50 text-black font-semibold">
                    Color
                  </th>
                  <td className="px-6 py-4">
                    Black
                  </td>
                </tr>

                <tr className="border-b">
                  <th className="px-6 py-4 bg-gray-50 text-black font-semibold">
                    Size
                  </th>
                  <td className="px-6 py-4">
                    S, M, L, XL
                  </td>
                </tr>

                <tr className="border-b">
                  <th className="px-6 py-4 bg-gray-50 text-black font-semibold">
                    Style
                  </th>
                  <td className="px-6 py-4">
                    Elegant, Korean Style, Casual
                  </td>
                </tr>

                <tr>
                  <th className="px-6 py-4 bg-gray-50 text-black font-semibold">
                    Origin
                  </th>
                  <td className="px-6 py-4">
                    Vietnam
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
          </div>
        )}

        {
          activeTab === 2 && (
            <div className="shadow-md w-[80%] py-5 px-8 rounded-md">
              <div className="w-full productReviewsContainer">
                <h2 className="text-[18px]">Customer questions & answers</h2>

                <div className="reviewScroll w-full max-h-[300px] overflow-y-scroll overflow-x-hidden
                mt-5 pr-5">
                  <div className="review pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] w-full flex items-center justify-between">
                    <div className="info w-[60%] flex items-center gap-2">
                      <div className="img w-[80px] h-[80px] overflow-hidden rounded-full">
                        <img src="/anhatinh.jpg" className="w-full"/>
                      </div>

                    <div className="w-[80%]">
                      <h4 className="text-[16px]">hoangtu 29c1</h4>
                      <h5 className="text-[13px] mb-0">13-5-2025</h5>
                      <p className="!mt-0 !mb-0">toi noi vay thi ae ok di</p>
                    </div>

                    </div>
                    <Rating name="size-small" defaultValue={2} readOnly />

                  </div>
                  
                  <div className="review pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] w-full flex items-center justify-between">
                    <div className="info w-[60%] flex items-center gap-2">
                      <div className="img w-[80px] h-[80px] overflow-hidden rounded-full">
                        <img src="/anhatinh.jpg" className="w-full"/>
                      </div>

                    <div className="w-[80%]">
                      <h4 className="text-[16px]">hoangtu 29c1</h4>
                      <h5 className="text-[13px] mb-0">13-5-2025</h5>
                      <p className="!mt-0 !mb-0">toi noi vay thi ae ok di</p>
                    </div>

                    </div>
                    <Rating name="size-small" defaultValue={2} readOnly />

                  </div>

                    <div className="review pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] w-full flex items-center justify-between">
                    <div className="info w-[60%] flex items-center gap-2">
                      <div className="img w-[80px] h-[80px] overflow-hidden rounded-full">
                        <img src="/anhatinh.jpg" className="w-full"/>
                      </div>

                    <div className="w-[80%]">
                      <h4 className="text-[16px]">hoangtu 29c1</h4>
                      <h5 className="text-[13px] mb-0">13-5-2025</h5>
                      <p className="!mt-0 !mb-0">toi noi vay thi ae ok di</p>
                    </div>

                    </div>
                    <Rating name="size-small" defaultValue={2} readOnly />

                  </div>

                    <div className="review pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] w-full flex items-center justify-between">
                    <div className="info w-[60%] flex items-center gap-2">
                      <div className="img w-[80px] h-[80px] overflow-hidden rounded-full">
                        <img src="/anhatinh.jpg" className="w-full"/>
                      </div>

                    <div className="w-[80%]">
                      <h4 className="text-[16px]">hoangtu 29c1</h4>
                      <h5 className="text-[13px] mb-0">13-5-2025</h5>
                      <p className="!mt-0 !mb-0">toi noi vay thi ae ok di</p>
                    </div>

                    </div>
                    <Rating name="size-small" defaultValue={2} readOnly />

                  </div>

                    <div className="review pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] w-full flex items-center justify-between">
                    <div className="info w-[60%] flex items-center gap-2">
                      <div className="img w-[80px] h-[80px] overflow-hidden rounded-full">
                        <img src="/anhatinh.jpg" className="w-full"/>
                      </div>

                    <div className="w-[80%]">
                      <h4 className="text-[16px]">hoangtu 29c1</h4>
                      <h5 className="text-[13px] mb-0">13-5-2025</h5>
                      <p className="!mt-0 !mb-0">toi noi vay thi ae ok di</p>
                    </div>

                    </div>
                    <Rating name="size-small" defaultValue={2} readOnly />

                  </div>


                 
                </div>



                <br/>

                <div className="reviewForm bg-[#fafafa] p-4 rounded-md">
                  <h2 className="text-[18px]">Add a review</h2>
                  
                  <form className="w-full mt-5">
                       <TextField
                        id="outlined-multiline-flexible"
                        label="Write a Review...."
                        className="w-full"
                        multiline
                        rows={5}
                      />
                      <br/> <br />
                      <Rating name="size-small" defaultValue={2}  />


                      <div className="flex items-center mt-5">
                        <Button className="btn-org">Submit Review</Button>
                      </div>
                  </form>

                </div>

              </div>
            </div>
  )
}
       </div>

       <div className="container pt-8">
         <h2 className="text-[20px] font-[600] pb-0">Related Products</h2>
          <ProductsSlider items={6}/>
       </div>
    </section>
    </>
  )
}

export default ProductDetails
