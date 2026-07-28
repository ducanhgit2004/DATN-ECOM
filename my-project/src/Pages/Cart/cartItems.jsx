import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { MyContext } from "../../App";
import Rating from "@mui/material/Rating";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value) || 0,
  );

const CartItems = ({ item }) => {
  const context = useContext(MyContext);
  const product = item?.productId;
  const quantity = Number(item?.quantity || 1);
  const price = Number(product?.price || 0);
  const image = product?.images?.[0] || "/placeholder-image.png";
  const productHref = product?._id ? `/product/${product._id}` : "/";
  const [variantAnchorEl, setVariantAnchorEl] = useState(null);
  const [qtyAnchorEl, setQtyAnchorEl] = useState(null);
  const openVariant = Boolean(variantAnchorEl);
  const openQty = Boolean(qtyAnchorEl);

  const variantOptions = React.useMemo(() => {
    const options = [];
    if (product?.size) {
      options.push(
        ...(Array.isArray(product.size) ? product.size : [product.size]),
      );
    }
    if (product?.productRam) {
      options.push(
        ...(Array.isArray(product.productRam)
          ? product.productRam
          : [product.productRam]),
      );
    }
    if (product?.productWeight) {
      options.push(
        ...(Array.isArray(product.productWeight)
          ? product.productWeight
          : [product.productWeight]),
      );
    }
    return options.filter(Boolean).map((option) => String(option).trim());
  }, [product]);

  const handleVariantChange = async (newVariant) => {
    setVariantAnchorEl(null);
    if (newVariant !== null && newVariant !== item?.size) {
      await context?.updateCartQty?.(item?._id, quantity, newVariant);
    }
  };

  const handleQtyChange = async (newQty) => {
    setQtyAnchorEl(null);
    if (newQty !== null) {
      await context?.updateCartQty?.(item?._id, newQty, item?.size);
    }
  };

  return (
    <div className="cartItem w-full p-3 flex items-center gap-4 pb-5 border-b border-[rgba(0,0,0,0.1)]">
      <div className="img w-[10%] rounded-md overflow-hidden">
        <Link to={productHref} className="group">
          <img
            src={image}
            alt={product?.name || "product"}
            className="w-full h-[80px] object-cover group-hover:scale-105 transition-all"
          />
        </Link>
      </div>

      <div className="info w-[90%] relative">
        <IoCloseSharp
          className="cursor-pointer absolute top-[0px] right-[6px] text-[22px] link transition-all"
          onClick={() => context?.removeFromCart?.(item?._id, product?._id)}
        />
        <span className="text-[13px]">{product?.brand || "Product"}</span>
        <h3 className="text-[16px]">
          <Link to={productHref} className="link">
            {product?.name || "Product"}
          </Link>
        </h3>

        <Rating
          name="size-small"
          value={Number(product?.rating || 0)}
          size="small"
          readOnly
        />

        <div className="flex items-center gap-4 mt-2">
          <button
            type="button"
            className="bg-[#f1f1f1] text-[11px] font-[600] py-1 px-2 rounded-md"
            onClick={(event) => setQtyAnchorEl(event.currentTarget)}
          >
            Qty: {quantity}
          </button>
          <Menu
            anchorEl={qtyAnchorEl}
            open={openQty}
            onClose={() => setQtyAnchorEl(null)}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <MenuItem key={value} onClick={() => handleQtyChange(value)}>
                {value}
              </MenuItem>
            ))}
          </Menu>
          <button
            type="button"
            className="bg-[#f1f1f1] text-[11px] font-[600] py-1 px-2 rounded-md"
            onClick={(event) => setVariantAnchorEl(event.currentTarget)}
          >
            {product?.productRam || product?.productWeight ? "Variant" : "Size"}
            : {item?.size || "Default"}
          </button>
          <Menu
            anchorEl={variantAnchorEl}
            open={openVariant}
            onClose={() => setVariantAnchorEl(null)}
          >
            {variantOptions.map((value) => (
              <MenuItem key={value} onClick={() => handleVariantChange(value)}>
                {value}
              </MenuItem>
            ))}
          </Menu>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <span className="price font-[600] text-[14px]">
            {money(price * quantity)}
          </span>
          {product?.oldPrice && Number(product.oldPrice) > price ? (
            <span className="oldPrice line-through text-gray-500 text-[14px] font-[500]">
              {money(product.oldPrice * quantity)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CartItems;
