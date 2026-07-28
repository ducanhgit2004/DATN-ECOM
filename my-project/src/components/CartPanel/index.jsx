import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";
import Button from "@mui/material/Button";
import { MyContext } from "../../App";

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value) || 0,
  );

const CartPanel = () => {
  const context = useContext(MyContext);
  const cartItems = context?.cartItems || [];

  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item?.productId?.price || 0);
    const quantity = Number(item?.quantity || 1);
    return total + price * quantity;
  }, 0);

  const shipping = subtotal > 0 ? 7 : 0;
  const total = subtotal + shipping;

  return (
    <>
      <div className="scroll w-full max-h-[500px] overflow-y-scroll overflow-x-hidden py-3 px-4">
        {cartItems.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Your cart is empty.
          </div>
        ) : (
          cartItems.map((item) => {
            const product = item?.productId;
            const image = product?.images?.[0] || "/placeholder-image.png";
            const productHref = product?._id ? `/product/${product._id}` : "/";

            return (
              <div
                key={item?._id}
                className="cartItem w-full flex items-center gap-4 border-b border-[rgba(0,0,0,0.1)] pb-4"
              >
                <div className="img w-[25%] overflow-hidden h-[80px] rounded-md">
                  <Link to={productHref} className="block group">
                    <img
                      src={image}
                      alt={product?.name || "product"}
                      className="w-full h-[80px] object-cover group-hover:scale-105"
                    />
                  </Link>
                </div>

                <div className="info w-[75%] pr-5 relative">
                  <h4 className="text-[16px] !font-[500]">
                    <Link to={productHref} className="link transition-all">
                      {product?.name || "Product"}
                    </Link>
                  </h4>
                  <p className="flex items-center gap-5 mt-2 mb-2">
                    <span>
                      Qty : <span>{item?.quantity || 1}</span>
                    </span>
                    <span className="text-[#ff5252] font-bold">
                      Price : {money(product?.price || 0)}
                    </span>
                  </p>
                  {item?.size ? (
                    <p className="text-xs text-gray-500">Size: {item.size}</p>
                  ) : null}

                  <MdDeleteOutline
                    className="absolute top-[10px] right-[10px] cursor-pointer text-[20px] link"
                    onClick={() =>
                      context?.removeFromCart?.(item?._id, product?._id)
                    }
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <br />

      <div className="bottomSec absolute bottom-[10px] left-[10px] w-full overflow-hidden pr-5">
        <div className="bottomInfo py-3 px-4 w-full border-t border-[rgba(0,0,0,0.1)] flex items-center justify-between flex-col">
          <div className="flex items-center justify-between w-full">
            <span className="text-[14px] font-[600]">
              {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
            </span>
            <span className="text-[#ff5252] font-bold">{money(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="text-[14px] font-[600]">Shipping</span>
            <span className="text-[#ff5252] font-bold">{money(shipping)}</span>
          </div>
        </div>

        <div className="bottomInfo py-3 px-4 w-full border-t border-[rgba(0,0,0,0.1)] flex items-center justify-between flex-col">
          <div className="flex items-center justify-between w-full">
            <span className="text-[14px] font-[600]">Total (tax excl.)</span>
            <span className="text-[#ff5252] font-bold">{money(total)}</span>
          </div>

          <br />

          <div className="flex items-center justify-between w-full gap-5">
            <Link to="/cart" className="w-[50%] d-block">
              <Button className="btn-org btn-lg w-full">View Cart</Button>
            </Link>
            <Link to="/checkout" className="w-[50%] d-block">
              <Button className="btn-org btn-border btn-lg w-full">
                Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPanel;
