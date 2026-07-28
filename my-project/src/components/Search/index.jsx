import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../Search/style.css'
import Button from '@mui/material/Button';
import { IoSearch } from "react-icons/io5";
import { MyContext } from "../../App";

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, catalogLoading } = useContext(MyContext);
  const wrapperRef = useRef(null);
  const [keyword, setKeyword] = useState(() =>
    location.pathname === "/search"
      ? new URLSearchParams(location.search).get("q") || ""
      : "",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(() => {
    const query = normalize(keyword);
    if (query.length < 2) return [];
    const words = query.split(/\s+/).filter(Boolean);

    return products
      .filter((product) => {
        const searchable = normalize([
          product.name,
          product.brand,
          product.catName || product.category?.name,
          product.subCatName,
        ].join(" "));
        return words.every((word) => searchable.includes(word));
      })
      .map((product) => {
        const name = normalize(product.name);
        const score = name === query ? 3 : name.startsWith(query) ? 2 : name.includes(query) ? 1 : 0;
        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.product);
  }, [keyword, products]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      navigate(`/product/${suggestions[activeIndex]._id}`);
      setIsOpen(false);
      return;
    }
    const query = keyword.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <form ref={wrapperRef} onSubmit={submitSearch} className="searchBox w-full h-[50px] bg-[#e5e5e5] rounded-[5px] flex items-center px-3 ml-5 relative">
      
      <input
        type="text"
        value={keyword}
        autoComplete="off"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setKeyword(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && suggestions.length) {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((index) => (index + 1) % suggestions.length);
          } else if (event.key === "ArrowUp" && suggestions.length) {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((index) => index <= 0 ? suggestions.length - 1 : index - 1);
          } else if (event.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
          }
        }}
        placeholder="Search products or shops..."
        aria-label="Search products or shops"
        aria-expanded={isOpen}
        aria-controls="product-search-suggestions"
        className="w-full bg-transparent border-none outline-none text-[15px] pr-10"
      />

      <Button type="submit" aria-label="Submit search" className="!absolute right-2 top-1/2 -translate-y-1/2 min-w-[35px] h-[35px] !rounded-full">
        <IoSearch className="text-[20px] text-black text-[22px]" />
      </Button>

      {isOpen && keyword.trim().length >= 2 && (
        <div id="product-search-suggestions" className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1000] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.16)]">
          {catalogLoading ? (
            <p className="px-4 py-5 text-center text-sm text-gray-500">Searching products...</p>
          ) : suggestions.length ? (
            <>
              <div className="max-h-[390px] overflow-y-auto py-2">
                {suggestions.map((product, index) => (
                  <button
                    type="button"
                    key={product._id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      navigate(`/product/${product._id}`);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${activeIndex === index ? "bg-red-50" : "hover:bg-gray-50"}`}
                  >
                    <img src={product.images?.[0] || "/placeholder-image.png"} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-800">{product.name}</span>
                      <span className="mt-1 block truncate text-xs text-gray-500">{product.catName || product.category?.name || product.brand || "Product"}</span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-[#ff5252]">{money(product.price)}</span>
                  </button>
                ))}
              </div>
              <button type="submit" onMouseEnter={() => setActiveIndex(-1)} className="flex w-full items-center justify-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#ff5252] hover:bg-red-50">
                <IoSearch /> View all results for “{keyword.trim()}”
              </button>
            </>
          ) : (
            <div className="px-4 py-5 text-center">
              <p className="text-sm font-semibold text-gray-700">No matching products</p>
              <button type="submit" className="mt-1 text-xs text-[#ff5252] hover:underline">Search for “{keyword.trim()}” anyway</button>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

export default Search;
