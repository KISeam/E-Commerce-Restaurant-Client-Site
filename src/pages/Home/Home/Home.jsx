import React from "react";
import Banner from "../Banner/Banner";
import Category from "../Category/category";
import PopularMenu from "../PopularMenu/PopularMenu";
import image from "../../../assets/home/chef-service.jpg";
import MenuCarts from "../MenuCarts/MenuCarts";
import Featured from "../Featured/Featured";
import Testimonials from "../Testimonials/Testimonials";
import Cover from "../../Shared/Cover/Cover";

const Home = () => {
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
