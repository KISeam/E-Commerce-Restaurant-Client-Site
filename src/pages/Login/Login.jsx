import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import bgImg from "../../assets/reservation/wood-grain-pattern-gray1x.png";
import authImg from "../../assets/others/authentication2.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const generateCaptcha = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const Login = () => {
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleSignIn } = useContext(AuthContext);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  let from = location.state?.from?.pathname || "/";

  const handleCaptchaReload = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setErrors((prev) => ({ ...prev, captchaInput: null }));
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!captchaInput.trim()) {
      newErrors.captchaInput = "Captcha is required.";
    } else if (captchaInput.trim().toUpperCase() !== captcha) {
      newErrors.captchaInput = "Captcha does not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      login(formData.email, formData.password)
        .then(async (result) => {
          const loggedUser = result.user;

          if (!loggedUser.emailVerified) {
            Swal.fire({
              icon: "warning",
              title: "Email Not Verified",
              text: "Please verify your email before logging in.",
            });
            return;
          }

          try {
            // Check if user exists in DB
            const res = await axiosPublic.get(`/users/${loggedUser.email}`);
            const existingUser = res.data;

            if (!existingUser) {
              throw new Error("User not found in database.");
            }

            // Show login success
            Swal.fire({
              icon: "success",
              title: "Login successful 🎉",
              text: "Welcome back!",
              timer: 3000,
              showConfirmButton: false,
            });
            setLoading(false);
            navigate(from, { replace: true });
          } catch (error) {
            setLoading(false);
            Swal.fire({
              icon: "error",
              title: "Access Denied",
              text: "You are not registered in the system.",
            });
          }
        })
        .catch((error) => {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Please check your credentials and try again.",
          });
        });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn();
      const user = result.user;

      // 🧪 Check if user already exists in DB
      try {
        const res = await axiosPublic.get(`/users/${user.email}`);
        if (res.data) {
          navigate("/");
          return;
        }
      } catch (error) {
        // Expected 404 means user doesn't exist
        if (error.response?.status !== 404) {
          console.error("User Check Error:", error);
          Swal.fire({
            icon: "error",
            title: "Something went wrong",
            text: "Failed to check user status. Please try again.",
          });
          return;
        }
      }

      // 🧾 Create new user entry in DB
      const newUser = {
        name: user.displayName || "Anonymous",
        email: user.email,
        image: user.photoURL || "",
        role: "user",
      };

      const saveRes = await axiosPublic.post("/users", newUser);

      if (saveRes.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: `Welcome ${newUser.name}!`,
          text: "Google signup successful 🎉",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/");
      } else {
        Swal.fire({
          icon: "error",
          title: "Signup failed",
          text: "Unable to save user info. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      Swal.fire({
        icon: "error",
        title: "Google Sign-in Failed",
        text: error.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-center bg-cover"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div
        className="shadow-2xl rounded-xl overflow-hidden w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        {/* Left: Illustration */}
        <div className="flex items-center justify-center">
          <img
            src={authImg}
            alt="Login Illustration"
            className="w-full h-auto"
          />
        </div>

        {/* Right: Login Form */}
        <div className="px-10 py-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Login
          </h2>
          <form
            className="space-y-5 text-gray-600"
            onSubmit={handleLoginSubmit}
          >
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

            <div>
              <label className="block mb-1 font-medium">Captcha</label>
              <input
                type="text"
                value={captcha}
                disabled
                className="w-full border border-gray-300 px-4 py-3 rounded-md bg-white font-mono text-lg"
              />
              <button
                type="button"
                onClick={handleCaptchaReload}
                className="text-sm text-blue-600 hover:underline hover:text-blue-800 cursor-pointer"
              >
                Reload Captcha
              </button>
              <input
                type="text"
                placeholder="Type the captcha here"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  setErrors((prev) => ({ ...prev, captchaInput: null }));
                }}
                className={`w-full mt-3 border px-4 py-3 rounded-md focus:outline-none focus:ring-2 bg-white ${
                  errors.captchaInput
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#D1A054]"
                }`}
              />
              {errors.captchaInput && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.captchaInput}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#D1A054] hover:bg-[#D1A054B2] text-white py-3 rounded-md font-semibold uppercase tracking-wide cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
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
                      d="M4 12a8 8 0 018-8V0
                      a12 12 0 100 24 12 12 0 000-24z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            New here?{" "}
            <Link
              to="/signup"
              rel="noopener noreferrer"
              className="text-[#D1A054] font-semibold hover:underline"
            >
              Create a New Account
            </Link>
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-md bg-white transition cursor-pointer hover:shadow-md"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-gray-700 font-medium">
                Sign in with Google
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
