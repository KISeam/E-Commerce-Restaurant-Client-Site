import React from "react";

const BistroBoss = ({ title, subTitle, image }) => {
  return (
    <div className="">
      <div className="relative w-full">
        <img
          src={image}
          alt="Background Image"
          className="w-full h-[450px] lg:h-[550px] object-cover"
        />
        
        <div className="absolute inset-0 top-1/4 flex items-center justify-center">
          <div className="w-full container mx-auto">
            <div className="bg-[#15151599] bg-opacity-90 text-center py-20 shadow-lg rounded">
              <div className="text-white md:px-[10%] lg:px-[18%]">
                <h2 className="text-3xl lg:text-6xl font-semibold mb-4">{title}</h2>
                <p className="md:text-lg">{subTitle}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BistroBoss;
