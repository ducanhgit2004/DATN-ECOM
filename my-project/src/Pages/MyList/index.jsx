import { useContext } from "react";
import { Link } from "react-router-dom";
import { IoMdHeartEmpty } from "react-icons/io";
import MyListItems from "./myListItems";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";

const MyList = () => {
  const { myListItems, myListLoading } = useContext(MyContext);

  return (
    <section className="py-10 w-full">
      <div className="container flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-[24%] xl:w-[20%] shrink-0">
          <AccountSidebar />
        </div>

        <div className="w-full min-w-0">
          <div className="shadow-md rounded-xl bg-white overflow-hidden">
            <div className="py-4 px-5 border-b border-gray-100">
              <h1 className="text-xl font-semibold">My List</h1>
              <p className="mt-1 text-sm text-gray-600">
                There {myListItems.length === 1 ? "is" : "are"}{" "}
                <span className="font-bold text-[#ff5252]">
                  {myListItems.length}
                </span>{" "}
                {myListItems.length === 1 ? "product" : "products"} in My List
              </p>
            </div>

            {myListLoading ? (
              <div className="py-16 text-center text-gray-500">
                Loading My List...
              </div>
            ) : myListItems.length ? (
              myListItems.map((item) => (
                <MyListItems key={item._id} item={item} />
              ))
            ) : (
              <div className="flex flex-col items-center px-5 py-16 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#ff5252]">
                  <IoMdHeartEmpty size={32} />
                </span>
                <h2 className="mt-4 text-lg font-semibold">
                  Your My List is empty
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Save products you like and find them here later.
                </p>
                <Link
                  to="/productListing"
                  className="mt-5 rounded-lg bg-[#ff5252] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e74848]"
                >
                  Explore products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyList;
