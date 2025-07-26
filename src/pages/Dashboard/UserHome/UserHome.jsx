import React, { useState, useEffect, useContext } from "react";
import {
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaUser,
  FaShoppingCart,
  FaHistory,
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import userImg from "../../../assets/others/profile.png";
import { AuthContext } from "../../../providers/AuthProvider";
import { Link } from "react-router-dom";
import useCart from "../../../hooks/useCart";

const UserHome = () => {
  const [cart] = useCart();
  const { user, dbUser } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.email) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosSecure.get("/users/dashboard/data"); // Adjusted endpoint to match backend
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [axiosSecure, user?.email]);

  // Map titles to icons
  const getIconForTitle = (title) => {
    switch (title) {
      case "Total Orders":
        return <FaBox className="text-xl" />;
      case "Pending Orders":
        return <FaClock className="text-xl" />;
      case "Delivered Orders":
        return <FaCheckCircle className="text-xl" />;
      case "Shipping":
        return <FaShippingFast className="text-xl" />;
      case "Canceled Orders":
        return <FaTimes className="text-xl" />;
      default:
        return <FaBox className="text-xl" />;
    }
  };

  // Process stats with icons
  const stats =
    dashboardData?.stats?.length > 0
      ? dashboardData.stats.map((stat) => ({
          ...stat,
          icon: getIconForTitle(stat.title),
        }))
      : [
          {
            title: "Total Orders",
            value: 0,
            icon: <FaBox className="text-xl" />,
          },
          {
            title: "Pending Orders",
            value: 0,
            icon: <FaClock className="text-xl" />,
          },
          {
            title: "Delivered Orders",
            value: 0,
            icon: <FaCheckCircle className="text-xl" />,
          },
          {
            title: "Shipping",
            value: 0,
            icon: <FaShippingFast className="text-xl" />,
          },
          {
            title: "Canceled Orders",
            value: 0,
            icon: <FaTimes className="text-xl" />,
          },
        ];

  const recentOrders =
    dashboardData?.recentOrders?.length > 0
      ? dashboardData.recentOrders
      : [
          {
            id: "N/A",
            date: "No orders yet",
            amount: "$0.00",
            status: "N/A",
            statusColor: "bg-gray-100 text-gray-700",
          },
        ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-800 text-lg font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center border border-gray-200">
          <div className="text-orange-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-all shadow-sm font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 md:p-10 font-sans rounded-3xl">
      <div className="">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-base">
              Welcome back, {user?.displayName || dbUser?.name || "User"}!
              Here's your overview.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
              <p className="text-gray-700 font-medium">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="relative">
              {user?.photoURL || dbUser?.image ? (
                <img
                  src={user?.photoURL || dbUser?.image || userImg}
                  alt={`${
                    user?.displayName || dbUser?.name || "User"
                  } profile picture`}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 bg-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-xl">
                  {user?.displayName?.charAt(0) ||
                    dbUser?.name?.charAt(0) ||
                    "U"}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all hover:shadow-lg hover:border-orange-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-800 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100 text-2xl text-orange-600 ">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100 max-h-[500px] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Orders
              </h2>
              <button className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center">
                View all orders <FaHistory className="ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">
                          {order.id}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {order.date}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">
                          {order.amount}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full text-orange-600 ${order.statusColor}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Account Summary
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-lg mr-4">
                    <FaUser className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <p className="font-medium text-gray-800">Verified User</p>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Active
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-lg mr-4">
                    <FaShoppingCart className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Cart</p>
                    <p className="font-medium text-gray-800">
                      {cart.length} items
                    </p>
                  </div>
                </div>
                <Link to="/dashboard/cart">
                  <button className="text-sm font-medium text-orange-600 hover:text-orange-700 cursor-pointer">
                    View Cart
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/order"
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-orange-100 transition-colors group cursor-pointer"
            >
              <button className="flex flex-col items-center justify-center group cursor-pointer">
                <div className="bg-orange-100 p-3 rounded-lg mb-2 group-hover:bg-orange-200 transition-colors">
                  <FaBox className="text-orange-600 text-xl group-hover:text-orange-700" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">
                  New Order
                </span>
              </button>
            </Link>
            <Link
              to="/dashboard/trackOrder"
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-orange-100 transition-colors group cursor-pointer"
            >
              <button className="flex flex-col items-center justify-center group cursor-pointer">
                <div className="bg-orange-100 p-3 rounded-lg mb-2 group-hover:bg-orange-200 transition-colors">
                  <FaShippingFast className="text-orange-600 text-xl group-hover:text-orange-700" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">
                  Track Order
                </span>
              </button>
            </Link>
            <Link
              to="/dashboard/orderHistory"
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-orange-100 transition-colors group cursor-pointer"
            >
              <button className="flex flex-col items-center justify-center group cursor-pointer">
                <div className="bg-orange-100 p-3 rounded-lg mb-2 group-hover:bg-orange-200 transition-colors">
                  <FaCheckCircle className="text-orange-600 text-xl group-hover:text-orange-700" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">
                  Order History
                </span>
              </button>
            </Link>
            <Link
              to="/dashboard/paymentHistory"
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-orange-100 transition-colors group cursor-pointer"
            >
              <button className="flex flex-col items-center justify-center group cursor-pointer">
                <div className="bg-orange-100 p-3 rounded-lg mb-2 group-hover:bg-orange-200 transition-colors">
                  <FaBox className="text-orange-600 text-xl group-hover:text-orange-700" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">
                  Payment Methods
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
