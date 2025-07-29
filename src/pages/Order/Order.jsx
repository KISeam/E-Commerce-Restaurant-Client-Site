import React, { useState } from "react";
import orderImg from "../../assets/shop/banner2.jpg";
import BistroBoss from "../Shared/BistroBoss/BistroBoss";
import useMenu from "../../hooks/useMenu";
import MenuCart from "../Shared/MenuCart/MenuCart";
import { useParams, useNavigate } from "react-router-dom";
import useCategories from "../../hooks/useCategories";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ITEMS_PER_PAGE = 6;

const Order = () => {
  const { categories } = useCategories();
  const { category } = useParams();
  const navigate = useNavigate();
  const [menu] = useMenu();
  const [currentPage, setCurrentPage] = useState(1);

  // Determine current category
  const currentCategory = categories
    .map((c) => c.name.toLowerCase())
    .includes(category?.toLowerCase())
    ? category.toLowerCase()
    : "salad";

  const filteredItems = menu.filter(
    (item) => item.category?.toLowerCase() === currentCategory
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Handle category change
  const handleCategoryClick = (cat) => {
    navigate(`/order/${cat}`);
    setCurrentPage(1);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Generate visible page numbers
  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, currentPage + half);

      if (currentPage - half < 1) {
        end = maxVisible;
      } else if (currentPage + half > totalPages) {
        start = totalPages - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) {
        visiblePages.push(i);
      }
    }

    return visiblePages;
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white">
      <BistroBoss
        image={orderImg}
        title={"OUR MENU"}
        subTitle={"Discover Culinary Excellence"}
      />

      <div className="py-12 md:py-16 container mx-auto px-4">
        {/* Category Navigation */}
        <div className="flex justify-center gap-4 flex-wrap mb-8">
          {categories.map((cat) => {
            const catName = cat.name.toLowerCase();
            return (
              <button
                key={catName}
                className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                  currentCategory === catName
                    ? "text-[#BB8506] border-0 border-b-4 border-[#BB8506]"
                    : "text-black"
                }`}
                onClick={() => handleCategoryClick(catName)}
              >
                {cat.name.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item) => (
              <div
                key={item._id}
                className="transition-transform duration-300 hover:scale-[1.02]"
              >
                <MenuCart cartDetails={item} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="bg-orange-50 p-8 rounded-2xl max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  No Items Available
                </h3>
                <p className="text-gray-600 mb-6">
                  We don't have any dishes in this category yet. Please check
                  back soon!
                </p>
                <button
                  onClick={() => handleCategoryClick("salad")}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Browse All Categories
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-14 gap-2 items-center">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2.5 rounded-full transition-all ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
              }`}
            >
              <FiChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            {getVisiblePages().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-full transition-all ${
                  currentPage === pageNum
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2.5 rounded-full transition-all ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
              }`}
            >
              <FiChevronRight size={20} />
            </button>

            {/* Page Info */}
            <div className="ml-4 text-gray-600 text-sm hidden sm:block">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
