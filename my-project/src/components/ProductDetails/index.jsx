import { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import QtyBox from "../QtyBox";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";
import { Link } from "react-router-dom";

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value) || 0,
  );
const cleanOptions = (value) =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .map((item) => (typeof item === "string" ? item.trim() : item))
    .filter((item) => item !== null && item !== undefined && item !== "");

const ProductDetailsComponent = ({ product }) => {
  const context = useContext(MyContext);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [productData, setProductData] = useState(product);
  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Keep the quick-view component in sync when a different product is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProductData(product);
  }, [product]);

  if (!productData)
    return (
      <div className="py-10 text-gray-500">
        Product information is unavailable.
      </div>
    );
  const sizes = cleanOptions(productData.size);
  const ramOptions = cleanOptions(productData.productRam);
  const weightOptions = cleanOptions(productData.productWeight);
  const hasOldPrice =
    Number(productData.oldPrice) > Number(productData.price) &&
    Number(productData.oldPrice) > 0;
  const trackedVariants = Array.isArray(productData.inventoryVariants)
    ? productData.inventoryVariants.filter((item) => item?.value)
    : [];
  const requiresVariant =
    productData.inventoryType &&
    productData.inventoryType !== "none" &&
    trackedVariants.length > 0;
  const selectedVariantData = trackedVariants.find(
    (item) => item.value === selectedVariant,
  );
  const availableStock =
    requiresVariant && selectedVariantData
      ? Number(selectedVariantData.stock || 0)
      : Number(productData.countInStock || 0);
  const variantLabel =
    productData.inventoryType === "ram"
      ? "RAM"
      : productData.inventoryType === "weight"
        ? "Weight"
        : "Size";
  const reviews = Array.isArray(productData.reviews) ? productData.reviews : [];

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!context?.isLogin) {
      context?.alertBox?.("error", "Please login to leave a review.");
      return;
    }

    if (!draftComment.trim()) {
      context?.alertBox?.("error", "Please write a short review comment.");
      return;
    }

    setSubmittingReview(true);

    try {
      const result = await postData(`/api/product/${productData._id}/reviews`, {
        rating: draftRating,
        comment: draftComment.trim(),
      });

      if (result?.success) {
        setProductData((prev) => ({
          ...prev,
          rating: result.product?.rating ?? prev?.rating,
          reviews: Array.isArray(result.product?.reviews)
            ? result.product.reviews
            : prev?.reviews || [],
        }));
        setDraftComment("");
        setDraftRating(5);
        context?.alertBox?.("success", "Review submitted successfully.");
      } else {
        context?.alertBox?.(
          "error",
          result?.message || "Unable to submit review.",
        );
      }
    } catch {
      context?.alertBox?.("error", "Unable to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <h1 className="text-[25px] font-[700] mb-2">{productData.name}</h1>
      <div className="flex items-center gap-3">
        {productData.brand?.trim() && (
          <span className="text-gray-500">
            Brand: <b className="text-black">{productData.brand}</b>
          </span>
        )}
        <Rating value={Number(productData.rating) || 0} size="small" readOnly />
      </div>
      {productData.sellerId && (
        <Link
          to={`/shop/${productData.sellerId?._id || productData.sellerId}`}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-[600] text-gray-700 transition hover:border-[#ff5252] hover:text-[#ff5252]"
          onClick={() => context?.setOpenProductDetailsModal?.(false)}
        >
          Visit seller shop
          <span aria-hidden="true">→</span>
        </Link>
      )}
      <div className="flex items-center gap-4 mt-4">
        {hasOldPrice && (
          <span className="line-through text-gray-500 text-[20px]">
            {money(productData.oldPrice)}
          </span>
        )}
        <span className="text-[#ff5252] font-[600] text-[20px]">
          {money(productData.price)}
        </span>
        <span
          className={availableStock > 0 ? "text-green-600" : "text-red-600"}
        >
          {availableStock > 0 ? `${availableStock} in stock` : "Out of stock"}
        </span>
      </div>
      <p className="mt-4 mb-5 whitespace-pre-line">{productData.description}</p>
      {requiresVariant && (
        <div className="flex items-center gap-3">
          <span>{variantLabel}:</span>
          <div className="flex flex-wrap gap-2">
            {trackedVariants.map((variant) => (
              <Button
                key={variant.value}
                disabled={Number(variant.stock) <= 0}
                variant={
                  selectedVariant === variant.value ? "contained" : "outlined"
                }
                onClick={() => setSelectedVariant(variant.value)}
              >
                {variant.value} ({variant.stock})
              </Button>
            ))}
          </div>
        </div>
      )}
      {!requiresVariant && sizes.length > 0 && (
        <div className="flex items-center gap-3">
          <span>Size:</span>
          <div className="flex gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={selectedSize === size ? "contained" : "outlined"}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}
      {!requiresVariant && ramOptions.length > 0 && (
        <p className="mt-4 text-sm">
          <b>RAM:</b> {ramOptions.join(", ")}
        </p>
      )}
      {!requiresVariant && weightOptions.length > 0 && (
        <p className="mt-2 text-sm">
          <b>Weight:</b> {weightOptions.join(", ")}
        </p>
      )}
      {requiresVariant && !selectedVariant && (
        <p className="mt-3 text-sm text-orange-600">
          Please select a {variantLabel.toLowerCase()} option.
        </p>
      )}
      <div className="flex items-center gap-4 mt-6">
        <div className="w-[70px]">
          <QtyBox value={quantity} onChange={setQuantity} />
        </div>
        <Button
          disabled={
            availableStock <= 0 || (requiresVariant && !selectedVariant)
          }
          className="btn-org flex gap-2"
          onClick={() => {
            const variantValue = requiresVariant
              ? selectedVariant
              : productData.inventoryType === "ram"
                ? selectedSize || productData.productRam?.[0] || ""
                : productData.inventoryType === "weight"
                  ? selectedSize || productData.productWeight?.[0] || ""
                  : selectedSize;

            context?.addToCart?.(productData._id, {
              size: variantValue,
              quantity,
            });
          }}
        >
          <MdOutlineShoppingCart /> Add to Cart
        </Button>
      </div>
      <button
        type="button"
        disabled={context?.myListItems?.some(
          (item) => item.productId === productData._id,
        )}
        onClick={() => context?.addToMyList?.(productData)}
        className="flex items-center gap-2 mt-6 font-[500] hover:text-[#ff5252] disabled:text-[#ff5252] disabled:cursor-default transition-colors"
      >
        <FaRegHeart />
        {context?.myListItems?.some(
          (item) => item.productId === productData._id,
        )
          ? "Added to My List"
          : "Add to Wishlist"}
      </button>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex rounded-full bg-gray-100 p-1 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === "description" ? "bg-white text-[#ff5252] shadow-sm" : "text-gray-600"}`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === "reviews" ? "bg-white text-[#ff5252] shadow-sm" : "text-gray-600"}`}
          >
            Reviews
          </button>
        </div>

        <div className="mt-5">
          {activeTab === "description" ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-lg font-[700] text-gray-900">
                Product Description
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                {productData.description || "No description available."}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-lg font-[700] text-gray-900">
                    Customer Reviews
                  </h3>
                  <p className="text-sm text-gray-500">
                    {reviews.length} review{reviews.length === 1 ? "" : "s"} •
                    average {Number(productData.rating || 0).toFixed(1)}/5
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Rating
                    value={Number(productData.rating || 0)}
                    precision={0.5}
                    readOnly
                  />
                  <span className="text-sm font-[600] text-gray-700">
                    {Number(productData.rating || 0).toFixed(1)}/5
                  </span>
                </div>
              </div>

              <form
                onSubmit={handleSubmitReview}
                className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-[600] text-gray-700">
                    Your rating
                  </span>
                  <Rating
                    name="review-rating"
                    value={draftRating}
                    onChange={(_, value) => setDraftRating(value || 5)}
                  />
                </div>
                <textarea
                  value={draftComment}
                  onChange={(event) => setDraftComment(event.target.value)}
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                  className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff5252]"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    Reviews will be visible to the admin and other customers.
                  </p>
                  <Button
                    type="submit"
                    variant="contained"
                    className="!bg-[#ff5252] !text-white"
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>

              <div className="mt-5 space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div
                      key={
                        review._id ||
                        `${review.userName || "customer"}-${index}`
                      }
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-[600] text-gray-900">
                            {review.userName || "Customer"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.userEmail || ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Rating
                            value={Number(review.rating || 0)}
                            readOnly
                            size="small"
                          />
                          <span>
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    No reviews yet. Be the first to leave one.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailsComponent;
