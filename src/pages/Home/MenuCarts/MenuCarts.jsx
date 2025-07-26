import React, { useEffect, useState } from "react";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import MenuCart from "../../Shared/MenuCart/MenuCart";
import useMenu from "../../../hooks/useMenu";

const MenuCarts = () => {
  const [menu] = useMenu();

  const dessertMenu = menu.filter((item) => item.category === "dessert");

  return (
    <>
      <div className="my-12 md:my-16 container mx-auto">
        <SectionTitle subHeading={"Should Try"} heading={"CHEF RECOMMENDS"} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dessertMenu.map((item) => (
            <MenuCart key={item._id} cartDetails={item} />
          ))}
        </div>
      </div>
    </>
  );
};

export default MenuCarts;
