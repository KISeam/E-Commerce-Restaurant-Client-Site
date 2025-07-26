import React from "react";
import BistroBoss from "../../Shared/BistroBoss/BistroBoss";
import image from "../../../assets/menu/banner3.jpg";
import useMenu from "../../../hooks/useMenu";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import MenuCategory from "../MenuCategory/MenuCategory";
import useCategories from "../../../hooks/useCategories";
import Cover from "../../Shared/Cover/Cover";

const Menu = () => {
  const [menu] = useMenu();
  const { categories } = useCategories();

  return (
    <div className="bg-white">
      <BistroBoss
        image={image}
        title={"OUR MENU"}
        subTitle={"Would you like to try a dish?"}
      />

      <div className="container mx-auto">
        {/* SPECIAL OFFER */}
        <div className="my-12 md:my-16">
          <SectionTitle subHeading={"Don't miss"} heading={"SPECIAL OFFER"} />
        </div>

        {/* Dynamically render each category */}
        {categories
          .filter((cat) =>
            menu.some((item) => item.category === cat.name.toLowerCase())
          )
          .map((category, index, filteredCategories) => {
            const items = menu
              .filter((item) => item.category === category.name.toLowerCase())
              .slice(0, 6);

            const isLast = index === filteredCategories.length - 1;

            return (
              <div
                key={category.name}
                className={isLast ? "pb-12 md:pb-16" : ""}
              >
                <Cover
                  title={category.name.toUpperCase()}
                  subTitle={
                    "Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s..."
                  }
                  image={category.image}
                />
                <MenuCategory items={items} />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Menu;
