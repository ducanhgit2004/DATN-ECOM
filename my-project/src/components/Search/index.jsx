import React from 'react'
import '../Search/style.css'
import Button from '@mui/material/Button';
import { IoSearch } from "react-icons/io5";

const Search = () => {
  return (
    <div className="searchBox w-full h-[50px] bg-[#e5e5e5] rounded-[5px] flex items-center px-3 ml-5 relative">
      
      <input
        type="text"
        placeholder="Search for products..."
        className="w-full bg-transparent border-none outline-none text-[15px] pr-10"
      />

      <Button className="!absolute right-2 top-1/2 -translate-y-1/2 min-w-[35px] h-[35px] !rounded-full">
        <IoSearch className="text-[20px] text-black text-[22px]" />
      </Button>

    </div>
  )
}

export default Search;