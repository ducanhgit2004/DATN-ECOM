import { useContext } from "react";
import { Link } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import Rating from "@mui/material/Rating";
import { Button } from "@mui/material";
import { MyContext } from "../../App";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const MyListItems = ({ item }) => {
  const { removeFromMyList, addToCart } = useContext(MyContext);

  return (
    <article className="w-full p-4 flex items-start gap-4 border-b border-gray-100 last:border-b-0">
      <div className="w-[100px] h-[130px] sm:w-[120px] sm:h-[145px] shrink-0 rounded-lg overflow-hidden bg-gray-50">
        <Link to={`/product/${item.productId}`} className="group block h-full">
          <img
            src={item.image || "/placeholder-image.png"}
            alt={item.productTitle}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-all"
          />
        </Link>
      </div>

      <div className="min-w-0 flex-1 relative pr-8">
        <button
          type="button"
          aria-label={`Remove ${item.productTitle} from My List`}
          onClick={() => removeFromMyList(item._id)}
          className="absolute top-0 right-0 text-gray-500 hover:text-[#ff5252] transition-colors"
        >
          <IoCloseSharp size={23} />
        </button>
        <span className="text-[13px] text-gray-500">{item.brand}</span>
        <h3 className="text-[16px] font-medium truncate">
          <Link to={`/product/${item.productId}`} className="link">
            {item.productTitle}
          </Link>
        </h3>

        <Rating value={Number(item.rating) || 0} size="small" readOnly />

        <div className="flex flex-wrap items-center gap-3 mt-2 mb-3">
          <span className="font-semibold text-[15px]">{money(item.price)}</span>
          {Number(item.oldPrice) > Number(item.price) && (
            <span className="line-through text-gray-400 text-[14px]">
              {money(item.oldPrice)}
            </span>
          )}
          {Number(item.discount) > 0 && (
            <span className="text-[#ff5252] font-semibold text-[13px]">
              {item.discount}% OFF
            </span>
          )}
        </div>

        <Button
          className="btn-org btn-sm"
          onClick={() => addToCart(item.productId)}
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
};

export default MyListItems;
