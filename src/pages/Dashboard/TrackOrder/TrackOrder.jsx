import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimes,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaInfoCircle,
  FaShoppingBag,
} from "react-icons/fa";
import Swal from "sweetalert2";

const TrackOrder = () => {
  const { user, dbUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const userEmail = (dbUser && dbUser.email) || (user && user.email);

    if (userEmail) {
      axiosSecure
        .get(`/orders/user/${userEmail}`)
        .then((res) => {
          // Add mock estimated delivery dates for demonstration
          const ordersWithDates = res.data.map((order) => {
            const orderDate = new Date(order.orderDate);
            const estimatedDelivery = new Date(orderDate);
            estimatedDelivery.setDate(
              orderDate.getDate() + Math.floor(Math.random() * 5) + 2
            );

            return {
              ...order,
              estimatedDelivery: estimatedDelivery.toISOString(),
              trackingNumber: `TRK${Math.floor(
                100000000 + Math.random() * 900000000
              )}`,
            };
          });

          setOrders(ordersWithDates);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Order fetch error:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user, dbUser, axiosSecure]);

  // Format date without date-fns
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-amber-500",
          text: "Processing",
          icon: <FaBox className="text-white" />,
          description: "Your order is being prepared",
        };
      case "shipping":
        return {
          color: "bg-blue-500",
          text: "On the Way",
          icon: <FaTruck className="text-white" />,
          description: "Your order is out for delivery",
        };
      case "delivered":
        return {
          color: "bg-green-500",
          text: "Delivered",
          icon: <FaCheckCircle className="text-white" />,
          description: "Your order has been delivered",
        };
      case "canceled":
        return {
          color: "bg-red-500",
          text: "Canceled",
          icon: <FaTimes className="text-white" />,
          description: "Your order has been canceled",
        };
      default:
        return {
          color: "bg-gray-500",
          text: "Unknown",
          icon: <FaInfoCircle className="text-white" />,
          description: "Status unknown",
        };
    }
  };

  // Status visualization component
  const StatusVisualizer = ({ status }) => {
    const statusInfo = getStatusInfo(status);
    const statuses = ["pending", "shipping", "delivered"];
    const currentIndex = statuses.indexOf(status);

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center relative mb-2">
          {statuses.map((s, index) => {
            const isActive = index <= currentIndex;
            const statusInfo = getStatusInfo(s);

            return (
              <div key={s} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? statusInfo.color : "bg-gray-200"
                  }`}
                >
                  {statusInfo.icon}
                </div>
                <span className="text-xs mt-1 font-medium text-gray-700">
                  {statusInfo.text}
                </span>
              </div>
            );
          })}

          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
            <div
              className={`h-full ${statusInfo.color}`}
              style={{
                width:
                  currentIndex >= 0
                    ? currentIndex === 0
                      ? "33%"
                      : currentIndex === 1
                      ? "66%"
                      : "100%"
                    : "0%",
              }}
            ></div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">
            {getStatusInfo(status).description}
          </p>
        </div>
      </div>
    );
  };

  // Handle order selection for details view
  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    // Confirm cancellation
    const result = await Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (!result.isConfirmed) return;

    try {
      // Make API call to cancel order
      await axiosSecure.patch(`/orders/cancel/${orderId}`);

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: "canceled" } : order
        )
      );

      // Show success message
      Swal.fire({
        title: "Order Canceled!",
        text: "Your order has been canceled successfully",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Cancel order error:", error);

      // Show error message
      Swal.fire({
        title: "Cancellation Failed",
        text: error.response?.data?.message || "Failed to cancel order",
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl shadow-xl overflow-hidden">
          <div className="py-6 px-6 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaShoppingBag className="text-white" />
              Track Your Orders
            </h1>
            <p className="mt-2 opacity-90 max-w-2xl">
              View real-time updates, delivery status, and manage all your
              recent orders
            </p>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 mx-auto border-t-2 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-orange-700 font-medium">
                Loading your orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-orange-100 text-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <FaShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mt-4">
                No Orders Found
              </h3>
              <p className="mt-1 text-gray-500 max-w-md mx-auto">
                You haven't placed any orders yet. Start shopping to see your
                orders here!
              </p>
              <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-full transition duration-300">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                          <span>
                            Order #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {order.trackingNumber}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400" />
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <StatusVisualizer status={order.status} />
                  </div>

                  <label className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-orange-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {order.customer.address}...
                      </span>
                    </div>
                    <button
                      onClick={() => toggleOrderDetails(order._id)}
                      className="text-orange-600 hover:text-orange-800 font-medium text-sm flex items-center cursor-pointer"
                    >
                      {expandedOrder === order._id
                        ? "Hide Details"
                        : "View Details"}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ml-1 transition-transform ${
                          expandedOrder === order._id ? "rotate-90" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </label>

                  {expandedOrder === order._id && (
                    <div className="border-t border-gray-100 p-5 bg-orange-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-orange-500" />
                            Shipping Information
                          </h4>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-600 font-medium">
                              {order.customer.name}
                            </p>
                            <p className="text-gray-600">
                              {order.customer.address}
                            </p>
                            <p className="text-gray-600 mt-2">
                              Phone: {order.customer.phone}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FaCalendarAlt className="text-orange-500" />
                            Delivery Timeline
                          </h4>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-600">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">
                                Order Placed:
                              </span>
                              <span className="font-medium">
                                {formatDate(order.orderDate)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">
                                Estimated Delivery:
                              </span>
                              <span className="font-medium text-orange-600">
                                {formatDate(order.estimatedDelivery)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FaShoppingBag className="text-orange-500" />
                            Order Items
                          </h4>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex py-3 border-b border-gray-100 last:border-0"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="ml-4 flex-1">
                                  <p className="font-medium text-gray-800">
                                    {item.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity}
                                  </p>
                                  <p className="text-sm font-medium">
                                    ${item.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            {order.status === "pending" && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition cursor-pointer"
                              >
                                Cancel Order
                              </button>
                            )}

                            {order.status === "canceled" && (
                              <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-pointer">
                                Order Canceled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
