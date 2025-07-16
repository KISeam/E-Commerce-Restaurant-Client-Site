import React from "react";

const MenuCart = ({ cartDetails }) => {
  const { name, image, recipe, price } = cartDetails;

  return (
    <div className="bg-[#F3F3F3] rounded-xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="h-[300px] relative">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-[#BB8506] text-white px-3 py-2 rounded-lg">
          ${price}
        </div>
      </div>
      <div className="p-4 md:py-8 md:px-10 text-center">
        <h3 className="text-lg md:text-xl text-[#151515] font-semibold">{name}</h3>
        <p className="md:text-lg text-gray-600 mt-1 line-clamp-2">{recipe}</p>
        <button className="btn btn-outline bg-[#E8E8E8] hover:bg-[#1F2937] border-0 border-b-4 text-[#BB8506] uppercase md:text-lg px-8 py-5 rounded-lg mt-3 md:mt-6">
          ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default MenuCart;
