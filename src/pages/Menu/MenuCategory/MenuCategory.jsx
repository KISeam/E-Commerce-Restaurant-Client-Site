import React from "react";
import MenuItem from "../../Shared/MenuItem/MenuItem";
import { Link } from "react-router-dom";

const MenuCategory = ({ items }) => {
  if (!items || items.length === 0) return null;

  const category = items[0].category;
  return (
    <>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {items.map((item) => (
            <MenuItem key={item._id} item={item} />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link to={`/order/${category}`}>
            <button className="btn btn-outline bg-transparent border-0 border-b-4 text-[#1F2937] uppercase md:text-lg px-8 py-5 rounded-lg">
              ORDER YOUR FAVOURITE FOOD
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MenuCategory;
