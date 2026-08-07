import Button from "@mui/material/Button";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FaRegImage } from "react-icons/fa";
import { FiMessageSquare, FiUsers } from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import { IoBagCheck } from "react-icons/io5";
import { TfiWrite } from "react-icons/tfi";
import { IoMdLogOut } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import Collapse from "@mui/material/Collapse";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

const Sidebar = () => {
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const isOpenSubMenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else setSubmenuIndex(index);
  };

  const context = useContext(MyContext);
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await fetchDataFromApi("/api/user/logout");
    } finally {
      localStorage.removeItem("accesstoken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("verifyEmail");
      context.setUserData(null);
      context.setIslogin(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <div
        style={{
          width: context.isSidebarOpen ? "15%" : "0",
        }}
        className="sidebar fixed top-0 left-0 bg-white h-full border-r border-[rgba(0,0,0,0.1)] py-2 px-4 transition-all duration-300 overflow-hidden"
      >
        <div className="py-2 w-full">
          <Link to="/">
            <img
              src="https://ecme-react.themenate.net/img/logo/logo-light-full.png"
              alt=""
              className="w-[120px]"
            />
          </Link>
        </div>

        <ul className="mt-4">
          <li>
            <Link to="/">
              <Button
                className="w-full !capitalize !justify-start flex gap-3 !text-[16px] 
            !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              >
                <RxDashboard className="text-[18px]" /> <span>Dashboard</span>
              </Button>
            </Link>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 !text-[16px] 
            !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(1)}
            >
              <FaRegImage className="text-[18px]" /> <span>Home Slides</span>
              <span className="ml-auto block w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 1 ? "rotate-180" : ""}`}
                />
              </span>
            </Button>

            <Collapse in={submenuIndex === 1 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/homeSlider/list">
                    <Button
                      className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] !font-[500]
                  !pl-9 flex gap-3"
                    >
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Home Banner List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] 
                  !font-[500] !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add Home Slide",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add Home Banner Slider
                  </Button>
                </li>
                <li className="w-full">
                  <Link to="/categoryBanners/list">
                    <Button className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Category Banner List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3"
                    onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: "Add Category Banner" })}
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add Category Banner
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Link to="/users">
              <Button
                className="w-full !capitalize !justify-start flex gap-3 !text-[16px] 
            !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              >
                <FiUsers className="text-[18px]" /> <span>Users</span>
              </Button>
            </Link>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 !text-[16px] 
            !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(2)}
            >
              <RiProductHuntLine className="text-[18px]" />{" "}
              <span>Products</span>
              <span className="ml-auto block w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 2 ? "rotate-180" : ""}`}
                />
              </span>
            </Button>

            <Collapse in={submenuIndex === 2 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/products">
                    <Button
                      className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] !font-[500]
                  !pl-9 flex gap-3"
                    >
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Product List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] 
                  !font-[500] !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add Product",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Product Upload
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 !text-[16px] 
            !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(3)}
            >
              <TbCategory className="text-[18px]" /> <span>Category</span>
              <span className="ml-auto block w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 3 ? "rotate-180" : ""}`}
                />
              </span>
            </Button>

            <Collapse in={submenuIndex === 3 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/category/list">
                    <Button
                      className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] !font-[500]
                  !pl-9 flex gap-3"
                    >
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Category List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] 
                  !font-[500] !pl-9 flex gap-3 "
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add New Category",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add a category
                  </Button>
                </li>

                <li className="w-full">
                  <Link to="/subCategory/list">
                    <Button
                      className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] 
                  !font-[500] !pl-9 flex gap-3"
                    >
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Sub Category List
                    </Button>
                  </Link>
                </li>

                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] 
                  !font-[500] !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add New Subcategory",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add a sub category
                  </Button>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add Third-level Category",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add a 3-level category
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(4)}
            >
              <TfiWrite className="text-[18px]" /> <span>Blogs</span>
              <span className="ml-auto block w-[30px] h-[30px] flex items-center justify-center"><FaAngleDown className={`transition-all ${submenuIndex === 4 ? "rotate-180" : ""}`} /></span>
            </Button>
            <Collapse in={submenuIndex === 4}>
              <ul className="w-full">
                <li><Link to="/blogs"><Button className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3"><span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>Blog Post List</Button></Link></li>
                <li><Button onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: "Add Blog Post" })} className="!text-[rgba(0,0,0,0.6)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3"><span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>Add Blog Post</Button></li>
              </ul>
            </Collapse>
          </li>
          <li>
            <Link to="/sellers">
              <Button className="w-full !capitalize !justify-start flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                <MdOutlineStorefront className="text-[18px]" />
                <span>Sellers</span>
              </Button>
            </Link>
          </li>

          <li>
            <Link to="/orders">
              <Button
                className="w-full !capitalize !justify-start flex gap-3 !text-[16px] 
            !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              >
                <IoBagCheck className="text-[18px]" /> <span>Orders</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/reviews">
              <Button className="w-full !capitalize !justify-start flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                <FiMessageSquare className="text-[18px]" /> <span>Reviews</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/support">
              <Button className="w-full !capitalize !justify-start flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                <FiMessageSquare className="text-[18px]" /> <span>Support</span>
              </Button>
            </Link>
          </li>

          <li>
            <Button
              type="button"
              onClick={logout}
              className="w-full !capitalize !justify-start flex gap-3 !text-[16px] 
            !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
            >
              <IoMdLogOut className="text-[18px]" /> <span>Logout</span>
            </Button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
