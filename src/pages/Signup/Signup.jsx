import React, { useContext, useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Link } from "react-router-dom";
import authImg from "../../assets/others/authentication2.png";
import bgImg from "../../assets/reservation/wood-grain-pattern-gray1x.png";
import { AuthContext } from "../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification, updateProfile } from "firebase/auth";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const Signup = () => {
  const axiosPublic = useAxiosPublic();
  const { createUser, googleSignIn } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (!passwordPattern.test(formData.password)) {
      newErrors.password =
        "Password must be at least 6 characters and include uppercase, lowercase, number, and special character.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      // ✅ Step 0: Check if user already exists
      const res = await axiosPublic.get(`/users/${formData.email}`);
      if (res.data) {
        Swal.fire({
          icon: "info",
          title: "Email Already Registered",
          text: "This email is already in use. Redirecting to login...",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/login");
        return;
      }
    } catch (err) {
      // ✅ if status !== 404 → actual server error
      if (err.response?.status !== 404) {
        Swal.fire({
          icon: "error",
          title: "Something went wrong",
          text: "Please try again later.",
        });
        setLoading(false);
        return;
      }
    }

    try {
      const result = await createUser(formData.email, formData.password);
      const user = result.user;

      await updateProfile(user, {
        displayName: formData.name,
        photoURL: formData.image || "",
      });

      await sendEmailVerification(user);

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password, // Send password for backend hashing
        image: formData.image || "",
        role: "user",
      };
      console.log("Posting userData:", userData);

      await axiosPublic.post("/users", userData);

      Swal.fire({
        icon: "success",
        title: `Welcome ${formData.name}!`,
        text: "Please check your email for verification.",
        timer: 3000,
        showConfirmButton: false,
      });

      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await googleSignIn();
      const user = result.user;

      // Check if user exists in database
      await axiosPublic.get(`/users/${user.email}`);

      // Save new user to database
      const userData = {
        name: user.displayName,
        email: user.email,
        image: user.photoURL || "",
        role: "user",
      };

      const dbResponse = await axiosPublic.post("/users", userData);

      if (!dbResponse.data.insertedId) {
        throw new Error("Failed to save user to database");
      }

      // Success handling
      Swal.fire({
        icon: "success",
        title: `Welcome ${user.displayName || "User"}!`,
        text: "You have successfully signed up with Google.",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/");
    } catch (error) {
      console.error("Google signup error:", error);

      if (error.response?.status === 404) {
        // This is expected for new users, so we don't show an error
      } else {
        Swal.fire({
          icon: "error",
          title: "Google Sign-in Failed",
          text: error.message || "Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div
        className="shadow-2xl rounded-xl overflow-hidden w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        {/* Left: Form Section */}
        <div className="px-10 py-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Sign Up
          </h2>
          <form className="space-y-5 text-gray-600" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Type here"
                value={formData.name}
                onChange={handleFormChange}
                className={`w-full border px-4 py-3 rounded-md bg-white focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#D1A054]"
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Type here"
                value={formData.email}
                onChange={handleFormChange}
                className={`w-full border px-4 py-3 rounded-md bg-white focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#D1A054]"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block mb-1 font-medium">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleFormChange}
                className={`w-full border px-4 py-3 rounded-md bg-white focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#D1A054]"
                }`}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 text-xl text-gray-600 cursor-pointer ${
                  errors.password ? "-translate-y-1/2 top-[45%]" : "top-[55%]"
                }`}
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Profile Picture */}
            {/* <div>
              <label className="block mb-1 font-medium">Profile Picture</label>
              <input
                type="text"
                name="image"
                placeholder="Enter image URL"
                value={formData.image}
                onChange={handleFormChange}
                className="w-full border px-4 py-2 rounded-md bg-white focus:outline-none border-gray-300"
              />
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D1A054] hover:bg-[#D1A054B2] text-white py-3 rounded-md cursor-pointer font-semibold uppercase tracking-wide transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Signing Up...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Link to Login */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-[#D1A054] font-semibold hover:underline"
            >
              Go to log in
            </Link>
          </p>

          {/* Social Auth */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-md bg-white transition cursor-pointer hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-gray-700 font-medium">
                Sign up with Google
              </span>
            </button>
          </div>
        </div>

        {/* Right: Image Section */}
        <div className="flex items-center justify-center">
          <img
            src={authImg}
            alt="Signup Illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
