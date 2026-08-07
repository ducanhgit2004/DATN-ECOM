import { useContext } from "react";
import "../ProductItem/style.css";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { FaRegHeart } from "react-icons/fa";
import { MdZoomOutMap } from "react-icons/md";
import { IoGitCompareOutline } from "react-icons/io5";
import { MyContext } from "../../App";

const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);

const ProductItem = ({ product }) => {
  const { openProductPreview, addToMyList, myListItems, addToCompare, compareIds } = useContext(MyContext);
  if (!product) return null;
  const images = product.images?.length ? product.images : ["/placeholder-image.png"];
  return <div className="productItem w-full shadow-lg overflow-hidden rounded-md border border-[rgba(0,0,0,0.1)]">
    <div className="group imgWrapper w-full h-[280px] overflow-hidden rounded-md relative bg-gray-50">
      <Link to={`/product/${product._id}`}><div className="img h-[280px] overflow-hidden">
        <img src={images[0]} alt={product.name} className="w-full h-full object-cover object-top" />
        {images[1] && <img src={images[1]} alt="" className="w-full h-full object-cover object-top transition-all duration-700 absolute top-0 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-105" />}
      </div></Link>
      {product.discount > 0 && <span className="discount absolute top-[10px] left-[10px] z-50 bg-[#ff5252] text-white rounded-lg p-1 text-[12px]">{product.discount}%</span>}
      <div className="actions absolute top-[-200px] right-[15px] z-50 flex gap-2 flex-col transition-all duration-300 group-hover:top-[15px] opacity-0 group-hover:opacity-100">
        <Button aria-label="Quick view" className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !bg-white" onClick={() => openProductPreview(product)}><MdZoomOutMap /></Button>
        <Button aria-label="Add to wishlist" disabled={myListItems.some((item) => item.productId === product._id)} className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !bg-white" onClick={() => addToMyList(product)}><FaRegHeart /></Button>
        <Button aria-label="Add to compare" title="Add to compare" disabled={compareIds.includes(product._id)} className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !bg-white" onClick={() => addToCompare(product)}><IoGitCompareOutline /></Button>
      </div>
    </div>
    <div className="info p-3 py-5">
      <h6 className="text-[13px] text-gray-500">{product.catName || product.category?.name || "Product"}</h6>
      <h3 className="text-[14px] title mt-1 font-[500] mb-1"><Link to={`/product/${product._id}`} className="link">{product.name}</Link></h3>
      <Rating value={Number(product.rating) || 0} size="small" readOnly />
      <div className="flex items-center gap-4">{product.oldPrice > product.price && <span className="line-through text-gray-500 text-[15px]">{money(product.oldPrice)}</span>}<span className="text-[#ff5252] font-[600] text-[15px]">{money(product.price)}</span></div>
    </div>
  </div>;
};

export default ProductItem;
