import { Rating } from "@mui/material";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { fetchDataFromApi } from "../../utils/api";

const Detail = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <p className="text-xs font-[600] uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-1 text-sm font-[500] text-gray-900">
      {value === "" || value === null || value === undefined ? "-" : value}
    </p>
  </div>
);

const ProductDetails = ({ product }) => {
  const [productData, setProductData] = useState(product);
  const images = productData?.images?.length
    ? productData.images
    : ["/placeholder-image.png"];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setProductData(product);
    if (!product?._id) return undefined;

    let active = true;
    const loadProduct = async () => {
      const result = await fetchDataFromApi(`/api/product/${product._id}`);
      if (active && result?.success) {
        setProductData(result.product || product);
      }
    };

    loadProduct();
    return () => {
      active = false;
    };
  }, [product?._id]);

  if (!productData)
    return (
      <div className="p-8 text-center text-gray-500">
        Product details are unavailable.
      </div>
    );

  const sizes = Array.isArray(productData.size)
    ? productData.size.join(", ")
    : productData.size;
  const weights = Array.isArray(productData.productWeight)
    ? productData.productWeight.join(", ")
    : productData.productWeight;
  const rams = Array.isArray(productData.productRam)
    ? productData.productRam.join(", ")
    : productData.productRam;
  const reviews = Array.isArray(productData.reviews) ? productData.reviews : [];

  return (
    <section className="min-h-full bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[420px_1fr]">
          <div>
            <div className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
              <img
                src={images[activeImageIndex]}
                alt={`${product.name} ${activeImageIndex + 1}`}
                className="h-full w-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() =>
                      setActiveImageIndex(
                        (index) => (index - 1 + images.length) % images.length,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-md transition hover:bg-white"
                  >
                    <IoIosArrowBack size={22} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() =>
                      setActiveImageIndex(
                        (index) => (index + 1) % images.length,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-md transition hover:bg-white"
                  >
                    <IoIosArrowForward size={22} />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-[600] text-white">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition ${activeImageIndex === index ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-300"}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-[600] ${productData.countInStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {productData.countInStock > 0 ? "In Stock" : "Out of Stock"}
            </span>
            <h1 className="mt-3 text-2xl font-[700] text-gray-900">
              {productData.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {productData.brand || "No brand"}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Rating
                value={Number(productData.rating || 0)}
                precision={0.5}
                readOnly
              />
              <span className="text-sm text-gray-500">
                {Number(productData.rating || 0).toFixed(1)} / 5
              </span>
            </div>
            <div className="mt-5 flex items-end gap-3">
              {Number(productData.oldPrice) > 0 && (
                <span className="text-lg text-gray-400 line-through">
                  ${Number(productData.oldPrice).toFixed(2)}
                </span>
              )}
              <span className="text-3xl font-[700] text-blue-600">
                ${Number(productData.price || 0).toFixed(2)}
              </span>
              {Number(productData.discount) > 0 && (
                <span className="mb-1 rounded bg-red-100 px-2 py-1 text-xs font-[600] text-red-600">
                  -{productData.discount}%
                </span>
              )}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Detail label="Category" value={productData.catName} />
              <Detail
                label="Subcategory"
                value={productData.subCatName || productData.subCat}
              />
              <Detail
                label="Third-level Category"
                value={productData.thirdsubCatName || productData.thirdsubCat}
              />
              <Detail label="Stock" value={productData.countInStock} />
              <Detail label="RAM" value={rams} />
              <Detail label="Sizes" value={sizes} />
              <Detail label="Weights" value={weights} />
              <Detail
                label="Featured"
                value={productData.isFeatured ? "Yes" : "No"}
              />
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-[700]">Product Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
            {productData.description || "No description available."}
          </p>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-[700]">Customer Reviews</h2>
            <span className="text-sm text-gray-500">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Rating
                value={Number(productData.rating || 0)}
                precision={0.5}
                readOnly
              />
              <span className="text-sm text-gray-600">
                {Number(productData.rating || 0).toFixed(1)}/5 average
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div
                  key={
                    review._id || `${review.userName || "customer"}-${index}`
                  }
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
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
                        {new Date(
                          review.createdAt || Date.now(),
                        ).toLocaleDateString()}
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
                No reviews submitted yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
