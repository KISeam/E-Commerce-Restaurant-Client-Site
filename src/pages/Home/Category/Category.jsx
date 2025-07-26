import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import { Link } from "react-router-dom";
import useCategories from "../../../hooks/useCategories"; // Import the hook

const Category = () => {
  // Use the hook to get categories and loading state
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="text-center my-12">
        <SectionTitle
          subHeading={"From 11:00am to 10:00pm"}
          heading={"ORDER ONLINE"}
        />
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="my-12 md:my-16 container mx-auto">
      <SectionTitle
        subHeading={"From 11:00am to 10:00pm"}
        heading={"ORDER ONLINE"}
      />

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
        {categories.map((cat) => (
          <SwiperSlide key={cat._id}>
            <div className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-[450px] object-cover"
              />
              <Link to={`/order/${cat.name.toLowerCase()}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end justify-center p-4 pb-8">
                  <h3 className="text-white text-xl md:text-3xl uppercase group-hover:underline transition">
                    {cat.name}
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
