import React from "react";

const Featured = () => {
  return (
    <>
      <div
        className="relative bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: `url("https://i.ibb.co/f3Vjd9j/featured.jpg")`,
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-[#151515B2] z-0"></div>

        <div className="relative z-10 my-12 md:my-16 py-12 md:py-16 container mx-auto">
          <div>
            <div className="text-center mb-12 max-w-lg mx-auto">
              <p className="text-[#D99904] md:text-lg pb-4 border-b-2 border-white">
                --- Check it Out ---
              </p>
              <h2 className="text-lg md:text-4xl text-white uppercase py-5 border-b-2 border-white">
                FROM OUR MENU
              </h2>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="w-full lg:w-1/2">
              <img
                src="https://i.ibb.co/f3Vjd9j/featured.jpg"
                alt="Featured Image"
              />
            </div>
            <div className="flex flex-col gap-5 text-center lg:text-left text-white w-full lg:w-1/2">
              <div>
                <h2 className="text-lg md:text-2xl">
                  March 20, 2023 <br /> WHERE CAN I GET SOME?
                </h2>
                <p className="text-base md:text-[20px]">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
                  voluptate facere, deserunt dolores maiores quod nobis quas
                  quasi. Eaque repellat recusandae ad laudantium tempore
                  consequatur consequuntur omnis ullam maxime tenetur.
                </p>
              </div>
              <button className="btn btn-outline bg-transparent border-0 border-b-4 text-white uppercase md:text-lg px-8 py-5 rounded-lg w-fit mx-auto lg:mx-0">
                Read More
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Featured;
