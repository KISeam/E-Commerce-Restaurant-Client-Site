import React from "react";

const MenuItem = ({ item }) => {
  const { name, image, price, recipe } = item;

  return (
    <div className="group p-4 md:p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-orange-100">
      <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
        {/* Image container */}
        <div className="w-full sm:w-32 h-40 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Title and price row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
            <h3 className="text-xl font-semibold text-gray-800 font-serif">
              {name}
            </h3>
            <div className="text-orange-600 font-bold text-lg md:text-xl flex items-center">
              <span className="text-gray-400 text-sm mr-1">$</span>
              {price}
            </div>
          </div>

          {/* Divider */}
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Description */}
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            {recipe}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
