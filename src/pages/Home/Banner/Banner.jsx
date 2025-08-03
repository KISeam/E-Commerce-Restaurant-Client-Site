import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";


const Banner = () => {
  return (
    <div className="carousel-container">
      <Carousel
        autoPlay
        infiniteLoop
        showStatus={false}
        showIndicators
        emulateTouch
        interval={3000}
      >
        <div className="carousel-slide">
          <img src="https://i.ibb.co/Qjr5gGWJ/01.jpg" alt="Image-1" />
        </div>
        <div className="carousel-slide">
          <img src="https://i.ibb.co/rKPqBg52/02.jpg" alt="Image-2" />
        </div>
        <div className="carousel-slide">
          <img src="https://i.ibb.co/zWT7VMww/03.png" alt="Image-3" />
        </div>
        <div className="carousel-slide">
          <img src="https://i.ibb.co/svb5dcdh/04.jpg" alt="Image-4" />
        </div>
        <div className="carousel-slide">
          <img src="https://i.ibb.co/KjTSQMRh/05.png" alt="Image-5" />
        </div>
        <div className="carousel-slide">
          <img src="https://i.ibb.co/sd2rWNXY/06.png" alt="Image-6" />
        </div>
      </Carousel>
    </div>
  );
};

export default Banner;