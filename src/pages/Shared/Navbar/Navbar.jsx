import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../providers/AuthProvider";
import userImg from "../../../assets/others/profile.png";
import { FaShoppingCart, FaTimes, FaBars } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useCart from "../../../hooks/useCart";
import useAdmin from "../../../hooks/useAdmin";

const Navbar = () => {
  const { user, dbUser, logout } = useContext(AuthContext);
  const [cart] = useCart();
  const [isAdmin] = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout()
      .then(() => navigate("/"))
      .catch((error) => console.log(error));
  };

  // Navigation items for all users
  const commonNavItems = [
    { name: "Home", path: "/" },
    { name: "Our Menu", path: "/menu" },
    { name: "Order", path: "/order" },
    { name: "Contact Us", path: "/contact" },
  ];

  // Navigation items for logged in users
  const getAuthNavItems = () => {
    if (!user) return [];

    return [
      {
        name: "Dashboard",
        path: isAdmin ? "/dashboard/adminHome" : "/dashboard/userHome",
      },
    ];
  };

  const navItems = [...commonNavItems, ...getAuthNavItems()];

  const handleMobileNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const mobileMenuVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-sm" : "bg-black/70"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex flex-col leading-none z-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-xl font-bold uppercase tracking-tight">
              BISTRO BOSS
            </span>
            <span className="text-xs tracking-[0.3em] uppercase">
              Restaurant
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `relative px-1 py-2 font-medium transition-colors ${
                        isActive
                          ? "text-orange-500 hover:text-orange-400"
                          : "text-white hover:text-orange-500"
                      }`
                    }
                  >
                    {item.name}
                    {isActive(item.path) && (
                      <motion.span
                        layoutId="desktopActiveIndicator"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"
                        transition={{ type: "spring", bounce: 0.25 }}
                      />
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            {!user ? (
              <NavLink
                to="/login"
                className="px-4 py-2 font-medium text-white hover:text-orange-500 transition-colors"
              >
                Login
              </NavLink>
            ) : (
              <div className="flex items-center gap-4">
                <NavLink
                  to="/dashboard/cart"
                  className="relative p-2 text-white hover:text-orange-500 transition-colors"
                >
                  <FaShoppingCart className="text-xl" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cart.length}
                    </span>
                  )}
                </NavLink>

                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-circle avatar"
                  >
                    <div className="w-10 rounded-full border-2 border-transparent hover:border-orange-500 transition-all">
                      <img
                        src={user?.photoURL || dbUser?.image || userImg}
                        alt={`${
                          user?.displayName || dbUser?.name || "User"
                        } profile picture`}
                        className="object-cover"
                      />
                    </div>
                  </label>
                  <ul
                    tabIndex={0}
                    className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-black/90 backdrop-blur-sm rounded-box w-52 border border-gray-800"
                  >
                    <li>
                      <button
                        onClick={handleLogout}
                        className="text-white hover:text-orange-500 text-left"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-orange-500 transition-colors z-50"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={backdropVariants}
                  className="fixed inset-0 bg-black/80 lg:hidden z-40"
                  onClick={() => setMobileMenuOpen(false)}
                />

                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={mobileMenuVariants}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed top-0 left-0 h-full w-80 max-w-full bg-black/95 backdrop-blur-lg shadow-2xl z-50 overflow-y-auto"
                >
                  <div className="flex flex-col h-full p-6">
                    <div className="flex justify-between items-center mb-8">
                      <Link
                        to="/"
                        className="flex flex-col leading-none"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-xl font-bold uppercase tracking-tight">
                          BISTRO BOSS
                        </span>
                        <span className="text-xs tracking-[0.3em] uppercase">
                          Restaurant
                        </span>
                      </Link>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-white hover:text-orange-500 transition-colors"
                      >
                        <FaTimes className="text-xl" />
                      </button>
                    </div>

                    <nav className="flex-1">
                      <ul className="space-y-2">
                        {commonNavItems.map((item) => (
                          <li key={item.path}>
                            <button
                              onClick={() => handleMobileNavClick(item.path)}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center cursor-pointer ${
                                isActive(item.path)
                                  ? "text-orange-500 bg-gray-900/50 hover:bg-gray-800"
                                  : "text-white hover:bg-gray-800"
                              }`}
                            >
                              <span className="font-medium">{item.name}</span>
                              {isActive(item.path) && (
                                <motion.span
                                  layoutId="mobileActiveIndicator"
                                  className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-2"
                                />
                              )}
                            </button>
                          </li>
                        ))}

                        {user &&
                          getAuthNavItems().map((item) => (
                            <li key={item.path}>
                              <button
                                onClick={() => handleMobileNavClick(item.path)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center cursor-pointer ${
                                  isActive(item.path)
                                    ? "text-orange-500 bg-gray-900/50 hover:bg-gray-800"
                                    : "text-white hover:bg-gray-800"
                                }`}
                              >
                                <span className="font-medium">{item.name}</span>
                                {isActive(item.path) && (
                                  <motion.span
                                    layoutId="mobileActiveIndicator"
                                    className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-2"
                                  />
                                )}
                              </button>
                            </li>
                          ))}
                      </ul>

                      <div className="mt-8 pt-6 border-t border-gray-800">
                        {user ? (
                          <>
                            <button
                              onClick={() => {
                                handleLogout();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 rounded-lg transition-colors text-red-400 hover:bg-gray-800 hover:text-red-300 cursor-pointer"
                            >
                              <span className="font-medium">Logout</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleMobileNavClick("/login")}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                              isActive("/login")
                                ? "text-orange-500 bg-gray-900/50 hover:bg-gray-800"
                                : "text-white hover:bg-gray-800"
                            }`}
                          >
                            <span className="font-medium">Login</span>
                          </button>
                        )}
                      </div>

                      {user && (
                        <div className="mt-4">
                          <button
                            onClick={() =>
                              handleMobileNavClick("/dashboard/cart")
                            }
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center cursor-pointer ${
                              isActive("/dashboard/cart")
                                ? "text-orange-500 bg-gray-900/50 hover:bg-gray-800"
                                : "text-white hover:bg-gray-800"
                            }`}
                          >
                            <FaShoppingCart className="mr-3" />
                            <span className="font-medium">Cart</span>
                            {cart.length > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {cart.length}
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </nav>

                    <div className="mt-auto pt-6 text-sm text-gray-400">
                      © {new Date().getFullYear()} Bistro Boss Restaurant
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
