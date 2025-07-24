import React, { useState } from "react";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import useMenu from "../../../hooks/useMenu";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import { Link } from "react-router-dom";

const imageHostingApiKey = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const imageHostingUrl = `https://api.imgbb.com/1/upload?key=${imageHostingApiKey}`;

const ManageItems = () => {
  const [menu, setMenu] = useMenu();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null); // State for editing item
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    recipe: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const itemsPerPage = 10;
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();
  const categories = ["salad", "soup", "pizza", "dessert", "drinks"]; // Consistent with AddItems

  // Handle edit button click
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      recipe: item.recipe || "",
      image: null,
    });
    setImagePreview(item.image || null);
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

    if (!formData.name.trim()) newErrors.name = "Recipe name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = "Invalid price format";
    }
    if (!formData.recipe || formData.recipe.length < 20) {
      newErrors.recipe = "Recipe should be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission for updating item
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingItem || !editingItem._id) {
      Swal.fire({
        title: "Error!",
        text: "No item selected for update",
        icon: "error",
        confirmButtonColor: "#d97706",
      });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let imageUrl = editingItem.image;

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

      const updatedItem = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        recipe: formData.recipe,
        image: imageUrl,
      };

      const response = await axiosSecure.put(
        `/menu/${editingItem._id}`,
        updatedItem
      );

      if (response.status === 200) {
        // Update last updated time
        const updatedTime = response.data.updatedAt;
        setLastUpdated(new Date(updatedTime).toLocaleString());

        setMenu(
          menu.map((item) =>
            item._id === editingItem._id ? { ...item, ...updatedItem } : item
          )
        );
        Swal.fire({
          title: "Success!",
          text: "Item updated successfully",
          icon: "success",
          confirmButtonColor: "#d97706",
          timer: 3000,
        });
        setEditingItem(null);
        setFormData({
          name: "",
          category: "",
          price: "",
          recipe: "",
          image: null,
        });
        setImagePreview(null);
        setErrors({});
      }
    } catch (error) {
      console.error("Update error:", error.response || error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update item",
        icon: "error",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      recipe: "",
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
        const response = await axiosSecure.delete(`/menu/${id}`);
        if (response.status === 200) {
          setMenu(menu.filter((item) => item._id !== id));
          Swal.fire("Deleted!", "Your item has been deleted.", "success");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
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

  const sortedItems = [...menu].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredItems = sortedItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Render edit form if editingItem is set
  if (editingItem) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-[#ffffff] rounded-xl shadow-lg">
        <div className="mb-8">
          <SectionTitle
            subHeading="Update existing item"
            heading="Edit Menu Item"
          />
        </div>

        <form onSubmit={handleUpdate} className="space-y-6 text-gray-600">
          {/* Recipe Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              type="text"
              className={`mt-1 block w-full px-4 py-2.5 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
              placeholder="Enter recipe name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2.5 border ${
                  errors.category ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  type="text"
                  className={`block w-full pl-8 pr-4 py-2.5 border ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Recipe Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Details <span className="text-red-500">*</span>
            </label>
            <textarea
              name="recipe"
              value={formData.recipe}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2.5 border ${
                errors.recipe ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
              placeholder="Describe the recipe, ingredients, and preparation..."
              rows="4"
            />
            {errors.recipe && (
              <p className="mt-1 text-sm text-red-500">{errors.recipe}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Image
            </label>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 hover:border-yellow-500 rounded-lg cursor-pointer transition-colors">
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
                        <span className="font-semibold">Click to upload</span>{" "}
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
              </div>
              {imagePreview && (
                <div className="flex-shrink-0">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all cursor-pointer ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
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
              ) : (
                "Update Menu Item"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render table view
  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          heading="Manage Items"
          subHeading="View, edit, and delete menu items"
        />

        {/* Stats Section */}
        <div className="my-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 bg-gradient-to-r from-orange-50 to-orange-100">
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
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-orange-900">
                    Total Items
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {menu.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 bg-gradient-to-r from-orange-50 to-orange-100">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-orange-900">
                    Last Updated
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {lastUpdated ? lastUpdated : "Not yet updated"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 bg-gradient-to-r from-orange-50 to-orange-100">
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
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-orange-900">
                    Avg. Price
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    $
                    {menu.length > 0
                      ? (
                          menu.reduce((sum, item) => sum + item.price, 0) /
                          menu.length
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl font-semibold text-white">
                  All Menu Items
                </h2>
                <p className="text-sm text-orange-100 mt-1">
                  Total Items:{" "}
                  <span className="font-medium">{menu.length}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search items..."
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

                <Link to="/dashboard/addItems">
                  <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition duration-200 cursor-pointer">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                    Add New Item
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-orange-200">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortConfig.key === "name" && (
                        <svg
                          className={`w-4 h-4 ml-1 ${
                            sortConfig.direction === "ascending"
                              ? "transform rotate-180"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 15l7-7 7 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center">
                      Category
                      {sortConfig.key === "category" && (
                        <svg
                          className={`w-4 h-4 ml-1 ${
                            sortConfig.direction === "ascending"
                              ? "transform rotate-180"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 15l7-7 7 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      {sortConfig.key === "price" && (
                        <svg
                          className={`w-4 h-4 ml-1 ${
                            sortConfig.direction === "ascending"
                              ? "transform rotate-180"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 15l7-7 7 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-orange-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-200">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-orange-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <img
                              className="h-16 w-16 rounded-lg object-cover"
                              src={item.image}
                              alt={item.name}
                            />
                          ) : (
                            <svg
                              className="h-8 w-8 text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                          {item.category.charAt(0).toUpperCase() +
                            item.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 rounded-lg p-2 transition duration-200 cursor-pointer"
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
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-lg p-2 transition duration-200 cursor-pointer"
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
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
                        No items found
                      </h3>
                      <p className="mt-1 text-sm text-orange-500">
                        Try adjusting your search or add a new item.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-t border-orange-200 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-orange-700 mb-2 sm:mb-0">
              Showing <span className="font-medium">{currentItems.length}</span>{" "}
              of <span className="font-medium">{filteredItems.length}</span>{" "}
              items
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
        </div>
      </div>
    </div>
  );
};

export default ManageItems;
