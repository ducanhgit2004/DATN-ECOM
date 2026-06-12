import React, { useContext, useState } from "react";
import { Button } from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Progess from "../../components/ProgessBar";
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegEye } from "react-icons/fa";
import { GoTrash } from "react-icons/go";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import SearchBox from "../../components/SearchBox";
import { MyContext } from "../../App";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const Products = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilterVal, setcategoryFilterVal] = useState("");
  const id = "category-select";

  const context = useContext(MyContext);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeCatFilter = (event) => {
    setcategoryFilterVal(event.target.value);
  };

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
  return (
    <>
      <div className="flex items-center justify-between px-2 py-0 mt-3">
        <h2 className="text-[20px] font-[600]">
          Products{" "}
          <span className="font-[400] text-[12px]">(Material Ui table)</span>
        </h2>

        <div className="col w-[25%] ml-auto flex items-center justify-end gap-3">
          <Button className="btn-blue !bg-green-500">Export</Button>
          <Button
            className="btn-blue !text-white"
            onClick={() =>
              context.setIsOpenFullScreenPanel({
                open: true,
                model: "Add Product",
              })
            }
          >
            Add Product
          </Button>
        </div>
      </div>
      <div className="card my-4 pt-5 shadow-md rounded-lg border border-gray-200 bg-white">
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

          <div className="col w-[25%] ml-auto">
            <SearchBox />
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
    </>
  );
};

export default Products;
