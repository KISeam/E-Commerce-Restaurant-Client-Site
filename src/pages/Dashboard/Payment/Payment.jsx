import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import useSelectedProducts from "../../../hooks/useSelectedProducts";
import useAuth from "../../../hooks/useAuth";

// Bangladesh divisions, districts, and upazilas data
const bangladeshDivisions = [
  "Dhaka",
  "Chittagong",
  "Khulna",
  "Rajshahi",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

const divisionDistricts = {
  Dhaka: ["Gazipur", "Narayanganj", "Tangail", "Kishoreganj", "Manikganj"],
  Chittagong: ["Cox's Bazar", "Bandarban", "Rangamati", "Khagrachhari", "Feni"],
  Khulna: ["Satkhira", "Jessore", "Narail", "Bagerhat", "Chuadanga"],
  Rajshahi: ["Bogra", "Joypurhat", "Naogaon", "Natore", "Pabna"],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet Sadar"],
  Barishal: ["Barguna", "Barishal Sadar", "Bhola", "Jhalokati", "Patuakhali"],
  Rangpur: ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari"],
  Mymensingh: ["Jamalpur", "Netrokona", "Sherpur", "Mymensingh Sadar"],
};

const districtUpazilas = {
  Gazipur: ["Gazipur Sadar", "Kaliakair", "Kapasia", "Sreepur"],
  "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Teknaf"],
  Satkhira: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa"],
  Bogra: ["Bogra Sadar", "Adamdighi", "Dhunat", "Gabtali"],
  Habiganj: ["Habiganj Sadar", "Baniachong", "Chunarughat", "Madhabpur"],
  Barguna: ["Barguna Sadar", "Amtali", "Betagi", "Bamna"],
  Dinajpur: ["Dinajpur Sadar", "Birampur", "Birganj", "Chirirbandar"],
  Jamalpur: ["Jamalpur Sadar", "Dewanganj", "Islampur", "Melandaha"],
};

const Payment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart: cartFromState = [], selectedIds = [] } = location.state || {};
  const { selectedProducts } = useSelectedProducts(cartFromState, selectedIds);

  // Redirect if accessed directly without state
  useEffect(() => {
    if (!location.state) {
      navigate("/dashboard/cart");
    }
  }, [location.state, navigate]);

  const axiosSecure = useAxiosSecure();

  // Initialize formData with user data
  const [formData, setFormData] = useState({
    name: user?.displayName || user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    division: user?.division || "",
    district: user?.district || "",
    upazila: user?.upazila || "",
    houseAddress: user?.houseAddress || "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [upazilaOptions, setUpazilaOptions] = useState([]);

  // Update district and upazila options based on initial user data
  useEffect(() => {
    if (formData.division) {
      const districts = divisionDistricts[formData.division] || [];
      setDistrictOptions(districts);
      // Only set district if it exists in the available districts
      if (!districts.includes(formData.district)) {
        setFormData((prev) => ({ ...prev, district: "", upazila: "" }));
        setUpazilaOptions([]);
      } else if (formData.district) {
        const upazilas = districtUpazilas[formData.district] || [];
        setUpazilaOptions(upazilas);
        // Only set upazila if it exists in the available upazilas
        if (!upazilas.includes(formData.upazila)) {
          setFormData((prev) => ({ ...prev, upazila: "" }));
        }
      }
    } else {
      setDistrictOptions([]);
      setUpazilaOptions([]);
      setFormData((prev) => ({ ...prev, district: "", upazila: "" }));
    }
  }, [formData.division, formData.district]);

  // Update upazila options when district changes
  useEffect(() => {
    if (formData.district) {
      const upazilas = districtUpazilas[formData.district] || [];
      setUpazilaOptions(upazilas);
      // Only set upazila if it exists in the available upazilas
      if (!upazilas.includes(formData.upazila)) {
        setFormData((prev) => ({ ...prev, upazila: "" }));
      }
    } else {
      setUpazilaOptions([]);
      setFormData((prev) => ({ ...prev, upazila: "" }));
    }
  }, [formData.district]);

  const calculateTotal = () => {
    const subtotal = selectedProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    return (subtotal + shipping + tax).toFixed(2);
  };

  const calculateSubtotal = () => {
    return selectedProducts
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const calculateTax = () => {
    return (parseFloat(calculateSubtotal()) * 0.08).toFixed(2);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number";
    }
    if (!formData.division) newErrors.division = "Division is required";
    if (!formData.houseAddress.trim())
      newErrors.houseAddress = "House address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const address = `Division: ${formData.division}, District: ${formData.district}, Upazila: ${formData.upazila}, House Address: ${formData.houseAddress}`;

      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address,
        },
        items: selectedProducts,
        total: parseFloat(calculateTotal()),
        paymentMethod: "cash_on_delivery",
        orderDate: new Date().toISOString(),
        status: "pending",
      };

      await axiosSecure.post("/orders", orderData);

      Swal.fire({
        title: "Order Placed!",
        text: "Your order has been placed successfully. You'll receive a confirmation email soon.",
        icon: "success",
        confirmButtonColor: "#d97706",
        timer: 3000,
      });

      setFormData({
        name: user?.displayName || user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        division: user?.division || "",
        district: user?.district || "",
        upazila: user?.upazila || "",
        houseAddress: user?.houseAddress || "",
      });

      navigate("/dashboard/cart");
    } catch (error) {
      console.error('Order submission error:', error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to place order. Please try again.",
        icon: "error",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white">
        <SectionTitle
          subHeading={"Please provide your information"}
          heading="Payment"
        />
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order Summary */}
          <div className="lg:w-2/5">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Order Summary
                </h2>
              </div>

              <div className="p-6">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-700">No items selected</p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      {selectedProducts.map((item) => (
                        <div
                          key={item._id}
                          className="flex gap-4 mb-5 pb-5 border-b border-gray-100"
                        >
                          <div className="bg-gray-100 border border-gray-200 rounded-lg w-20 h-20 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="object-contain w-16 h-16"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-semibold text-gray-800">
                                {item.name}
                              </h3>
                              <p className="font-medium text-orange-600">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                              ${item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3 text-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Subtotal</span>
                        <span className="font-medium">
                          ${calculateSubtotal()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Shipping</span>
                        <span className="font-medium">
                          {parseFloat(calculateSubtotal()) > 50
                            ? "FREE"
                            : "$5.99"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Tax (8%)</span>
                        <span className="font-medium">${calculateTax()}</span>
                      </div>
                      <div className="h-px bg-gray-200 my-3"></div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-orange-600">
                          ${calculateTotal()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="lg:w-3/5">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer Information
                </h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        type="text"
                        className={`w-full px-4 py-3 border ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition focus:outline-none`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        className={`w-full px-4 py-3 border ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition focus:outline-none`}
                        placeholder="Enter your email address"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        type="tel"
                        className={`w-full px-4 py-3 border ${
                          errors.phoneNumber
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition focus:outline-none`}
                        placeholder="Enter your phone number"
                      />
                      {errors.phoneNumber && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Division <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="division"
                        value={formData.division}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${
                          errors.division ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition focus:outline-none bg-white`}
                      >
                        <option value="">Select Division</option>
                        {bangladeshDivisions.map((division) => (
                          <option key={division} value={division}>
                            {division}
                          </option>
                        ))}
                      </select>
                      {errors.division && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.division}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        disabled={!formData.division}
                        className={`w-full px-4 py-3 border ${
                          errors.district ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition focus:outline-none bg-white ${
                          !formData.division
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="">Select District</option>
                        {districtOptions.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      {errors.district && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.district}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upazila <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="upazila"
                        value={formData.upazila}
                        onChange={handleChange}
                        disabled={
                          !formData.district || upazilaOptions.length === 0
                        }
                        className={`w-full px-4 py-3 border ${
                          errors.upazila ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition focus:outline-none bg-white ${
                          !formData.district || upazilaOptions.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="">Select Upazila</option>
                        {upazilaOptions.map((upazila) => (
                          <option key={upazila} value={upazila}>
                            {upazila}
                          </option>
                        ))}
                      </select>
                      {errors.upazila && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.upazila}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        House Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="houseAddress"
                        value={formData.houseAddress}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${
                          errors.houseAddress
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition focus:outline-none`}
                        placeholder="House number, road name, village"
                        rows="3"
                      />
                      {errors.houseAddress && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.houseAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Payment Method
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="flex items-center">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-orange-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            Cash on Delivery
                          </p>
                          <p className="text-sm text-gray-700">
                            Pay when you receive your order
                          </p>
                        </div>
                      </div>
                      <div className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || selectedProducts.length === 0}
                      className={`w-full py-4 px-6 rounded-xl font-medium text-white shadow-lg transition-all cursor-pointer flex items-center justify-center ${
                        isSubmitting || selectedProducts.length === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50"
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
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Place Order (${calculateTotal()})
                        </>
                      )}
                    </button>

                    <p className="text-center text-gray-500 text-sm mt-4">
                      By placing your order, you agree to our{" "}
                      <a href="#" className="text-orange-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-orange-600 hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;
