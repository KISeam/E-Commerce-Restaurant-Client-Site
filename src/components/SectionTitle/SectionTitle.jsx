import React from "react";

const SectionTitle = ({subHeading, heading}) => {
  return (
    <div>
      <div className="text-center mb-12 max-w-lg mx-auto">
        <p className="text-[#D99904] md:text-lg pb-4 border-b-2 border-[#E8E8E8]">
          --- {subHeading} ---
        </p>
        <h2 className="text-lg md:text-4xl text-[#151515] uppercase py-5 border-b-2 border-[#E8E8E8]">
          {heading}
        </h2>
      </div>
    </div>
  );
};

export default SectionTitle;
