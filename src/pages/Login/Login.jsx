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
      login(formData.email, formData.password)
        .then(async (result) => {
          const loggedUser = result.user;

          if (loggedUser.emailVerified) {
            try {
              // ১. Check MongoDB if user already exists
              const res = await axiosPublic.get(
                `/users?email=${loggedUser.email}`
              );
              const existingUser = res.data;

              if (!existingUser) {
                // ২. যদি না থাকে, তাহলে user DB-তে insert করো
                const saveUser = {
                  name: loggedUser.displayName || "User",
                  email: loggedUser.email,
                  image: loggedUser.photoURL || "",
                  password: loggedUser.password || "",
                  role: "user",
                };

                await axiosPublic.post("/users", saveUser);
              }

              // ৩. Navigate success
              Swal.fire({
                icon: "success",
                title: "Login successful 🎉",
                text: "Welcome back!",
                timer: 3000,
                showConfirmButton: false,
              });
              navigate(from, { replace: true });
            } catch (dbError) {
              console.error("MongoDB Error:", dbError);
              Swal.fire({
                icon: "warning",
                title: "Login Warning",
                text: "Logged in, but failed to save user in DB.",
              });
            }
          } else {
            Swal.fire({
              icon: "warning",
              title: "Email Not Verified",
              text: "Please verify your email before logging in.",
            });
          }
        })
        .catch((error) => {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Please check your credentials and try again.",
          });
        });
    }
  };


   const handleGoogleSignup = () => {
      googleSignIn()
        .then((result) => {
          const user = result.user;
  
          console.log("Google signup user payload:", {
            name: user.displayName,
            email: user.email,
            image: user.photoURL,
            role: "user",
          });
  
          // 🔻 Save user to the database
          axiosPublic
            .post("/users", {
              name: user.displayName,
              email: user.email,
              image: user.photoURL,
              role: "user",
            })
            .then((res) => {
              if (res.data.insertedId) {
                Swal.fire({
                  icon: "success",
                  title: `Welcome ${user.displayName || "User"}!`,
                  text: "You have successfully signed up with Google.",
                  timer: 2000,
                  showConfirmButton: false,
                });
                navigate("/");
              } else if (res.data.message === "user already exists") {
                Swal.fire({
                  icon: "info",
                  title: "Account Already Exists",
                  text: "You are already registered. Redirecting...",
                  timer: 2000,
                  showConfirmButton: false,
                });
                navigate("/");
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Something went wrong",
                  text: "Unable to sign up. Please try again.",
                });
              }
            })
  
            .catch((error) => {
              console.error("User Save Error:", error);
              Swal.fire({
                icon: "error",
                title: "Database Save Failed",
                text: error.message || "Please try again.",
              });
            });
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Google Sign-in Failed",
            text: error.message || "Please try again.",
          });
        })
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
              Sign In
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
              onClick={handleGoogleSignup}
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
