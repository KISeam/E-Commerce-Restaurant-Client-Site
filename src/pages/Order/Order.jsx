import React, { useState } from "react";
import orderImg from "../../assets/shop/banner2.jpg";
import BistroBoss from "../Shared/BistroBoss/BistroBoss";
import useMenu from "../../hooks/useMenu";
import MenuCart from "../Shared/MenuCart/MenuCart";
import { useParams, useNavigate } from "react-router-dom";

const categories = ["offered", "salad", "pizza", "soup", "dessert", "drinks"];
const ITEMS_PER_PAGE = 6;

const Order = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [menu] = useMenu();

  const currentCategory = categories.includes(category) ? category : "salad";
  const filteredItems = menu.filter(
    (item) => item.category === currentCategory
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Change category resets page to 1
  const handleCategoryClick = (cat) => {
    navigate(`/order/${cat}`);
    setCurrentPage(1);
  };

  // Pagination logic: slice items for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white">
      <BistroBoss
        image={orderImg}
        title={"OUR SHOP"}
        subTitle={"Would you like to try a dish?"}
      />

      <div className="py-12 md:py-16 container mx-auto">
        {/* Category Buttons */}
        <div className="flex justify-center gap-4 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                currentCategory === cat
                  ? "text-[#BB8506] border-0 border-b-4 border-[#BB8506]"
                  : "text-black"
              }`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Filtered Items (Paginated) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item) => (
              <MenuCart key={item._id} cartDetails={item} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 text-lg">
              No items found in this category.
            </p>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 gap-2 flex-wrap items-center">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded border text-sm cursor-pointer bg-gray-200 text-gray-400 ${
                currentPage === 1
                  ? "cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              &lt;
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded border text-sm cursor-pointer text-gray-400 ${
                    currentPage === pageNum
                      ? "bg-[#BB8506] text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded border text-sm cursor-pointer bg-gray-200 text-gray-400 ${
                currentPage === totalPages
                  ? "cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
