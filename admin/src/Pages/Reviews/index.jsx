import { useContext, useEffect, useMemo, useState } from "react";
import Rating from "@mui/material/Rating";
import { deleteData, fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";

const Reviews = () => {
  const context = useContext(MyContext);
  const [reviews, setReviews] = useState([]);
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    fetchDataFromApi("/api/product/admin/reviews").then((result) => {
      if (result?.success) setReviews(result.data || []);
      else context.alertBox("error", result?.message || "Unable to load reviews.");
      setLoading(false);
    });
    // This page loads once; context is intentionally not a refetch trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesRating = rating === "all" || Number(review.rating) === Number(rating);
      const text = `${review.productName} ${review.sellerName} ${review.userName} ${review.userEmail} ${review.comment}`.toLowerCase();
      return matchesRating && (!needle || text.includes(needle));
    });
  }, [reviews, query, rating]);

  const removeReview = async (review) => {
    if (!window.confirm("Delete this review permanently?")) return;
    setDeleting(review._id);
    const result = await deleteData(`/api/product/admin/reviews/${review.productId}/${review._id}`);
    if (result?.success) {
      setReviews((current) => current.filter((item) => item._id !== review._id));
      context.alertBox("success", result.message);
    } else context.alertBox("error", result?.message || "Unable to delete review.");
    setDeleting("");
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Review Management</h1>
          <p className="text-sm text-gray-500">View and moderate every product review.</p>
        </div>
        <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-[#ff5252]">{filtered.length} reviews</span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px]">
        <input className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-[#ff5252]" placeholder="Search product, seller, or customer..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="rounded-lg border border-gray-300 bg-white px-4 py-2.5" value={rating} onChange={(event) => setRating(event.target.value)}>
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
        </select>
      </div>
      {loading ? <div className="py-16 text-center text-gray-500">Loading reviews...</div> : filtered.length ? (
        <div className="mt-5 space-y-3">
          {filtered.map((review) => (
            <article key={review._id} className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-[64px_1fr_auto]">
              <img src={review.productImage} alt="" className="h-16 w-16 rounded-lg bg-gray-100 object-cover" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><strong>{review.productName}</strong><span className="text-xs text-gray-500">Seller: {review.sellerName}</span></div>
                <div className="mt-1 flex flex-wrap items-center gap-2"><Rating value={Number(review.rating)} readOnly size="small" /><span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span></div>
                <p className="mt-2 text-sm leading-6 text-gray-700">{review.comment}</p>
                <p className="mt-1 text-xs text-gray-500">By {review.userName || "Customer"} {review.userEmail ? `(${review.userEmail})` : ""}</p>
                {review.sellerReply && <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"><b>Seller reply:</b> {review.sellerReply}</div>}
              </div>
              <button type="button" disabled={deleting === review._id} onClick={() => removeReview(review)} className="self-start rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">{deleting === review._id ? "Deleting..." : "Delete"}</button>
            </article>
          ))}
        </div>
      ) : <div className="py-16 text-center text-gray-500">No reviews match the current filters.</div>}
    </section>
  );
};

export default Reviews;
