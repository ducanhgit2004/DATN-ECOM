import { useContext, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";
import { IoGridSharp } from "react-icons/io5";
import { LuMenu, LuPackageOpen } from "react-icons/lu";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import ProductFilterSidebar from "../../components/Sidebar";
import { MyContext } from "../../App";

const PAGE_SIZE = 12;
const productCategoryId = (product) => product.catId?._id || product.catId;

const ProductListing = () => {
  const { products, catData, catalogLoading } = useContext(MyContext);
  const [params, setParams] = useSearchParams();
  const [itemView, setItemView] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const categoryId = params.get("category");
  const subCategoryId = params.get("subcategory");
  const thirdCategoryId = params.get("thirdCategory");
  const [categorySelection, setCategorySelection] = useState({ source: categoryId, ids: categoryId ? [categoryId] : [], dirty: false });
  const [priceFilter, setPriceFilter] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const selectedCategories = useMemo(() => categorySelection.source === categoryId
    ? categorySelection.ids
    : categoryId ? [categoryId] : [], [categorySelection, categoryId]);

  const priceBounds = useMemo(() => {
    const prices = products.map((product) => Number(product.price) || 0);
    if (!prices.length) return [0, 1];
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return [min, max === min ? min + 1 : max];
  }, [products]);
  const priceRange = priceFilter || priceBounds;

  const categoryCounts = useMemo(() => products.reduce((counts, product) => {
    const id = productCategoryId(product);
    if (id) counts[id] = (counts[id] || 0) + 1;
    return counts;
  }, {}), [products]);

  const selectedName = useMemo(() => {
    if (selectedCategories.length > 1) return `${selectedCategories.length} Categories`;
    for (const category of catData) {
      if (category._id === categoryId) return category.name;
      for (const sub of category.children || []) {
        if (sub._id === subCategoryId) return sub.name;
        const third = (sub.children || []).find((item) => item._id === thirdCategoryId);
        if (third) return third.name;
      }
    }
    return "All Products";
  }, [catData, categoryId, subCategoryId, thirdCategoryId, selectedCategories.length]);

  const filtered = useMemo(() => {
    const list = products.filter((product) => {
      const price = Number(product.price) || 0;
      const rating = Number(product.rating) || 0;
      return (!selectedCategories.length || selectedCategories.includes(productCategoryId(product)))
        && (!subCategoryId || (product.subCatId?._id || product.subCatId) === subCategoryId)
        && (!thirdCategoryId || (product.thirdsubCatId?._id || product.thirdsubCatId) === thirdCategoryId)
        && price >= priceRange[0] && price <= priceRange[1]
        && (!selectedRating || rating >= selectedRating);
    });
    return [...list].sort((a, b) => sort === "priceAsc" ? Number(a.price) - Number(b.price) : sort === "priceDesc" ? Number(b.price) - Number(a.price) : sort === "name" ? a.name.localeCompare(b.name) : new Date(b.createdAt) - new Date(a.createdAt));
  }, [products, selectedCategories, subCategoryId, thirdCategoryId, priceRange, selectedRating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const changeCategories = (id) => {
    setCategorySelection((current) => {
      const ids = current.source === categoryId ? current.ids : categoryId ? [categoryId] : [];
      return { source: categoryId, ids: ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id], dirty: true };
    });
    setPage(1);
  };
  const clearFilters = () => {
    setParams({});
    setCategorySelection({ source: null, ids: [], dirty: true });
    setPriceFilter(null);
    setSelectedRating(0);
    setPage(1);
  };
  const hasFilters = Boolean(selectedCategories.length || priceFilter || selectedRating || subCategoryId || thirdCategoryId);

  return <section className="py-6 pb-10 bg-[#f7f5f5]"><div className="container">
    <Breadcrumbs><Link to="/">Home</Link><span>{selectedName}</span></Breadcrumbs>
    <div className="mt-5 flex flex-col lg:flex-row gap-5 items-start">
      <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0"><ProductFilterSidebar categories={catData} categoryCounts={categoryCounts} selectedCategories={selectedCategories} onCategoryToggle={changeCategories} priceBounds={priceBounds} priceRange={priceRange} onPriceChange={(value) => { setPriceFilter(value); setPage(1); }} selectedRating={selectedRating} onRatingChange={(value) => { setSelectedRating(value); setPage(1); }} onClear={clearFilters} hasFilters={hasFilters} /></div>
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden flex-1 min-w-0">
        <div className="bg-[#f5f5f5] p-2.5 mb-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1"><Button aria-label="List view" title="List view" className={`!min-w-[40px] !w-[40px] !h-[40px] !rounded-lg ${itemView === "list" ? "!bg-white !shadow-sm !text-[#ff5252]" : ""}`} onClick={() => setItemView("list")}><LuMenu /></Button><Button aria-label="Grid view" title="Grid view" className={`!min-w-[40px] !w-[40px] !h-[40px] !rounded-lg ${itemView === "grid" ? "!bg-white !shadow-sm !text-[#ff5252]" : ""}`} onClick={() => setItemView("grid")}><IoGridSharp /></Button><span className="text-sm pl-3 text-gray-600">{catalogLoading ? "Loading products..." : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}</span></div>
          <Select size="small" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="bg-white min-w-[180px]"><MenuItem value="newest">Newest</MenuItem><MenuItem value="name">Name, A to Z</MenuItem><MenuItem value="priceAsc">Price, low to high</MenuItem><MenuItem value="priceDesc">Price, high to low</MenuItem></Select>
        </div>
        {!catalogLoading && !visible.length ? <div className="min-h-[280px] rounded-xl border border-dashed border-gray-300 bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center px-5 text-center"><span className="w-16 h-16 rounded-full bg-red-50 text-[#ff5252] flex items-center justify-center mb-4"><LuPackageOpen size={30} /></span><h2 className="text-[18px] font-[600] text-gray-800">No products found</h2><p className="mt-1 text-sm text-gray-500 max-w-[390px]">No products match the selected categories, price range, and rating.</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-5 rounded-lg bg-[#ff5252] px-5 py-2.5 text-sm font-[600] text-white hover:bg-[#e74848] transition">Clear all filters</button>}</div> : <div className={`grid ${itemView === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"} gap-5`}>{visible.map((product) => itemView === "grid" ? <ProductItem key={product._id} product={product} /> : <ProductItemListView key={product._id} product={product} />)}</div>}
        {filtered.length > PAGE_SIZE && <div className="flex justify-center mt-10"><Pagination count={totalPages} page={currentPage} onChange={(_, value) => setPage(value)} /></div>}
      </div>
    </div>
  </div></section>;
};

export default ProductListing;
