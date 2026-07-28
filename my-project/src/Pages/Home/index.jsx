import React, { useContext } from "react";
import HomeSlider from "../../components/HomeSlider";
import HomeCatSlider from "../../components/HomeCatSlider";
import AdsBannerSlider from "../../components/AdsBannerSlider";
import { LiaShippingFastSolid } from "react-icons/lia";
import ProductsSlider from "../../components/ProductsSlider";
import BlogSection from "../../components/BlogSection";
import HomeBannerV2 from "../../components/HomeSliderV2";
import HeroSideBanners from "../../components/HeroSideBanners";
import AdsBannerSliderV2 from "../../components/AdsBannerSliderV2";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { MyContext } from "../../App";

const Home = () => {
  const [value, setValue] = React.useState(0);
  const { catData, products } = useContext(MyContext);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <HomeSlider />

      <section className="py-6">
        <div className="container flex gap-5">
          <div className="part1 flex-[72] min-w-0">
            <HomeBannerV2 />
          </div>

          <div className="part2 flex-[28] min-w-0 flex items-center gap-5 justify-between flex-col">
            <HeroSideBanners />
          </div>
        </div>
      </section>

      <HomeCatSlider />

      <section className="bg-white py-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="leftSec">
              <h2 className="text-[22px] font-[600]">Popular Products</h2>
              <p className="text-[14px] font-[500]">
                Do not miss the current offers until the end of March
              </p>
            </div>

            <div className="rightSec w-[60%]">
              <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                <Tab label="All" />
                {catData.map((category) => (
                  <Tab key={category._id} label={category.name} />
                ))}
              </Tabs>
            </div>
          </div>

          <ProductsSlider
            items={6}
            products={
              value === 0
                ? products
                : products.filter(
                    (product) => product.catId === catData[value - 1]?._id,
                  )
            }
          />
        </div>
      </section>

      <section className="py-4 pt-2 bg-white ">
        <div className="container">
          <div
            className="freeShipping w-[80%] m-auto py-4 p-4 border-2 border-[#ff5252] flex items-center
           justify-between rounded-md mb-7"
          >
            <div className="col1 flex items-center gap-4">
              <LiaShippingFastSolid className="text-[45px]" />
              <span className="text-[20px] font-[600] uppercase">
                Free Shipping
              </span>
            </div>

            <div className="col2">
              <p className="mb-0 font-[500]">
                Free shipping on your first order and over $50.00
              </p>
            </div>

            <p className="font-bold !text-[25px]">- Only $200*</p>
          </div>

          <AdsBannerSliderV2 items={4} />
        </div>
      </section>

      <section className="py-5 pt-0 bg-white">
        <div className="container">
          <h2 className="text-[20px] font-[600]">Latest Products</h2>
          <ProductsSlider
            items={6}
            products={[...products]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 12)}
          />

          <AdsBannerSlider items={3} placement="latest-products" />
        </div>
      </section>

      <section className="py-5 pt-0 bg-white">
        <div className="container">
          <h2 className="text-[20px] font-[600]">Featured Products</h2>
          <ProductsSlider
            items={6}
            products={products.filter((product) => product.isFeatured)}
          />

          <AdsBannerSlider items={3} placement="featured-products" />
        </div>
      </section>

      <BlogSection />
    </>
  );
};

export default Home;
