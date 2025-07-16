import React from "react";
import BistroBoss from "../../Shared/BistroBoss/BistroBoss";
import image from "../../../assets/menu/banner3.jpg";
import useMenu from "../../../hooks/useMenu";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import MenuItem from "../../Shared/MenuItem/MenuItem";
import { Link } from "react-router-dom";
import Cover from "../../Shared/Cover/Cover";
import dessertImg from "../../../assets/menu/dessert-bg.jpeg";
import soupImg from "../../../assets/menu/soup-bg.jpg";
import saladImg from "../../../assets/menu/salad-bg.jpg";
import pizzaImg from "../../../assets/menu/pizza-bg.jpg";
import MenuCategory from "../MenuCategory/MenuCategory";

const Menu = () => {
  const [menu] = useMenu();
  const offeredItems = menu
    .filter((item) => item.category === "offered")
    .slice(0, 6);
  const dessertItems = menu
    .filter((item) => item.category === "dessert")
    .slice(0, 6);
  const soupItems = menu.filter((item) => item.category === "soup").slice(0, 6);
  const saladItems = menu
    .filter((item) => item.category === "salad")
    .slice(0, 6);
  const pizzaItems = menu
    .filter((item) => item.category === "pizza")
    .slice(0, 6);

  return (
    <>
      <div className="bg-white">
        <BistroBoss
          image={image}
          title={"OUR MENU"}
          subTitle={"Would you like to try a dish?"}
        />
        <div className="container mx-auto">
          {/* OFFERED Items */}
          <div className="my-12 md:my-16">
            <SectionTitle subHeading={"Don't miss"} heading={"SPECIAL OFFER"} />
            <MenuCategory items={offeredItems}></MenuCategory>
          </div>

          {/* DESSERTS Items */}
          <div className="my-12 md:my-16">
            <div>
              <Cover
                title={"DESSERTS"}
                subTitle={
                  "Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
                }
                image={dessertImg}
              />
            </div>

            <MenuCategory items={dessertItems}></MenuCategory>
          </div>

          {/* PIZZA Items */}
          <div className="my-12 md:my-16">
            <div>
              <Cover
                title={"PIZZA"}
                subTitle={
                  "Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
                }
                image={pizzaImg}
              />
            </div>

            <MenuCategory items={pizzaItems}></MenuCategory>
          </div>

          {/* SOUP Items */}
          <div className="my-12 md:my-16">
            <div>
              <Cover
                title={"SOUP"}
                subTitle={
                  "Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
                }
                image={soupImg}
              />
            </div>

            <MenuCategory items={soupItems}></MenuCategory>
          </div>

          {/* SALAD Items */}
          <div className="pb-12 md:pb-16">
            <div>
              <Cover
                title={"SALAD"}
                subTitle={
                  "Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
                }
                image={saladImg}
              />
            </div>

            <MenuCategory items={saladItems}></MenuCategory>
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;
