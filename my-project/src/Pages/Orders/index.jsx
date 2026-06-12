import React, { useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import Button from "@mui/material/Button";
import { FaAngleDown } from "react-icons/fa6";
import Badge from "../../components/Badge";
import { Collapse } from "react-collapse";
import { FaAngleUp } from "react-icons/fa6";

const Orders = () => {
  const [isOpenOrderedProduct, setIsOpenOrderedProduct] = useState(null);

  const isShowOrderedProduct = (index) => {
    if (isOpenOrderedProduct === index) {
      setIsOpenOrderedProduct(null);
    } else {
      setIsOpenOrderedProduct(index);
    }
  };
  return (
    <section className="py-10 w-full">
      <div className="container flex gap-5">
        <div className="col1 w-[20%]">
          <AccountSidebar />
        </div>

        <div className="col2 w-[70%]">
          <div className="shadow-md rounded-md bg-white">
            <div className="py-2 px-3 border-b border-[rgba(0,0,0,0.1)]">
              <h2>My Orders</h2>
              <p className="!mt-0">
                There are <span className="font-bold text-[#ff5252]">2</span>{" "}
                Orders
              </p>
              <div className="relative mt-4 overflow-x-auto shadow-md rounded-lg border border-[rgba(0,0,0,0.1)]">
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
                        <span className="text-[#ff5252]">
                          64565484454aad454841
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#ff5252]">PayCard</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        Mr Tram Tinh
                      </td>
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
                        <span className="text-[#ff5252]">
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
                                  <td
                                    className="bg-[#f1f1f1]"
                                    colSpan="12"
                                  ></td>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Orders;
