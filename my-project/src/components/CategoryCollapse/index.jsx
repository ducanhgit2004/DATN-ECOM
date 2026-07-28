import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import { FaRegSquarePlus } from "react-icons/fa6";
import { FiMinusSquare } from "react-icons/fi";
import { MyContext } from "../../App";

const CategoryCollapse = () => {
  const { catData } = useContext(MyContext);
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((value) => ({ ...value, [id]: !value[id] }));

  return <div className="scroll"><ul className="w-full">
    {catData.map((category) => <li key={category._id} className="list-none relative">
      <Link to={`/productListing?category=${category._id}`}><Button className="w-full !justify-start !px-3 !text-[rgba(0,0,0,0.8)]">{category.name}</Button></Link>
      {category.children?.length > 0 && <button type="button" className="absolute top-[10px] right-[15px]" onClick={() => toggle(category._id)}>{expanded[category._id] ? <FiMinusSquare /> : <FaRegSquarePlus />}</button>}
      {expanded[category._id] && <ul className="pl-4">{category.children.map((sub) => <li key={sub._id} className="relative">
        <Link to={`/productListing?subcategory=${sub._id}`}><Button className="w-full !justify-start !text-[rgba(0,0,0,0.8)]">{sub.name}</Button></Link>
        {sub.children?.length > 0 && <button type="button" className="absolute top-[10px] right-[15px]" onClick={() => toggle(sub._id)}>{expanded[sub._id] ? <FiMinusSquare /> : <FaRegSquarePlus />}</button>}
        {expanded[sub._id] && <ul className="pl-5">{sub.children.map((third) => <li key={third._id}><Link className="block py-2 text-sm link" to={`/productListing?thirdCategory=${third._id}`}>{third.name}</Link></li>)}</ul>}
      </li>)}</ul>}
    </li>)}
    {!catData.length && <li className="p-4 text-sm text-gray-500">No categories available.</li>}
  </ul></div>;
};

export default CategoryCollapse;
