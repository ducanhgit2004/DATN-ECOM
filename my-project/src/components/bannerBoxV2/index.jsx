import "./style.css";
import { Link } from "react-router-dom";

const BannerBoxV2 = ({
  image,
  info = "left",
  title = "",
  subtitle = "",
  buttonText = "MUA NGAY",
  link = "/",
}) => {
  const isRight = info === "right";
  return (
    <div className="bannerBoxV2 w-full rounded-md overflow-hidden group relative">
      <img
        src={image}
        alt={title || "Banner"}
        className="w-full h-full object-cover rounded-md transition-all duration-150 group-hover:scale-105"
      />
      <div
        className={`info absolute p-5 top-0 w-[50%] h-full z-50 flex justify-center flex-col gap-2 ${isRight ? "right-0 items-end text-right" : "left-0 items-start text-left"}`}
      >
        {subtitle && <span className="text-[14px] font-[500]">{subtitle}</span>}
        {title && <h2 className="text-[20px] font-[600]">{title}</h2>}
        <Link to={link} className="text-[16px] font-[600] !text-[#ff5252] link">
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default BannerBoxV2;
