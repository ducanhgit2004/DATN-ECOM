import React, { useState } from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider'
import Rating from '@mui/material/Rating';

import { Collapse } from 'react-collapse'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa6'
import "../Sidebar/style.css"

const Sidebar = () => {
  const [isOpenCategoryFilter, setIsOpenCategoryFilter] = useState(true)
  const [isOpenAvailFilter, setIsOpenAvailFilter] = useState(true)
  const [isOpenSizeFilter, setIsOpenSizeFilter] = useState(true)
  const [price, setPrice] = useState([100, 100000])

  const handlePriceChange = (event, newValue) => {
    setPrice(newValue)
  }

  return (
    <aside className='sidebar py-5'>
      <div className='box'>
        <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
          Shop by Categories

          <Button
            className='!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black'
            onClick={() => setIsOpenCategoryFilter(!isOpenCategoryFilter)}
          >
            {isOpenCategoryFilter ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </h3>

        <Collapse isOpened={isOpenCategoryFilter}>
          <div className='scroll px-4 relative -left-[13px]'>
            <FormControlLabel control={<Checkbox size="small" />} label="Fashion" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Electronics" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Bags" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Footwear" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Groceries" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Beauty" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Wellness" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Jewellery" className='w-full' />
          </div>
        </Collapse>
      </div>

      <div className='box mt-3'>
        <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
          Availability

          <Button
            className='!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black'
            onClick={() => setIsOpenAvailFilter(!isOpenAvailFilter)}
          >
            {isOpenAvailFilter ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </h3>

        <Collapse isOpened={isOpenAvailFilter}>
          <div className='scroll px-4 relative -left-[13px]'>
            <FormControlLabel control={<Checkbox size="small" />} label="Available (17)" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="In stock (10)" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Not available (1)" className='w-full' />
          </div>
        </Collapse>
      </div>

      <div className='box mt-3'>
        <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
          Size

          <Button
            className='!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black'
            onClick={() => setIsOpenSizeFilter(!isOpenSizeFilter)}
          >
            {isOpenSizeFilter ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </h3>

        <Collapse isOpened={isOpenSizeFilter}>
          <div className='scroll px-4 relative -left-[13px]'>
            <FormControlLabel control={<Checkbox size="small" />} label="Small (17)" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Medium (10)" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="Large (1)" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="XL" className='w-full' />
            <FormControlLabel control={<Checkbox size="small" />} label="XXL" className='w-full' />
          </div>
        </Collapse>
      </div>

      <div className='box mt-4'>
        <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
          Filter By Price
        </h3>

        <div className="px-2">
          <Slider className='priceSlider'
            value={price}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={1}
            max={1000}
            step={10}
            
          />

          <div className="flex pt-4 pb-2 priceRange">
            <span className='text-[13px]'>
              From: <strong className='text-dark'>$ {price[0].toLocaleString()}</strong>
            </span>

            <span className='ml-auto text-[13px]'>
              To: <strong className='text-dark'>$ {price[1].toLocaleString()}</strong>
            </span>
          </div>
        </div>
      </div>


      <div className='box mt-4'>
        <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
          Filter By Rating
        </h3>
      <div className='w-full'>
        <Rating name="size-small" defaultValue={5} size="small" readOnly/>
      </div>
      <div className='w-full'>
        <Rating name="size-small" defaultValue={4} size="small" readOnly/>
      </div>
      <div className='w-full'>
        <Rating name="size-small" defaultValue={3} size="small" readOnly/>
      </div>
      <div className='w-full'>
        <Rating name="size-small" defaultValue={2} size="small" readOnly/>
      </div>
      <div className='w-full'>
        <Rating name="size-small" defaultValue={1} size="small" readOnly/>
      </div>
       

       </div> 


    </aside>
  )
}

export default Sidebar