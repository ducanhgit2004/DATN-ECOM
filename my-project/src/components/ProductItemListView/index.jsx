import { useContext } from "react";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { FaRegHeart } from "react-icons/fa";
import { MdZoomOutMap } from "react-icons/md";
import { IoGitCompareOutline } from "react-icons/io5";
import { MyContext } from "../../App";

const money = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(Number(value) || 0);

const ProductItemListView = ({ product }) => {
  const { openProductPreview, addToMyList, myListItems, addToCompare, compareIds } = useContext(MyContext);
  if (!product) return null;
  const images = product.images?.length ? product.images : ["/placeholder-image.png"];
  return <article className="group relative flex flex-col sm:flex-row w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="relative w-full sm:w-[260px] lg:w-[300px] xl:w-[320px] shrink-0 h-[280px] sm:h-[300px] overflow-hidden bg-gray-50">
      <Link to={`/product/${product._id}`} className="block w-full h-full">
        <img src={images[0]} alt={product.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        {images[1] && <img src={images[1]} alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105" />}
      </Link>
      {Number(product.discount) > 0 && <span className="absolute top-3 left-3 z-10 bg-[#ff5252] text-white rounded-lg px-2 py-1 text-[12px] font-semibold">{product.discount}%</span>}
    </div>

    <div className="flex flex-1 min-w-0 flex-col justify-center p-5 md:p-7 lg:p-8">
      <span className="text-[13px] font-[500] text-gray-500">{product.catName || product.category?.name || "Product"}</span>
      <h3 className="mt-1 text-[20px] md:text-[22px] font-[600] text-gray-900"><Link to={`/product/${product._id}`} className="hover:text-[#ff5252] transition-colors">{product.name}</Link></h3>
      {product.brand && <span className="mt-1 text-sm text-gray-500">Brand: <strong className="font-medium text-gray-700">{product.brand}</strong></span>}
      <div className="mt-3 flex items-center gap-2"><Rating value={Number(product.rating) || 0} precision={0.5} size="small" readOnly /><span className="text-xs text-gray-500">({Number(product.rating) || 0})</span></div>
      {product.description && <p className="mt-4 max-w-[720px] text-[14px] leading-6 text-gray-600 line-clamp-3">{product.description}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-4">{Number(product.oldPrice) > Number(product.price) && <span className="line-through text-gray-400 text-[16px]">{money(product.oldPrice)}</span>}<span className="text-[#ff5252] font-[700] text-[20px]">{money(product.price)}</span><span className={`text-xs font-semibold rounded-full px-3 py-1 ${Number(product.countInStock) > 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{Number(product.countInStock) > 0 ? "In stock" : "Out of stock"}</span></div>
      <div className="mt-6 flex items-center gap-3"><Link to={`/product/${product._id}`} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ff5252] px-5 text-sm font-semibold text-white hover:bg-[#e74848] transition">View Details</Link><Button aria-label="Quick view" title="Quick view" className="!min-w-[40px] !w-[40px] !h-[40px] !rounded-lg !border !border-gray-200 !text-gray-700" onClick={() => openProductPreview(product)}><MdZoomOutMap /></Button><Button aria-label="Add to wishlist" title="Add to wishlist" disabled={myListItems.some((item) => item.productId === product._id)} className="!min-w-[40px] !w-[40px] !h-[40px] !rounded-lg !border !border-gray-200 !text-gray-700" onClick={() => addToMyList(product)}><FaRegHeart /></Button><Button aria-label="Add to compare" title="Add to compare" disabled={compareIds.includes(product._id)} className="!min-w-[40px] !w-[40px] !h-[40px] !rounded-lg !border !border-gray-200 !text-gray-700" onClick={() => addToCompare(product)}><IoGitCompareOutline /></Button></div>
    </div>
  </article>;
};

export default ProductItemListView;
