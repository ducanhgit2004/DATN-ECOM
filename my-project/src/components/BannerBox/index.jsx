import { Link } from "react-router-dom";

const BannerBox = (props) => {
  return (
    <div className="box bannerBox aspect-video w-full overflow-hidden rounded-lg bg-gray-100 group">
      {props.link ? (
        <Link to={props.link} className="block h-full w-full">
          <img
            src={props.img}
            alt="banner"
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      ) : (
        <img
          src={props.img}
          alt="banner"
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      )}
    </div>
  );
};

export default BannerBox;
