import React, { useEffect, useState } from "react";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import MenuItem from "../../Shared/MenuItem/MenuItem";
import { Link } from "react-router-dom";
import useMenu from "../../../hooks/useMenu";

const PopularMenu = () => {
  const [menu] = useMenu();
  const populerItems = menu.filter((item) => item.category === "popular");

  return (
    <>
      <div className="my-12 md:my-16 container mx-auto">
        <SectionTitle subHeading={"Check it out"} heading={"FROM OUR MENU"} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {populerItems.map((item) => (
            <MenuItem key={item._id} item={item} />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link to="/menu">
            <button className="btn btn-outline bg-transparent border-0 border-b-4 text-[#1F2937] uppercase md:text-lg px-8 py-5 rounded-lg">
              View Full Menu
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default PopularMenu;
