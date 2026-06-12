import React, { useState } from "react";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const AddProduct = () => {
  const [productCat, setProductCat] = React.useState("");

  const handleChangeProductCat = (event) => {
    setProductCat(event.target.value);
  };
  return (
    <section className="p-5">
      <form className="form">
        <div className="grid grid-cols-1 mb-3">
          <div className="col">
            <h3 className="text-[14px] font-[500] mb-1">Product Name</h3>
            <input
              type="text"
              className="w-full h-[40px] border border-[rgba(0,0,0,0.1)] 
            focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 mb-3">
          <div className="col">
            <h3 className="text-[14px] font-[500] mb-1">Product Description</h3>
            <textarea
              type="text"
              className="w-full h-[140px] border border-[rgba(0,0,0,0.1)] 
            focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 mb-3">
          <div className="col">
            <h3 className="text-[14px] font-[500] mb-1">Product Category</h3>
            <Select
              labelId="demo-simple-select-label"
              id="productCatDrop"
              size="small"
              className="w-full"
              value={productCat}
              label="Category"
              onChange={handleChangeProductCat}
            >
              <MenuItem value={null}>None</MenuItem>
              <MenuItem value={10}>Fashion</MenuItem>
              <MenuItem value={20}>Beauty</MenuItem>
              <MenuItem value={30}>Wellness</MenuItem>
            </Select>
          </div>
        </div>
      </form>
    </section>
  );
};

export default AddProduct;
