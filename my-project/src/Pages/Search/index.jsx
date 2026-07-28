import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Breadcrumbs, Button, MenuItem, Pagination, Select } from "@mui/material";
import { IoGridSharp, IoSearchOutline } from "react-icons/io5";
import { LuMenu, LuPackageOpen } from "react-icons/lu";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

const PAGE_SIZE = 12;
const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const SearchPage = () => {
  const { products, catalogLoading } = useContext(MyContext);
  const [params, setParams] = useSearchParams();
  const query = params.get("q")?.trim() || "";
  const searchInputRef = useRef(null);
  const [sort, setSort] = useState("relevance");
  const [category, setCategory] = useState("");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState([]);
  const [shopLoading, setShopLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (query.length < 2) {
      Promise.resolve().then(() => {
        if (active) {
          setShops([]);
          setShopLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }
    fetchDataFromApi(`/api/seller/public?q=${encodeURIComponent(query)}`).then(
      (result) => {
        if (!active) return;
        setShops(result?.success ? result.data || [] : []);
        setShopLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [query]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.catName || product.category?.name).filter(Boolean))].sort(),
    [products],
  );

  const results = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const matched = products.filter((product) => {
      const productCategory = product.catName || product.category?.name || "";
      if (category && productCategory !== category) return false;
      const searchable = normalize([
        product.name, product.brand, productCategory, product.subCatName,
        product.thirdsubCatName, product.description,
      ].join(" "));
      return words.every((word) => searchable.includes(word));
    });

    return matched.map((product) => {
      const name = normalize(product.name);
      const phrase = normalize(query);
      const relevance = name === phrase ? 3 : name.startsWith(phrase) ? 2 : name.includes(phrase) ? 1 : 0;
      return { product, relevance };
    }).sort((a, b) => {
      if (sort === "priceAsc") return Number(a.product.price) - Number(b.product.price);
      if (sort === "priceDesc") return Number(b.product.price) - Number(a.product.price);
      if (sort === "newest") return new Date(b.product.createdAt) - new Date(a.product.createdAt);
      return b.relevance - a.relevance;
    }).map((item) => item.product);
  }, [products, query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const submit = (event) => {
    event.preventDefault();
    const nextQuery = searchInputRef.current?.value.trim() || "";
    if (!nextQuery) return;
    setParams({ q: nextQuery });
    setCategory("");
    setSort("relevance");
    setPage(1);
  };

  return (
    <section className="min-h-[520px] bg-[#f7f5f5] py-6 pb-12">
      <div className="container">
        <Breadcrumbs><Link to="/">Home</Link><span>Search</span></Breadcrumbs>

        <div className="mx-auto mt-6 max-w-[760px]">
          <form onSubmit={submit} className="relative">
            <IoSearchOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-[22px] text-gray-400" />
            <input
              key={query}
              ref={searchInputRef}
              defaultValue={query}
              autoFocus
              placeholder="Search products or shops..."
              className="h-14 w-full rounded-xl border border-gray-200 bg-white pl-14 pr-28 text-base shadow-sm outline-none transition focus:border-[#ff5252] focus:ring-2 focus:ring-red-100"
            />
            <button type="submit" className="absolute right-2 top-2 h-10 rounded-lg bg-[#ff5252] px-5 font-semibold text-white transition hover:bg-[#e74848]">Search</button>
          </form>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] md:p-5">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {query ? <>Search results for “{query}”</> : "Search products and shops"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {catalogLoading ? "Searching products..." : `${results.length} ${results.length === 1 ? "product" : "products"} found`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select size="small" value={category} displayEmpty onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="min-w-[165px]">
                <MenuItem value="">All categories</MenuItem>
                {categories.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
              </Select>
              <Select size="small" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="min-w-[170px]">
                <MenuItem value="relevance">Most relevant</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="priceAsc">Price, low to high</MenuItem>
                <MenuItem value="priceDesc">Price, high to low</MenuItem>
              </Select>
              <Button aria-label="Grid view" onClick={() => setView("grid")} className={`!h-10 !min-w-10 !rounded-lg ${view === "grid" ? "!bg-red-50 !text-[#ff5252]" : "!text-gray-500"}`}><IoGridSharp /></Button>
              <Button aria-label="List view" onClick={() => setView("list")} className={`!h-10 !min-w-10 !rounded-lg ${view === "list" ? "!bg-red-50 !text-[#ff5252]" : "!text-gray-500"}`}><LuMenu /></Button>
            </div>
          </div>

          {(shopLoading || shops.length > 0) && query && (
            <section className="mb-7 border-b border-gray-100 pb-7">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">Shops</h2>
                <p className="text-sm text-gray-500">
                  {shopLoading
                    ? "Searching shops..."
                    : `${shops.length} ${shops.length === 1 ? "shop" : "shops"} found`}
                </p>
              </div>
              {!shopLoading && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {shops.map((shop) => (
                    <Link
                      key={shop._id}
                      to={`/shop/${shop._id}`}
                      className="group flex items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-[#ff5252] hover:shadow-md"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#ff5252]">
                        {shop.storeLogo ? (
                          <img
                            src={shop.storeLogo}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full place-items-center text-2xl font-bold text-white">
                            {shop.storeName?.[0] || "S"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-gray-900 group-hover:text-[#ff5252]">
                          {shop.storeName}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                          {shop.storeDescription || "Visit this shop"}
                        </p>
                        <span className="mt-1 block text-xs font-semibold text-gray-600">
                          {shop.productCount} products
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {!query && !catalogLoading ? (
            <Empty title="Start your search" text="Enter a product name, brand, or category to find what you need." />
          ) : !catalogLoading && !visible.length ? (
            <Empty title="No products found" text={`We couldn't find products matching “${query}”. Try another keyword or category.`} />
          ) : (
            <div className={`grid gap-5 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {visible.map((product) => view === "grid"
                ? <ProductItem key={product._id} product={product} />
                : <ProductItemListView key={product._id} product={product} />)}
            </div>
          )}

          {!catalogLoading && results.length > PAGE_SIZE && (
            <div className="mt-10 flex flex-col items-center gap-2">
              <Pagination count={totalPages} page={currentPage} color="primary" onChange={(_, value) => { setPage(value); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
              <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Empty = ({ title, text }) => (
  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gradient-to-b from-gray-50 to-white px-5 text-center">
    <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#ff5252]"><LuPackageOpen size={30} /></span>
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    <p className="mt-2 max-w-[430px] text-sm text-gray-500">{text}</p>
  </div>
);

export default SearchPage;
