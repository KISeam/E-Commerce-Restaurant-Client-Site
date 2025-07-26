import React, { useState } from "react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";

const AddReview = () => {
  const [review, setReview] = useState({
    name: "",
    details: "",
    rating: 0,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loading
  const axiosSecure = useAxiosSecure();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!review.name || !review.details || review.rating === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill all fields and select a rating",
        confirmButtonColor: "#f97316",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axiosSecure.post("/reviews", review, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // REMOVED THE response.ok CHECK - Axios handles success automatically
      Swal.fire({
        icon: "success",
        title: "Review Submitted!",
        text: "Thank you for your feedback",
        confirmButtonColor: "#f97316",
        background: "#ffffff",
      });
      setReview({ name: "", details: "", rating: 0 });
    } catch (error) {
      // Improved error handling
      let errorMessage = "Please try again later";

      if (error.response) {
        // Server responded with non-2xx status
        errorMessage = error.response.data.message || error.response.statusText;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server";
      }

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: errorMessage,
        confirmButtonColor: "#f97316",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <SectionTitle
          subHeading={"Leave a Review"}
          heading={"YOUR OPINION MATTERS"}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-lg font-medium text-orange-900 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={review.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition focus:outline-none text-gray-600"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label
              htmlFor="rating"
              className="block text-lg font-medium text-orange-900 mb-2"
            >
              Rating
            </label>
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReview({ ...review, rating: i + 1 })}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`text-3xl transition ${
                    (hoverRating || review.rating) > i
                      ? "text-orange-500"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="details"
              className="block text-lg font-medium text-orange-900 mb-2"
            >
              Your Review
            </label>
            <textarea
              id="details"
              name="details"
              value={review.details}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition focus:outline-none text-gray-600"
              placeholder="Share your experience..."
            ></textarea>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-300 flex items-center justify-center ${
                isSubmitting ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
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
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReview;
