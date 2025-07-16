import React from "react";

const MenuItem = ({ item }) => {
  const { name, image, price, recipe } = item;
  return (
    <div>
      <div className="flex gap-2.5 md:gap-6">
        <div className="w-32 h-24 md:h-28 rounded-b-full rounded-r-full overflow-hidden">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-start gap-2">
          <div className="space-y-2">
            <h3 className="text-[#151515] md:text-lg uppercase">
              {name} <span className="hidden sm:inline">------------</span>
            </h3>
            <p className="text-[#737373]">{recipe}</p>
            <p className="text-[#BB8506] text-base sm:text-lg whitespace-nowrap sm:ml-4 md:hidden">
              ${price}
            </p>
          </div>
          <p className="text-[#BB8506] text-base sm:text-lg whitespace-nowrap sm:ml-4 hidden md:block">
            ${price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
