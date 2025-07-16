import React from 'react'

const Cover = ({ title, subTitle, image }) => {
  return (
    <>
      <div className="my-12 md:my-16 container mx-auto">
        <div className="relative w-full">
          <img
            src={image}
            alt="Background Image"
            className="w-full h-[512px] object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="bg-[#15151599] bg-opacity-90 text-center p-10 max-w-7xl shadow-lg rounded">
              <div className="text-white md:px-[10%] lg:px-[18%]">
                <h2 className="text-3xl font-semibold mb-4">{title}</h2>
                <p>{subTitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Cover