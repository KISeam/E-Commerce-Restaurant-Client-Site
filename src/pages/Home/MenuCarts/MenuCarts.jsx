import React, { useEffect, useState } from "react";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import MenuCart from "../../Shared/MenuCart/MenuCart";

const MenuCarts = () => {
  const [offeredMenu, setOfferedMenu] = useState([]);
  useEffect(() => {
    fetch("menu.json")
      .then((res) => res.json())
      .then((data) => {
        const offeredItems = data.filter((item) => item.category === "offered");
        setOfferedMenu(offeredItems);
      });
  }, []);
  return (
    <>
      <div className="my-12 md:my-16 container mx-auto">
        <SectionTitle subHeading={"Should Try"} heading={"CHEF RECOMMENDS"} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offeredMenu.map((item) => (
            <MenuCart key={item._id} cartDetails={item} />
          ))}
        </div>
      </div>
    </>
  );
};

export default MenuCarts;
