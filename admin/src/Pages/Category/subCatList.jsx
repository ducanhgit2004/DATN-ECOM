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
import Badge from "../../components/Badge";
import Chip from "@mui/material/Chip";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const SubCategoryList = () => {
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
    { id: "image", label: "CATEGORY IMAGE", minWidth: 250 },
    { id: "catName", label: "CATEGORY NAME", minWidth: 250 },
    { id: "subCatName", label: "SUB CATEGORY NAME", minWidth: 400 },
    { id: "action", label: "Action", minWidth: 100 },
  ];
  return (
    <>
      <div className="flex items-center justify-between px-2 py-0 mt-3">
        <h2 className="text-[20px] font-[600]">
          Sub Category List{" "}
          <span className="font-[400] text-[12px]">(Material Ui table)</span>
        </h2>

        <div className="col w-[25%] ml-auto flex items-center justify-end gap-3">
          <Button className="btn-blue !bg-green-500">Export</Button>
          <Button
            className="btn-blue !text-white"
            onClick={() =>
              context.setIsOpenFullScreenPanel({
                open: true,
                model: "Add New Sub Category",
              })
            }
          >
            Add New Sub Category
          </Button>
        </div>
      </div>
      <div className="card my-4 pt-5 shadow-md rounded-lg border border-gray-200 bg-white">
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell width={60} className="bg-[#ccc]">
                  <Checkbox {...label} size="small" />
                </TableCell>

                {columns.map((column) => (
                  <TableCell
                    width={column.minWidth}
                    key={column.id}
                    align={column.align}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell width={100}>
                  <div className="flex items-center gap-4 w-[80px]">
                    <div className="img w-[full] h-auto rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqWuPAmmy3ADWPfH9JqeIXu1vMAxzS3kL1iQ&s"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Chip label="Fashion" />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Chip label="Man" color="primary" />
                    <Chip label="Woman" color="primary" />
                    <Chip label="Kids" color="primary" />
                  </div>
                </TableCell>

                <TableCell width={100}>
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

export default SubCategoryList;
