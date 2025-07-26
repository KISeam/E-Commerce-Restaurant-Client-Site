import React, { useState, useEffect } from "react";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import { Link } from "react-router-dom";

const imageHostingApiKey = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const imageHostingUrl = `https://api.imgbb.com/1/upload?key=${imageHostingApiKey}`;

const AddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const itemsPerPage = 8;
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosPublic.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch categories",
          icon: "error",
          confirmButtonColor: "#d97706",
        });
      }
    };
    fetchCategories();
  }, [axiosSecure]);

  // Handle edit button click
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: null,
    });
    setImagePreview(category.image || null);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Category name is required";
    if (!editingCategory && !formData.image) {
      newErrors.image = "Image is required for new categories";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission for creating/updating category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let imageUrl = editingCategory?.image;

      if (formData.image) {
        const imageForm = new FormData();
        imageForm.append("image", formData.image);
        const imageResponse = await axiosPublic.post(
          imageHostingUrl,
          imageForm,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageUrl = imageResponse.data.data.url;
      }

      const categoryData = {
        name: formData.name,
        image: imageUrl,
      };

      let response;
      if (editingCategory) {
        // Update existing category
        response = await axiosSecure.put(
          `/categories/${editingCategory._id}`,
          categoryData
        );
      } else {
        // Create new category
        response = await axiosSecure.post("/categories", categoryData);
      }

      if (response.status === 200 || response.status === 201) {
        // Update categories list
        if (editingCategory) {
          setCategories(
            categories.map((cat) =>
              cat._id === editingCategory._id
                ? { ...cat, ...categoryData }
                : cat
            )
          );
        } else {
          setCategories([...categories, response.data]);
        }

        Swal.fire({
          title: "Success!",
          text: editingCategory
            ? "Category updated successfully"
            : "Category added successfully",
          icon: "success",
          confirmButtonColor: "#d97706",
          timer: 3000,
        });

        // Reset form
        setEditingCategory(null);
        setFormData({
          name: "",
          image: null,
        });
        setImagePreview(null);
        setErrors({});
      }
    } catch (error) {
      console.error("Category error:", error.response || error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to process category",
        icon: "error",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      image: null,
    });
    setImagePreview(null);
    setErrors({});
  };

  // Handle delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosSecure.delete(`/categories/${id}`);
        if (response.status === 200) {
          setCategories(categories.filter((cat) => cat._id !== id));
          Swal.fire("Deleted!", "Your category has been deleted.", "success");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  // Sorting logic
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredCategories = sortedCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="cantainer mx-auto bg-white/80 rounded-xl shadow-lg overflow-hidden py-12 px-6">
        <SectionTitle
          subHeading="Add Category Form Section Below"
          heading="Add Category"
        />
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
                <h2 className="text-xl font-semibold text-white">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      type="text"
                      className={`mt-1 block w-full px-4 py-2.5 border focus:outline-none text-gray-600 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="Enter category name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Image{" "}
                      {!editingCategory && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-lg cursor-pointer transition-colors duration-150">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              className="w-8 h-8 mb-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              ></path>
                            </svg>
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            {formData.image && (
                              <p className="text-xs mt-2 text-gray-700">
                                {formData.image.name}
                              </p>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      {errors.image && (
                        <p className="text-sm text-red-500">{errors.image}</p>
                      )}
                    </div>
                  </div>

                  {/* Image Preview */}
                  {(imagePreview || editingCategory?.image) && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image Preview
                      </label>
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 overflow-hidden">
                        <img
                          src={imagePreview || editingCategory?.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all cursor-pointer ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : editingCategory ? (
                        "Update Category"
                      ) : (
                        "Add Category"
                      )}
                    </button>
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-6 grid grid-cols-1 gap-5">
              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                        ></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-orange-900">
                        Total Categories
                      </h3>
                      <p className="text-2xl font-semibold text-gray-900">
                        {categories.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories List Section */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-xl font-semibold text-white">
                      All Categories
                    </h2>
                    <p className="text-sm text-orange-100 mt-1">
                      Showing {currentCategories.length} of {categories.length}{" "}
                      categories
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      className="pl-10 pr-4 py-2 border border-orange-300 focus:outline-none rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64 bg-white text-gray-900"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                      className="w-5 h-5 absolute left-3 top-2.5 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {currentCategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {currentCategories.map((category) => (
                      <div
                        key={category._id}
                        className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="relative h-40">
                          <img
                            className="w-full h-full object-cover"
                            src={category.image}
                            alt={category.name}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-xl font-semibold text-white">
                              {category.name}
                            </h3>
                          </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 rounded-full p-2 transition duration-200 cursor-pointer"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                ></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full p-2 transition duration-200 cursor-pointer"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No categories found
                    </h3>
                    <p className="mt-1 text-sm text-orange-500">
                      {searchTerm
                        ? "Try adjusting your search"
                        : "Add your first category"}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredCategories.length > itemsPerPage && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-t border-orange-200 flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-orange-700 mb-2 sm:mb-0">
                    Showing{" "}
                    <span className="font-medium">
                      {currentCategories.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredCategories.length}
                    </span>{" "}
                    categories
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      className="px-3 py-1 rounded-md bg-white border border-orange-300 text-sm font-medium text-orange-700 hover:bg-orange-50 cursor-pointer disabled:opacity-50"
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3 py-1 rounded-md border border-orange-300 text-sm font-medium cursor-pointer ${
                            currentPage === number
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                              : "bg-white text-orange-700 hover:bg-orange-50"
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      className="px-3 py-1 rounded-md bg-white border border-orange-300 text-sm font-medium text-orange-700 hover:bg-orange-50 cursor-pointer"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
