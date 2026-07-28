import { useState } from "react";

const ProductZoom = ({ product }) => {
  const images = product?.images?.length ? product.images : ["/placeholder-image.png"];
  const [selected, setSelected] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const safeSelected = Math.min(selected, images.length - 1);
  const moveZoom = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };
  return <div className="product-gallery flex flex-col-reverse sm:flex-row gap-3 w-full min-w-0">
    <div className="product-gallery-thumbs flex sm:flex-col gap-3 sm:w-[82px] max-h-[560px] overflow-auto shrink-0">{images.map((image, index) => <button type="button" key={`${image}-${index}`} onClick={() => setSelected(index)} aria-label={`View product image ${index + 1}`} className={`w-[72px] h-[88px] shrink-0 rounded-md overflow-hidden border-2 bg-white p-1 ${safeSelected === index ? "border-[#ff5252]" : "border-gray-200"}`}><img src={image} alt={`${product?.name || "Product"} ${index + 1}`} className="w-full h-full object-contain" /></button>)}</div>
    <div className="product-gallery-main flex-1 min-w-0 flex items-start justify-center">
      <div className="product-gallery-image-frame inline-block max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white cursor-zoom-in" onMouseMove={moveZoom} onMouseLeave={() => setZoomOrigin("50% 50%")}> 
        <img src={images[safeSelected]} alt={product?.name || "Product"} className="product-gallery-image block w-auto max-w-full h-auto max-h-[560px]" style={{ transformOrigin: zoomOrigin }} />
      </div>
    </div>
  </div>;
};

export default ProductZoom;
