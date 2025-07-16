import React, { useEffect, useState } from "react";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import { Swiper, SwiperSlide } from "swiper/react";
import { Rating } from "@smastrom/react-rating";

import "@smastrom/react-rating/style.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// import required modules
import { Navigation } from "swiper/modules";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data));
  }, []);
  return (
    <>
      <div>
        <SectionTitle
          subHeading={"What Our Clients Say"}
          heading={"TESTIMONIALS"}
        />
        <div className="pb-12 md:pb-16 container mx-auto">
          <Swiper
            navigation={true}
            modules={[Navigation]}
            className="mySwiper text-center text-black"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review._id}>
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="flex items-center justify-center">
                    <Rating
                      style={{ maxWidth: 180 }}
                      value={review.rating}
                      readOnly
                    />
                  </div>
                  <p className="text-lg leading-[35px]">{review.details}</p>
                  <h3 className="text-xl lg:text-3xl text-[#CD9003]">
                    {review.name}
                  </h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default Testimonials;
