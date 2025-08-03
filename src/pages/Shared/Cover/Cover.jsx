import React from "react";

const Cover = ({ title, subTitle, image }) => {
  return (
    <>
      <div className="my-12 md:my-16 container mx-auto">
        <div className="relative w-full">
          <img
            src={image}
            alt="Background Image"
            className="w-full h-[512px] object-cover rounded-2xl"
          />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="bg-[#15151599] bg-opacity-90 text-center p-8 md:p-16 max-w-[1100px] w-full shadow-2xl rounded-xl">
              <div className="text-white px-6 md:px-[8%] lg:px-[12%]">
                <h2 className="text-xl md:text-3xl font-bold mb-6">{title}</h2>
                <p className="leading-relaxed">{subTitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cover;
