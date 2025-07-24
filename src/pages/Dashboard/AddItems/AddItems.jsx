import React, { useState } from "react";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import axios from "axios";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const imageHostingApiKey = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const imageHostingUrl = `https://api.imgbb.com/1/upload?key=${imageHostingApiKey}`;

const AddItems = () => {
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();

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

  // Categories data - replace with your actual categories
  const categories = ["Salad", "Soup", "Pizza", "Dessert", "Drinks"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set image to form data
      setFormData({
        ...formData,
        image: file,
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let imageUrl = "";

      // Step 1: Upload image to imgbb
      if (formData.image) {
        const imageForm = new FormData();
        imageForm.append("image", formData.image);

        const imageResponse = await axiosPublic.post(
          imageHostingUrl,
          imageForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageUrl = imageResponse.data.data.url;
      }

      await axiosSecure.post("/menu", {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        recipe: formData.recipe,
        image: imageUrl,
      });

      Swal.fire({
        title: "Success!",
        text: "Item added successfully",
        icon: "success",
        confirmButtonColor: "#d97706",
        timer: 3000,
      });

      // Reset
      setFormData({
        name: "",
        category: "",
        price: "",
        recipe: "",
        image: null,
      });
      setImagePreview(null);
      setErrors({});
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add item",
        icon: "error",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#ffffff] rounded-xl shadow-lg">
      <div className="mb-8">
        <SectionTitle subHeading="What's new?" heading="Add New Menu Item" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-gray-600">
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
            } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent focus:outline-none`}
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
              } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent focus:outline-none`}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category.toLocaleLowerCase()}>
                  {category}
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
                } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent focus:outline-none`}
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
            } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent focus:outline-none`}
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
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all cursor-pointer ${
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
            "Add Menu Item"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddItems;
