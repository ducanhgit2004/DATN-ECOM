import React, { useState, PureComponent } from "react";
import {
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardBoxes from "../../components/DashboardBoxes";
import Button from "@mui/material/Button";
import { FaPlus } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";
import Badge from "../../components/Badge";
import { Collapse } from "react-collapse";
import { FaAngleUp } from "react-icons/fa6";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Progess from "../../components/ProgessBar";
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegEye } from "react-icons/fa";
import { GoTrash } from "react-icons/go";

import Pagination from "@mui/material/Pagination";
import { RechartsDevtools } from "@recharts/devtools";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const columns = [
  { id: "product", label: "PRODUCT", minWidth: 150 },
  { id: "category", label: "CATEGORY", minWidth: 100 },
  {
    id: "subcategory",
    label: "SUB CATEGORY",
    minWidth: 150,
  },
  {
    id: "price",
    label: "PRICE",
    minWidth: 80,
  },
  {
    id: "sales",
    label: "SALES",
    minWidth: 80,
  },
  {
    id: "action",
    label: "ACTION",
    minWidth: 120,
  },
];

function createData(name, code, population, size) {
  const density = population / size;
  return { name, code, population, size, density };
}

const Dashboard = () => {
  const [isOpenOrderedProduct, setIsOpenOrderedProduct] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilterVal, setcategoryFilterVal] = useState("");
  const id = "category-select";

  const handleChangeCatFilter = (event) => {
    setcategoryFilterVal(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const [chart1Data, setChart1Data] = useState([
    {
      name: "JAN",
      TotalSales: 4000,
      TotalUsers: 2400,
      amt: 2400,
    },
    {
      name: "FEB",
      TotalSales: 3000,
      TotalUsers: 1398,
      amt: 2210,
    },
    {
      name: "MARCH",
      TotalSales: 2000,
      TotalUsers: 9800,
      amt: 2290,
    },
    {
      name: "APRIL",
      TotalSales: 2780,
      TotalUsers: 3908,
      amt: 2000,
    },
    {
      name: "MAY",
      TotalSales: 1890,
      TotalUsers: 4800,
      amt: 2181,
    },
    {
      name: "JUNE",
      TotalSales: 2390,
      TotalUsers: 3800,
      amt: 2500,
    },
    {
      name: "JULY",
      TotalSales: 3490,
      TotalUsers: 4300,
      amt: 2100,
    },
    {
      name: "AUG",
      TotalSales: 3990,
      TotalUsers: 4100,
      amt: 2100,
    },
    {
      name: "SEP",
      TotalSales: 4490,
      TotalUsers: 4900,
      amt: 2100,
    },
    {
      name: "OCT",
      TotalSales: 3400,
      TotalUsers: 3000,
      amt: 2100,
    },
    {
      name: "NOV",
      TotalSales: 3300,
      TotalUsers: 4500,
      amt: 2100,
    },
    {
      name: "DEC",
      TotalSales: 3690,
      TotalUsers: 4300,
      amt: 2100,
    },
  ]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isShowOrderedProduct = (index) => {
    if (isOpenOrderedProduct === index) {
      setIsOpenOrderedProduct(null);
    } else {
      setIsOpenOrderedProduct(index);
    }
  };
  return (
    <>
      <div
        className="w-full py-2 p-5 border bg-[#f1faff] border-[rgba(0,0,0,0.1)] flex items-center
    gap-8 mb-5 justify-between rounded-md"
      >
        <div className="info">
          <h1 className="text-[30px] font-bold leading-10 mb-3">
            Good Morning,
            <br />
            Mr Tram Tinh
          </h1>

          <p>
            Here's what happening on your store today. See the statics at once
          </p>
          <br />

          <Button className="btn-blue !capitalize">
            <FaPlus />
            Add Product
          </Button>
        </div>

        <img src="manager.png" className="w-[400px]" />
      </div>
      <DashboardBoxes />

      <div className="card my-4 shadow-md rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between p-5 py-5">
          <h2 className="text-[18px] font-[600]">
            Products{" "}
            <span className="font-[400] text-[12px]">(Tailwind css table)</span>
          </h2>
        </div>

        <div className="flex items-center w-full pl-5 justify-between pr-5">
          <div className="col w-[25%]">
            <h4 className="font-[600] text-[13px] mb-2">Category By</h4>
            <Select
              className="w-[45%]"
              aria-describedby={`${id}-helper-text`}
              labelId={`${id}-label`}
              id={id}
              value={categoryFilterVal}
              label="Category"
              onChange={handleChangeCatFilter}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Men</MenuItem>
              <MenuItem value={20}>Women</MenuItem>
              <MenuItem value={30}>Kids</MenuItem>
            </Select>
          </div>

          <div className="col w-[25%] ml-auto flex items-center justify-end gap-3">
            <Button className="btn-blue !bg-green-500">Export</Button>
            <Button className="btn-blue !text-white">Add Product</Button>
          </div>
        </div>

        <div className="relative mt-4 pb-5 overflow-x-auto shadow-md rounded-lg border border-[rgba(0,0,0,0.1)]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-black uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold " width="10%">
                  {" "}
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Product
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Category
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Sub Category
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Price
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Sales
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-6 py-2">
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Fashion</td>

                <td className="px-6 py-2">Women</td>

                <td className="px-6 py-2">
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </td>

                <td className="px-6 py-2">
                  <p className="text-[14px] w-[150px]">
                    <span className="font-[600]">234 </span>
                    <span>sale</span>
                    <Progess value={20} type="warning" />
                  </p>
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="px-6 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-6 py-2">
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Fashion</td>

                <td className="px-6 py-2">Women</td>

                <td className="px-6 py-2">
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </td>

                <td className="px-6 py-2">
                  <p className="text-[14px] w-[150px]">
                    <span className="font-[600]">234 </span>
                    <span>sale</span>
                    <Progess value={20} type="warning" />
                  </p>
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="px-6 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-6 py-2">
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Fashion</td>

                <td className="px-6 py-2">Women</td>

                <td className="px-6 py-2">
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </td>

                <td className="px-6 py-2">
                  <p className="text-[14px] w-[150px]">
                    <span className="font-[600]">234 </span>
                    <span>sale</span>
                    <Progess value={20} type="warning" />
                  </p>
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="px-6 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-6 py-2">
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Fashion</td>

                <td className="px-6 py-2">Women</td>

                <td className="px-6 py-2">
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </td>

                <td className="px-6 py-2">
                  <p className="text-[14px] w-[150px]">
                    <span className="font-[600]">234 </span>
                    <span>sale</span>
                    <Progess value={20} type="warning" />
                  </p>
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="px-6 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-6 py-2">
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Fashion</td>

                <td className="px-6 py-2">Women</td>

                <td className="px-6 py-2">
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </td>

                <td className="px-6 py-2">
                  <p className="text-[14px] w-[150px]">
                    <span className="font-[600]">234 </span>
                    <span>sale</span>
                    <Progess value={20} type="warning" />
                  </p>
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="px-6 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-6 py-2">
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Fashion</td>

                <td className="px-6 py-2">Women</td>

                <td className="px-6 py-2">
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </td>

                <td className="px-6 py-2">
                  <p className="text-[14px] w-[150px]">
                    <span className="font-[600]">234 </span>
                    <span>sale</span>
                    <Progess value={20} type="warning" />
                  </p>
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="px-6 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-6 py-2">
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Fashion</td>

                <td className="px-6 py-2">Women</td>

                <td className="px-6 py-2">
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </td>

                <td className="px-6 py-2">
                  <p className="text-[14px] w-[150px]">
                    <span className="font-[600]">234 </span>
                    <span>sale</span>
                    <Progess value={20} type="warning" />
                  </p>
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end pt-5 pb-5 px-4">
          <Pagination count={10} color="primary" />
        </div>
      </div>

      <div className="card my-4 shadow-md rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between p-5 py-5">
          <h2 className="text-[18px] font-[600]">
            Products{" "}
            <span className="font-[400] text-[12px]">(Material Ui table)</span>
          </h2>
        </div>

        <div className="flex items-center w-full pl-5 justify-between pr-5">
          <div className="col w-[25%]">
            <h4 className="font-[600] text-[13px] mb-2">Category By</h4>
            <Select
              className="w-[45%]"
              aria-describedby={`${id}-helper-text`}
              labelId={`${id}-label`}
              id={id}
              value={categoryFilterVal}
              label="Category"
              onChange={handleChangeCatFilter}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Men</MenuItem>
              <MenuItem value={20}>Women</MenuItem>
              <MenuItem value={30}>Kids</MenuItem>
            </Select>
          </div>

          <div className="col w-[25%] ml-auto flex items-center justify-end gap-3">
            <Button className="btn-blue !bg-green-500">Export</Button>
            <Button className="btn-blue !text-white">Add Product</Button>
          </div>
        </div>

        <br />

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell className="bg-[#ccc]">
                  <Checkbox {...label} size="small" />
                </TableCell>

                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Fashion
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Women
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }} align="left">
                  <div className="flex flex-col items-start text-[14px]">
                    <div>
                      <span className="font-semibold">234 </span>
                      <span>sale</span>
                    </div>

                    <Progess value={20} type="warning" />
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Fashion
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Women
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }} align="left">
                  <div className="flex flex-col items-start text-[14px]">
                    <div>
                      <span className="font-semibold">234 </span>
                      <span>sale</span>
                    </div>

                    <Progess value={20} type="warning" />
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Fashion
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Women
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }} align="left">
                  <div className="flex flex-col items-start text-[14px]">
                    <div>
                      <span className="font-semibold">234 </span>
                      <span>sale</span>
                    </div>

                    <Progess value={20} type="warning" />
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Fashion
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Women
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }} align="left">
                  <div className="flex flex-col items-start text-[14px]">
                    <div>
                      <span className="font-semibold">234 </span>
                      <span>sale</span>
                    </div>

                    <Progess value={20} type="warning" />
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Fashion
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Women
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }} align="left">
                  <div className="flex flex-col items-start text-[14px]">
                    <div>
                      <span className="font-semibold">234 </span>
                      <span>sale</span>
                    </div>

                    <Progess value={20} type="warning" />
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Fashion
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Women
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }} align="left">
                  <div className="flex flex-col items-start text-[14px]">
                    <div>
                      <span className="font-semibold">234 </span>
                      <span>sale</span>
                    </div>

                    <Progess value={20} type="warning" />
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Fashion
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Women
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }} align="left">
                  <div className="flex flex-col items-start text-[14px]">
                    <div>
                      <span className="font-semibold">234 </span>
                      <span>sale</span>
                    </div>

                    <Progess value={20} type="warning" />
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[350px]">
                    <div className="img w-[65px] h-[65px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="vay2.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="info w-[75%]">
                      <h3 className="!font-[600] !text-[12px] leading-4 hover:text-[#3872fa]">
                        <Link to="/product/45745">
                          Áo sơ mi nữ phong cách đẳng cấp vjppro luxury | JUNO
                          From VietNam
                        </Link>
                      </h3>
                      <span className="text-[12px]">Fashion</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Fashion
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Women
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-start gap-1 flex-col">
                    <span
                      className="oldPrice line-through text-gray-500 text-[14px] 
                    font-[500]"
                    >
                      $60.00
                    </span>
                    <span className="price text-[#3872fa] text-[14px] font-[600]">
                      $30.00
                    </span>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }} align="left">
                  <div className="flex flex-col items-start text-[14px]">
                    <div>
                      <span className="font-semibold">234 </span>
                      <span>sale</span>
                    </div>

                    <Progess value={20} type="warning" />
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-1">
                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <FaRegEye className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>

                    <Button
                      className="!w-[35px] !h-[35px] bg-[#f1f1f1]  !min-w-[35px] !rounded-full
                    hover:!bg[#f1f1f1]"
                    >
                      <GoTrash className="text-[rgba(0,0,0,0.7)] text-[20px] " />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={10}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <div className="flex items-center justify-end pt-5 pb-5 px-4">
          <Pagination count={10} color="primary" />
        </div>
      </div>

      <div className="card my-4 shadow-md rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between p-5 py-5">
          <h2 className="text-[18px] font-[600]">Recent Orders</h2>
        </div>

        <div className="relative mt-4 pb-5 overflow-x-auto shadow-md rounded-lg border border-[rgba(0,0,0,0.1)]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-black uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold">&nbsp;</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Order Id
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Payment Id
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Products
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Name
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Phone number
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Address
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Pincode
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Total Amount
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Email
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Order Status
                </th>

                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  User Id
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-gray-300 dark:bg-gray-800 !bg-white dark:border-gray-700">
                <td className="px-6 py-4">
                  <Button
                    className="!w-[35px] !h-[35px] !min-w-[35px] 
                          !rounded-full !bg-[#f1f1f1]"
                    onClick={() => isShowOrderedProduct(0)}
                  >
                    {isOpenOrderedProduct === 0 ? (
                      <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                    ) : (
                      <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                    )}
                  </Button>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[#3872fa] font-[600]">
                    64565484454aad454841
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[#3872fa] font-[600]">PayCard</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Mr Tram Tinh</td>
                <td className="px-6 py-4">0393962476</td>
                <td className="px-6 py-4">
                  {" "}
                  <span className="block w-[400px]">
                    Thanh Hoa City ha namasdasdwqewqeqwweq asdsa
                  </span>
                </td>
                <td className="px-6 py-4">13000</td>
                <td className="px-6 py-4">29000</td>
                <td className="px-6 py-4">60.00$</td>
                <td className="px-6 py-4">nducanh69@gmail.com</td>

                <td className="px-6 py-4">
                  <Badge status="pending" />
                </td>
                <td className="px-6 py-4">
                  <span className="text-[#3872fa] font-[600]">
                    6548421231566845213
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">2026-5-27</td>
              </tr>

              {isOpenOrderedProduct === 0 && (
                <tr>
                  <td className=" pl-20" colSpan="6">
                    <div className="relative  overflow-x-auto ">
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className=" text-black uppercase bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Product Id
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Product Title
                            </th>

                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Image
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Quantity
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Price
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Sub Total
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr className="border-b dark:bg-gray-800 !bg-white dark:border-gray-700">
                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                64565484454aad454841
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                Áo thun nữ in hình.......
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src="/vay2.jpg"
                                className="w-[40px] h-[40px] object-cover rounded-md"
                              />
                            </td>
                            <td className="px-6 py-4">2</td>
                            <td className="px-6 py-4"> 60.00$</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              60.00$
                            </td>
                          </tr>

                          <tr className="border-b dark:bg-gray-800 !bg-white dark:border-gray-700">
                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                64565484454aad454841
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                Áo thun nữ in hình.......
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src="/vay2.jpg"
                                className="w-[40px] h-[40px] object-cover rounded-md"
                              />
                            </td>
                            <td className="px-6 py-4">2</td>
                            <td className="px-6 py-4"> 60.00$</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              60.00$
                            </td>
                          </tr>

                          <tr>
                            <td className="bg-[#f1f1f1]" colSpan="12"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}

              <tr className="border-b border-gray-300 dark:bg-gray-800 !bg-white dark:border-gray-700">
                <td className="px-6 py-4">
                  <Button
                    className="!w-[35px] !h-[35px] !min-w-[35px] 
                          !rounded-full !bg-[#f1f1f1]"
                    onClick={() => isShowOrderedProduct(1)}
                  >
                    {isOpenOrderedProduct === 0 ? (
                      <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                    ) : (
                      <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                    )}
                  </Button>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[#3872fa] font-[600]">
                    64565484454aad454841
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[#3872fa] font-[600]">PayCard</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Mr Tram Tinh</td>
                <td className="px-6 py-4">0393962476</td>
                <td className="px-6 py-4">
                  {" "}
                  <span className="block w-[400px]">
                    Thanh Hoa City ha namasdasdwqewqeqwweq asdsa
                  </span>
                </td>
                <td className="px-6 py-4">13000</td>
                <td className="px-6 py-4">29000</td>
                <td className="px-6 py-4">60.00$</td>
                <td className="px-6 py-4">nducanh69@gmail.com</td>

                <td className="px-6 py-4">
                  <Badge status="pending" />
                </td>
                <td className="px-6 py-4">
                  <span className="text-[#3872fa] font-[600]">
                    6548421231566845213
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">2026-5-27</td>
              </tr>

              {isOpenOrderedProduct === 1 && (
                <tr>
                  <td className=" pl-20" colSpan="6">
                    <div className="relative  overflow-x-auto ">
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className=" text-black uppercase bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Product Id
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Product Title
                            </th>

                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Image
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Quantity
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Price
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 font-semibold whitespace-nowrap"
                            >
                              Sub Total
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr className="border-b dark:bg-gray-800 !bg-white dark:border-gray-700">
                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                64565484454aad454841
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                Áo thun nữ in hình.......
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src="/vay2.jpg"
                                className="w-[40px] h-[40px] object-cover rounded-md"
                              />
                            </td>
                            <td className="px-6 py-4">2</td>
                            <td className="px-6 py-4"> 60.00$</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              60.00$
                            </td>
                          </tr>

                          <tr className="border-b dark:bg-gray-800 !bg-white dark:border-gray-700">
                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                64565484454aad454841
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                Áo thun nữ in hình.......
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src="/vay2.jpg"
                                className="w-[40px] h-[40px] object-cover rounded-md"
                              />
                            </td>
                            <td className="px-6 py-4">2</td>
                            <td className="px-6 py-4"> 60.00$</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              60.00$
                            </td>
                          </tr>

                          <tr>
                            <td className="bg-[#f1f1f1]" colSpan="12"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card my-4 shadow-md rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between p-1 py-5 pb-0">
          <h2 className="text-[18px] font-[600]">Total User & Total Sales</h2>
        </div>

        <div className="flex items-center gap-5 p-1 py-5 pt-1">
          <span className="flex items-center gap-1 text-[15px]">
            <span className="block w-[8px] h-[8px] rounded-full bg-green-600"></span>
            Total Users
          </span>
          <span className="flex items-center gap-1 text-[15px]">
            <span className="block w-[8px] h-[8px] rounded-full bg-[#7829fa]"></span>
            Total Sales
          </span>
        </div>
        <LineChart
          width={1400}
          height={500}
          data={chart1Data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="none" />

          <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 12 }} />

          <YAxis tickLine={false} tick={{ fontSize: 12 }} />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="TotalSales"
            stroke="#8884d8"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />

          <Line
            type="monotone"
            dataKey="TotalUsers"
            stroke="#82ca9d"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </div>
    </>
  );
};

export default Dashboard;
