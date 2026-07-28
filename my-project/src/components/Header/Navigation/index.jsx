import { useContext, useState } from "react";
import { Button } from "@mui/material";
import { RiMenu2Fill } from "react-icons/ri";
import { LiaAngleDownSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import { GoRocket } from "react-icons/go";
import CategoryPanel from "./CategoryPanel";
import { MyContext } from "../../../App";
import "./style.css";

const categoryLink = (category, level = "category") =>
  `/productListing?${level}=${category._id}`;

const Navigation = () => {
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
  const { catData } = useContext(MyContext);

  return (
    <>
      <nav>
        <div className="container flex items-center justify-end">
          <div className="col_1 w-[20%]">
            <Button className="!text-black flex items-center gap-2 font-bold" onClick={() => setIsOpenCatPanel(true)}>
              <RiMenu2Fill className="text-[18px]" />
              <span className="font-bold">Shop By Categories</span>
              <LiaAngleDownSolid className="text-[13px] ml-auto" />
            </Button>
          </div>
          <div className="col_2 w-[65%] overflow-hidden">
            <ul className="flex items-center gap-5 nav">
              <li className="list-none"><Link to="/"><Button className="link !text-[rgba(0,0,0,0.8)] !py-4">Home</Button></Link></li>
              {catData.map((category) => (
                <li className="list-none relative" key={category._id}>
                  <Link to={categoryLink(category)}><Button className="link !text-[rgba(0,0,0,0.8)] !py-4 !whitespace-nowrap">{category.name}</Button></Link>
                  {category.children?.length > 0 && (
                    <div className="submenu absolute top-[120%] left-0 min-w-[180px] bg-white shadow-md opacity-0 transition-all z-[999]">
                      <ul>{category.children.map((sub) => (
                        <li className="list-none w-full relative" key={sub._id}>
                          <Link to={categoryLink(sub, "subcategory")}><Button className="!text-[rgba(0,0,0,0.8)] w-full !justify-start !rounded-none">{sub.name}</Button></Link>
                          {sub.children?.length > 0 && <div className="submenu absolute top-0 left-[100%] min-w-[180px] bg-white shadow-md opacity-0 transition-all z-[999]"><ul>{sub.children.map((third) => <li key={third._id}><Link to={categoryLink(third, "thirdCategory")}><Button className="!text-[rgba(0,0,0,0.8)] w-full !justify-start !rounded-none">{third.name}</Button></Link></li>)}</ul></div>}
                        </li>
                      ))}</ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="col_3 w-[15%]"><p className="text-[14px] font-[500] flex items-center gap-3 mb-0 mt-0"><GoRocket /> Free Delivery</p></div>
        </div>
      </nav>
      <CategoryPanel closeCategoryPanel={() => setIsOpenCatPanel(false)} isOpenCatPanel={isOpenCatPanel} />
    </>
  );
};

export default Navigation;
