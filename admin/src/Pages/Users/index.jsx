import React, { useContext, useState } from "react";
import { Button } from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Progess from "../../components/ProgessBar";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";
import SearchBox from "../../components/SearchBox";
import { MyContext } from "../../App";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { MdLocalPhone } from "react-icons/md";
import { SlCalender } from "react-icons/sl";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const Users = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const id = "category-select";

  const context = useContext(MyContext);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const columns = [
    { id: "userIMG", label: "USER IMAGE", minWidth: 80 },
    { id: "userName", label: "USER NAME", minWidth: 100 },
    {
      id: "userEmail",
      label: "SUB EMAIL",
      minWidth: 150,
    },
    {
      id: "userPh",
      label: "USER PHONE NO",
      minWidth: 80,
    },
    {
      id: "createdDate",
      label: "CREATED",
      minWidth: 80,
    },
  ];
  return (
    <>
      <div className="card my-4 pt-5 shadow-md rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center w-full pl-5 justify-between pr-5">
          <div className="col w-[40%]">
            <h2 className="text-[20px] font-[600]">
              Users List{" "}
              <span className="font-[400] text-[12px]">
                (Material Ui table)
              </span>
            </h2>
          </div>

          <div className="col w-[40%] ml-auto">
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
                  <div className="flex items-center gap-4 w-[100px]">
                    <div className="img w-[45px] h-[45px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Mr Tram Tinh
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdOutlineMarkEmailRead />
                    mrtramtinh@gmail.com
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdLocalPhone />
                    13245678955
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <SlCalender />
                    14-6-2026
                  </span>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[100px]">
                    <div className="img w-[45px] h-[45px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Mr Tram Tinh
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdOutlineMarkEmailRead />
                    mrtramtinh@gmail.com
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdLocalPhone />
                    13245678955
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <SlCalender />
                    14-6-2026
                  </span>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[100px]">
                    <div className="img w-[45px] h-[45px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Mr Tram Tinh
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdOutlineMarkEmailRead />
                    mrtramtinh@gmail.com
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdLocalPhone />
                    13245678955
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <SlCalender />
                    14-6-2026
                  </span>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[100px]">
                    <div className="img w-[45px] h-[45px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Mr Tram Tinh
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdOutlineMarkEmailRead />
                    mrtramtinh@gmail.com
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdLocalPhone />
                    13245678955
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <SlCalender />
                    14-6-2026
                  </span>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[100px]">
                    <div className="img w-[45px] h-[45px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Mr Tram Tinh
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdOutlineMarkEmailRead />
                    mrtramtinh@gmail.com
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdLocalPhone />
                    13245678955
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <SlCalender />
                    14-6-2026
                  </span>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell style={{ minWidth: columns.minWidth }}>
                  <Checkbox {...label} size="small" />
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <div className="flex items-center gap-4 w-[100px]">
                    <div className="img w-[45px] h-[45px] rounded-md overflow-hidden group">
                      <Link to="/product/45745" data-discover="true">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  Mr Tram Tinh
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdOutlineMarkEmailRead />
                    mrtramtinh@gmail.com
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <MdLocalPhone />
                    13245678955
                  </span>
                </TableCell>

                <TableCell style={{ minWidth: columns.minWidth }}>
                  <span className="flex items-center gap-2">
                    <SlCalender />
                    14-6-2026
                  </span>
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

export default Users;
