import React from "react";

const Progress = ({ value = 0, type = "default" }) => {
  const color =
    type === "success"
      ? "bg-green-600"
      : type === "error"
        ? "bg-pink-800"
        : type === "warning"
          ? "bg-orange-400"
          : "bg-blue-500";

  return (
    <div className="w-[100px] overflow-hidden rounded-md bg-[#f1f1f1]">
      <span
        style={{ width: `${value}%` }}
        className={`block h-[8px] ${color}`}
      ></span>
    </div>
  );
};

export default Progress;
