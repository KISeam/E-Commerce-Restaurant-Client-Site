import React, { useEffect, useState } from "react";
import Banner from "../Banner/Banner";
import Category from "../Category/Category";
import PopularMenu from "../PopularMenu/PopularMenu";
import image from "../../../assets/home/chef-service.jpg";
import MenuCarts from "../MenuCarts/MenuCarts";
import Featured from "../Featured/Featured";
import Testimonials from "../Testimonials/Testimonials";
import Cover from "../../Shared/Cover/Cover";
import logo from "../../../assets/logo.png";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading (e.g., fetch or internal delay)
  useEffect(() => {
    const loadAll = async () => {
      // You can wait for actual fetches here if needed
      await new Promise((resolve) => setTimeout(resolve, 5000));
      setIsLoading(false);
    };
    loadAll();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-orange-500 flex flex-col items-center justify-center z-50">
        <div className="w-24 h-24 mb-8 relative">
          <div className="absolute inset-0 border-4 border-white border-t-orange-500 rounded-full animate-spin"></div>
          <img
            src={logo}
            alt="Loading logo"
            className="w-full h-full object-contain p-2"
          />
        </div>
        <div className="w-48 h-2 bg-orange-300 rounded-full overflow-hidden">
          <div className="h-full bg-white animate-progress"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Banner />
      <Category />
      <Cover
        title={"BISTRO BOSS"}
        subTitle={
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus, libero accusamus laborum deserunt ratione dolor officiis praesentium! Deserunt magni sapiente deleniti dolor dolorem ex, nihil voluptas deserunt, incidunt quibusdam nemo."
        }
        image={image}
      />
      <PopularMenu />
      <MenuCarts />
      <Featured />
      <Testimonials />
    </div>
  );
};

export default Home;
