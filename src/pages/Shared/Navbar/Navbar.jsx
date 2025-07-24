import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../../providers/AuthProvider";
import userImg from "../../../assets/others/profile.png";
import { FaShoppingCart } from "react-icons/fa";
import useCart from "../../../hooks/useCart";
import useAdmin from "../../../hooks/useAdmin";

const Navbar = () => {
  const { user, dbUser, logout } = useContext(AuthContext);
  const [cart] = useCart();
  const [isAdmin] = useAdmin();

  const handleLogout = () => {
    logout()
      .then(() => {})
      .catch((error) => console.log(error));
  };

  const navItems = [
    { name: "Home", path: "/" },
    ...(user
      ? [
          isAdmin
            ? { name: "Dashboard", path: "/dashboard/adminHome" }
            : { name: "Dashboard", path: "/dashboard/userHome" },
        ]
      : []),
    { name: "Our Menu", path: "/menu" },
    { name: "Order", path: "/order" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/50 text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="navbar flex justify-between items-center">
            {/* Left - Logo and Mobile Dropdown */}
            <div className="flex items-center gap-4">
              <div className="dropdown lg:hidden">
                <label tabIndex={0} className="btn btn-ghost">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-black rounded-box w-52"
                >
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          isActive ? "text-orange-500" : "text-white"
                        }
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                  {!user && (
                    <li>
                      <NavLink
                        to="/login"
                        className={({ isActive }) =>
                          isActive ? "text-orange-500" : "text-white"
                        }
                      >
                        Login
                      </NavLink>
                    </li>
                  )}
                </ul>
              </div>

              {/* Logo */}
              <Link to="/" className="flex flex-col leading-none">
                <span className="text-xl font-bold uppercase">BISTRO BOSS</span>
                <span className="text-sm tracking-[5px] uppercase">
                  Restaurant
                </span>
              </Link>
            </div>

            {/* Center - Nav Links (desktop only) */}
            <div className="hidden lg:flex">
              <ul className="menu menu-horizontal gap-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? "text-orange-500 hover:text-orange-400"
                          : "text-white hover:text-orange-500"
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
                {!user && (
                  <li>
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        isActive
                          ? "text-orange-500 hover:text-orange-400"
                          : "text-white hover:text-orange-500"
                      }
                    >
                      Login
                    </NavLink>
                  </li>
                )}
                <li className="relative">
                  <NavLink
                    to="/dashboard/cart"
                    className={({ isActive }) =>
                      isActive
                        ? "text-orange-500"
                        : "text-white hover:text-orange-500"
                    }
                  >
                    <FaShoppingCart className="text-2xl" />
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full">
                      {cart.length || 0}
                    </span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Right - Profile Dropdown if logged in */}
            {user && (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
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
                  className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-black rounded-box w-52"
                >
                  <li>
                    <NavLink
                      to="/profile"
                      className={({ isActive }) =>
                        isActive ? "text-orange-500" : "text-white"
                      }
                    >
                      Profile
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/settings"
                      className={({ isActive }) =>
                        isActive ? "text-orange-500" : "text-white"
                      }
                    >
                      Settings
                    </NavLink>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-white hover:text-orange-500 text-left w-full"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
