import { useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Rating from "@mui/material/Rating";
import { Collapse } from "react-collapse";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import "./style.css";

const FilterHeading = ({ children, open, onToggle }) => <h3 className="w-full mb-3 text-[15px] font-[600] flex items-center">
  {children}<Button aria-label={`Toggle ${children}`} className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black" onClick={onToggle}>{open ? <FaAngleUp /> : <FaAngleDown />}</Button>
</h3>;

const ProductFilterSidebar = ({ categories, categoryCounts, selectedCategories, onCategoryToggle, priceBounds, priceRange, onPriceChange, selectedRating, onRatingChange, onClear, hasFilters }) => {
  const [open, setOpen] = useState({ categories: true, price: true, rating: true });
  const toggle = (key) => setOpen((current) => ({ ...current, [key]: !current[key] }));
  const priceStep = Math.max(1, Math.round((priceBounds[1] - priceBounds[0]) / 100));
  return <aside className="productFilterSidebar bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4"><h2 className="font-[700] text-[17px]">Product Filters</h2>{hasFilters && <button type="button" onClick={onClear} className="text-xs font-semibold text-[#ff5252] hover:underline">Clear all</button>}</div>
    <div className="box">
      <FilterHeading open={open.categories} onToggle={() => toggle("categories")}>Shop by Categories</FilterHeading>
      <Collapse isOpened={open.categories}><div className="scroll px-1">{categories.map((category) => <FormControlLabel key={category._id} control={<Checkbox size="small" checked={selectedCategories.includes(category._id)} onChange={() => onCategoryToggle(category._id)} />} label={<span className="flex w-full items-center justify-between gap-3 text-sm"><span>{category.name}</span><span className="text-gray-400">({categoryCounts[category._id] || 0})</span></span>} className="!m-0 w-full productFilterOption" />)}</div></Collapse>
    </div>
    <div className="box mt-5 pt-4 border-t border-gray-100">
      <FilterHeading open={open.price} onToggle={() => toggle("price")}>Filter By Price</FilterHeading>
      <Collapse isOpened={open.price}><div className="px-2"><Slider className="priceSlider" value={priceRange} onChange={(_, value) => onPriceChange(value)} valueLabelDisplay="auto" min={priceBounds[0]} max={priceBounds[1]} step={priceStep} disableSwap /><div className="flex pt-3 pb-1 priceRange"><span className="text-[12px] text-gray-500">From: <strong className="text-gray-800">${priceRange[0].toLocaleString()}</strong></span><span className="ml-auto text-[12px] text-gray-500">To: <strong className="text-gray-800">${priceRange[1].toLocaleString()}</strong></span></div></div></Collapse>
    </div>
    <div className="box mt-5 pt-4 border-t border-gray-100">
      <FilterHeading open={open.rating} onToggle={() => toggle("rating")}>Filter By Rating</FilterHeading>
      <Collapse isOpened={open.rating}><div className="space-y-1">{[5, 4, 3, 2, 1].map((rating) => <button type="button" key={rating} onClick={() => onRatingChange(selectedRating === rating ? 0 : rating)} className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 transition ${selectedRating === rating ? "bg-red-50 ring-1 ring-red-100" : "hover:bg-gray-50"}`}><span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedRating === rating ? "border-[#ff5252]" : "border-gray-300"}`}>{selectedRating === rating && <span className="w-2 h-2 rounded-full bg-[#ff5252]" />}</span><Rating value={rating} size="small" readOnly /><span className="text-xs text-gray-500">& up</span></button>)}</div></Collapse>
    </div>
  </aside>;
};

export default ProductFilterSidebar;
