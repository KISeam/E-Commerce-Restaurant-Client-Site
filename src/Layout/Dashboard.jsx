// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaAd,
  FaBook,
  FaCalendar,
  FaEnvelope,
  FaHome,
  FaList,
  FaSearch,
  FaShippingFast,
  FaShoppingCart,
  FaUsers,
  FaUtensils,
  FaBars,
  FaTimes,
  FaChartLine,
  FaUserCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import useCart from "../hooks/useCart";
import useAdmin from "../hooks/useAdmin";
import useAuth from "../hooks/useAuth";
import logo from "../assets/logo.png";

const Dashboard = () => {
  const { user } = useAuth();
  const [cart] = useCart();
  const location = useLocation();
  const [isAdmin] = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  const navLinkStyles = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
    }`;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 font-sans">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-orange-50"
            >
              {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <h1 className="text-xl font-bold text-orange-600">BistroBoss</h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link to="/dashboard/cart">
              <div className="relative">
                <FaShoppingCart className="text-gray-600 text-xl" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </div>
            </Link>
            <Link>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                <img src={user?.photoURL} alt={user?.displayName} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white/90 backdrop-blur-lg border-r border-orange-100 shadow-xl z-40 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="mb-8 text-center pt-4">
            <img src={logo} alt="Logo" className="w-24 mx-auto" />
            <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">
              BistroBoss
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isAdmin ? "Administrator" : "Customer Dashboard"}
            </p>
          </div>

          <nav className="space-y-2 flex-grow">
            {isAdmin ? (
              <>
                <NavLink to="/dashboard/adminHome" className={navLinkStyles}>
                  <FaHome className="text-lg" />
                  <span>Admin Home</span>
                </NavLink>
                <NavLink to="/dashboard/addItems" className={navLinkStyles}>
                  <FaUtensils className="text-lg" />
                  <span>Add New Items</span>
                </NavLink>
                <NavLink to="/dashboard/manageItems" className={navLinkStyles}>
                  <FaList className="text-lg" />
                  <span>Manage Items</span>
                </NavLink>
                <NavLink to="/dashboard/addCategory" className={navLinkStyles}>
                  <FaAd className="text-lg" />
                  <span>Add Category</span>
                </NavLink>
                <NavLink to="/dashboard/manageOrders" className={navLinkStyles}>
                  <FaBook className="text-lg" />
                  <span>Manage Orders</span>
                </NavLink>
                <NavLink to="/dashboard/allUsers" className={navLinkStyles}>
                  <FaUsers className="text-lg" />
                  <span>All Users</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard/userHome" className={navLinkStyles}>
                  <FaHome className="text-lg" />
                  <span>User Home</span>
                </NavLink>
                <NavLink to="/dashboard/orderHistory" className={navLinkStyles}>
                  <FaCalendar className="text-lg" />
                  <span>Order History</span>
                </NavLink>
                <NavLink to="/dashboard/cart" className={navLinkStyles}>
                  <div className="flex items-center gap-3">
                    <FaShoppingCart className="text-lg" />
                    <span>My Cart</span>
                  </div>
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                </NavLink>
                <NavLink to="/dashboard/trackOrder" className={navLinkStyles}>
                  <FaShippingFast className="text-lg" />
                  <span>Track Order</span>
                </NavLink>
                <NavLink to="/dashboard/addReview" className={navLinkStyles}>
                  <FaAd className="text-lg" />
                  <span>Add a Review</span>
                </NavLink>
              </>
            )}

            <div className="border-t border-orange-200 my-4"></div>

            {/* Shared Links */}
            <NavLink to="/" className={navLinkStyles}>
              <FaHome className="text-lg" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/order/salad" className={navLinkStyles}>
              <FaSearch className="text-lg" />
              <span>Menu</span>
            </NavLink>
            <NavLink to="/contact" className={navLinkStyles}>
              <FaEnvelope className="text-lg" />
              <span>Contact</span>
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
