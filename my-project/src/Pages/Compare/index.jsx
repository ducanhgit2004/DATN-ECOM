import { useContext } from "react";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { IoGitCompareOutline } from "react-icons/io5";
import { MyContext } from "../../App";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const options = (product) =>
  [
    ...(product.size || []),
    ...(product.productRam || []),
    ...(product.productWeight || []),
  ].filter(Boolean);

const ComparePage = () => {
  const context = useContext(MyContext);
  const products = context.compareItems || [];

  if (context.catalogLoading && context.compareIds?.length) {
    return (
      <div className="container min-h-[560px] py-24 text-center text-gray-500">
        Loading products to compare...
      </div>
    );
  }

  if (!products.length) {
    return (
      <section className="min-h-[560px] bg-[#f7f5f5] py-16">
        <div className="container">
          <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-red-50 text-[#ff5252]">
              <IoGitCompareOutline size={38} />
            </span>
            <h1 className="mt-5 text-2xl font-bold">No products to compare</h1>
            <p className="mt-2 text-sm text-gray-500">
              Add up to four products and compare their prices, ratings,
              inventory and available options side by side.
            </p>
            <Link to="/productListing" className="mt-6 rounded-lg bg-[#ff5252] px-6 py-3 font-semibold text-white">
              Browse products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const rows = [
    ["Price", (product) => <strong className="text-[#ff5252]">{money(product.price)}</strong>],
    ["Old price", (product) => Number(product.oldPrice) > Number(product.price) ? <span className="line-through text-gray-400">{money(product.oldPrice)}</span> : "—"],
    ["Discount", (product) => Number(product.discount) ? `${product.discount}%` : "—"],
    ["Brand", (product) => product.brand || "—"],
    ["Category", (product) => product.catName || product.category?.name || "—"],
    ["Rating", (product) => <div className="flex items-center justify-center gap-2"><Rating value={Number(product.rating) || 0} size="small" readOnly /><span>{Number(product.rating || 0).toFixed(1)}</span></div>],
    ["Stock", (product) => Number(product.countInStock) > 0 ? `${product.countInStock} available` : <span className="text-red-600">Out of stock</span>],
    ["Options", (product) => options(product).length ? options(product).join(", ") : "—"],
    ["Shop", (product) => product.sellerId ? <Link className="font-semibold text-[#ff5252]" to={`/shop/${product.sellerId?._id || product.sellerId}`}>Visit shop</Link> : "NovaCart"],
  ];

  return (
    <section className="min-h-[560px] bg-[#f7f5f5] py-8 pb-14">
      <div className="container">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Compare products</h1>
            <p className="text-sm text-gray-500">{products.length} of 4 products selected</p>
          </div>
          <Button color="error" variant="outlined" onClick={context.clearCompare}>
            Clear all
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] table-fixed border-collapse">
            <thead>
              <tr>
                <th className="w-36 border-b border-r border-gray-200 bg-gray-50 p-4 text-left text-sm text-gray-500">
                  Product
                </th>
                {products.map((product) => (
                  <th key={product._id} className="relative border-b border-r border-gray-200 p-5 align-top last:border-r-0">
                    <button
                      type="button"
                      aria-label={`Remove ${product.name}`}
                      onClick={() => context.removeFromCompare(product._id)}
                      className="absolute right-3 top-3 text-xl text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                    <Link to={`/product/${product._id}`}>
                      <img src={product.images?.[0] || "/placeholder-image.png"} alt={product.name} className="mx-auto h-44 w-44 rounded-xl object-cover" />
                      <h2 className="mt-4 line-clamp-2 text-base font-bold text-gray-900">{product.name}</h2>
                    </Link>
                    {product.inventoryType && product.inventoryType !== "none" ? (
                      <Button component={Link} to={`/product/${product._id}`} className="btn-org !mt-4">
                        Select options
                      </Button>
                    ) : (
                      <Button
                        disabled={Number(product.countInStock) <= 0}
                        onClick={() => context.addToCart(product._id)}
                        className="btn-org !mt-4"
                      >
                        Add to cart
                      </Button>
                    )}
                  </th>
                ))}
                {Array.from({ length: 4 - products.length }, (_, index) => (
                  <th key={`empty-${index}`} className="border-b border-r border-gray-200 p-5 last:border-r-0">
                    <Link to="/productListing" className="mx-auto grid h-44 w-44 place-items-center rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-[#ff5252] hover:text-[#ff5252]">
                      + Add product
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, render]) => (
                <tr key={label}>
                  <th className="border-b border-r border-gray-200 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-700">{label}</th>
                  {products.map((product) => (
                    <td key={product._id} className="border-b border-r border-gray-200 p-4 text-center text-sm text-gray-600 last:border-r-0">{render(product)}</td>
                  ))}
                  {Array.from({ length: 4 - products.length }, (_, index) => (
                    <td key={`empty-${index}`} className="border-b border-r border-gray-200 p-4 last:border-r-0">—</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparePage;
