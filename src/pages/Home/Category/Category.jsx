import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import slide1 from "../../../assets/home/slide1.jpg";
import slide2 from "../../../assets/home/slide2.jpg";
import slide3 from "../../../assets/home/slide3.jpg";
import slide4 from "../../../assets/home/slide4.jpg";
import slide5 from "../../../assets/home/slide5.jpg";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import { Link } from "react-router-dom";

const categories = [
  { image: slide1, title: "salad" },
  { image: slide2, title: "soup" },
  { image: slide3, title: "pizza" },
  { image: slide4, title: "dessert" },
  { image: slide5, title: "drinks" },
];

const Category = () => {
  return (
    <div className="my-12 md:my-16 container mx-auto">
      {/* Section Heading */}
      <SectionTitle
        subHeading={"From 11:00am to 10:00pm"}
        heading={"ORDER ONLINE"}
      />

      {/* Swiper Section */}
      <Swiper
        slidesPerView={4}
        spaceBetween={30}
        centeredSlides={true}
        pagination={{ clickable: true }}
        modules={[FreeMode, Pagination]}
        className="mySwiper"
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {categories.map((cat, index) => (
          <SwiperSlide key={index}>
            <div className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg">
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-[450px] object-cover"
              />
              {/* Overlay with title */}
              <Link to={`/order/${cat.title}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end justify-center p-4 pb-8">
                  <h3 className="text-white text-xl md:text-3xl uppercase group-hover:underline transition">
                    {cat.title}
                  </h3>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Category;
