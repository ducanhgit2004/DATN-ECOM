import React from "react";
import { FaRegImages } from "react-icons/fa";

const UploadBox = (props) => {
  return (
    <div
      className="uploadBox p-3 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.2)]
      h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col
      relative"
    >
      <FaRegImages className="text-[40px] opacity-35" />
      <h4 className="text-[14px]">Image Upload</h4>

      <input
        type="file"
        multiple={props.multiple ?? false}
        className="absolute top-0 left-0 w-full h-full opacity-0"
      />
    </div>
  );
};

export default UploadBox;
