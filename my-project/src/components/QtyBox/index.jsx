import React, { useState } from "react";
import Button from "@mui/material/Button";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

const QtyBox = () => {
  const [qtyVal, setQtyVal] = useState(1);

  const plusQty = () => {
    const currentValue = Number(qtyVal) || 0;
    setQtyVal(currentValue + 1);
  };

  const minusQty = () => {
    const currentValue = Number(qtyVal) || 1;

    if (currentValue > 1) {
      setQtyVal(currentValue - 1);
    }
  };

  const handleChange = (e) => {
    setQtyVal(e.target.value);
  };

  const handleBlur = () => {
    if (qtyVal === "" || Number(qtyVal) < 1) {
      setQtyVal(1);
    }
  };

  return (
    <div className="qtyBox flex items-center relative w-[70px]">
      <input
        type="number"
        min={1}
        className="w-full h-[40px] p-2 pl-5 text-[15px]
        focus:outline-none border border-[rgba(0,0,0,0.2)] rounded-md"
        value={qtyVal}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      <div className="flex items-center flex-col justify-between h-[40px] absolute top-0 right-0 z-50">
        <Button
          className="!min-w-[25px] !w-[25px] !h-[20px] !text-[#000] !rounded-none hover:!bg-[#f1f1f1]"
          onClick={plusQty}
        >
          <FaAngleUp className="text-[12px] opacity-60" />
        </Button>

        <Button
          className="!min-w-[25px] !w-[25px] !h-[20px] !text-[#000] !rounded-none hover:!bg-[#f1f1f1]"
          onClick={minusQty}
        >
          <FaAngleDown className="text-[12px] opacity-60" />
        </Button>
      </div>
    </div>
  );
};

export default QtyBox;