import { useContext } from "react";
import Button from "@mui/material/Button";
import { BsFillBagCheckFill } from "react-icons/bs";
import CartItems from "./cartItems";
import { MyContext } from "../../App";
import { Link } from "react-router-dom";

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value) || 0,
  );

const CartPage = () => {
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
    <section className="section py-10 pb-10">
      <div className="container w-[80%] max-w-[80%] flex gap-5">
        <div className="leftPart w-[70%]">
          <div className="shadow-md rounded-md bg-white">
            <div className="py-2 px-3 border-b border-[rgba(0,0,0,0.1)]">
              <h2>Your Cart</h2>
              <p className="mt-0">
                There are{" "}
                <span className="font-bold text-[#ff5252]">
                  {cartItems.length}
                </span>{" "}
                product{cartItems.length === 1 ? "" : "s"} in your cart
              </p>
            </div>

            {cartItems.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">
                Your cart is empty. Add some products to get started.
              </div>
            ) : (
              cartItems.map((item) => <CartItems key={item?._id} item={item} />)
            )}
          </div>
        </div>

        <div className="rightPart w-[30%]">
          <div className="shadow-md rounded-md bg-white p-5">
            <h3 className="pb-3">Cart Totals</h3>
            <hr />

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Subtotal</span>
              <span className="text-[#ff5252] font-bold">
                {money(subtotal)}
              </span>
            </p>

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Shipping</span>
              <span className="font-bold">Free</span>
            </p>

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Total</span>
              <span className="text-[#ff5252] font-bold">{money(total)}</span>
            </p>

            <br />
            <Link to="/checkout">
              <Button className="btn-org btn-lg w-full flex gap-2">
                <BsFillBagCheckFill className="text-[20px]" />
                Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
