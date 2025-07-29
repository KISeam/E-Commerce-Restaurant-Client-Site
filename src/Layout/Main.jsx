import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../pages/Shared/Footer/Footer";
import Navbar from "../pages/Shared/Navbar/Navbar";
import image from "../assets/logo.png";

const Main = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Show loader for the first 3 seconds
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-orange-500 flex flex-col items-center justify-center z-50">
        <div className="w-24 h-24 mb-8 relative">
          <div className="absolute inset-0 border-4 border-white border-t-orange-500 rounded-full animate-spin"></div>
          <img
            src={image}
            alt="Loading logo"
            className="w-full h-full object-contain p-2"
          />
        </div>
        <div className="w-48 h-2 bg-orange-300 rounded-full overflow-hidden">
          <div className="h-full bg-white animate-progress"></div>
        </div>
      </div>
    );
  }

  // Special routes without navbar/footer
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return (
      <div>
        <Outlet />
      </div>
    );
  }

  // Main layout
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Main;
