import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductItem from "../../components/ProductItem";
import { fetchDataFromApi } from "../../utils/api";

const StorePage = () => {
  const { sellerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let active = true;
    fetchDataFromApi(`/api/seller/public/${sellerId}`).then((result) => {
      if (!active) return;
      if (result?.success) setData(result.data);
      else setError(result?.message || "Store could not be loaded.");
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [sellerId]);

  const products = useMemo(() => {
    const filtered = (data?.products || []).filter((product) =>
      `${product.name} ${product.brand} ${product.catName}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "rating") return Number(b.rating) - Number(a.rating);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [data?.products, query, sort]);

  if (loading) {
    return <div className="container py-24 text-center">Loading store...</div>;
  }
  if (error || !data?.store) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold">Store unavailable</h1>
        <p className="mt-2 text-gray-500">{error}</p>
        <Link to="/" className="mt-5 inline-block font-semibold text-[#ff5252]">
          Back to home
        </Link>
      </div>
    );
  }

  const { store } = data;
  return (
    <main className="bg-[#f7f7f7] pb-14">
      <section className="relative bg-white">
        <div
          className="h-[220px] bg-gradient-to-r from-[#fff0f0] to-[#eef2ff] bg-cover bg-center md:h-[320px]"
          style={
            store.storeCover
              ? { backgroundImage: `url("${store.storeCover}")` }
              : undefined
          }
        />
        <div className="container relative flex flex-col gap-4 pb-7 md:flex-row md:items-end">
          <div className="-mt-14 h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-[#ff5252] shadow-lg">
            {store.storeLogo ? (
              <img
                src={store.storeLogo}
                alt={`${store.storeName} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="grid h-full place-items-center text-4xl font-bold text-white">
                {store.storeName?.[0] || "S"}
              </span>
            )}
          </div>
          <div className="flex-1 md:pb-1">
            <h1 className="text-3xl font-bold text-gray-900">{store.storeName}</h1>
            <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-6 text-gray-600">
              {store.storeDescription || "Welcome to our store."}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 px-5 py-3 text-center">
            <strong className="block text-xl">{data.productCount}</strong>
            <span className="text-xs text-gray-500">Products</span>
          </div>
        </div>
      </section>

      <section className="container pt-8">
        <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Shop products</h2>
            <p className="text-sm text-gray-500">{products.length} results</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this shop..."
              className="min-w-[260px] rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-[#ff5252]"
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>

        {products.length ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductItem key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-white py-20 text-center text-gray-500">
            No products match your search.
          </div>
        )}
      </section>
    </main>
  );
};

export default StorePage;
