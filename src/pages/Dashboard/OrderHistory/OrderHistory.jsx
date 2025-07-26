import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";

const OrderHistory = () => {
  const { user, dbUser } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Calculate order counts by status
  const orderCounts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      acc.total++;
      return acc;
    },
    { total: 0, pending: 0, shipping: 0, delivered: 0, canceled: 0 }
  );

  useEffect(() => {
    // Check if either user or dbUser exists and has an email property
    const userEmail = (dbUser && dbUser.email) || (user && user.email);

    if (userEmail) {
      axiosSecure
        .get(`/orders/user/${userEmail}`)
        .then((res) => {
          setOrders(res.data);
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

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

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

  const statusColors = {
    pending: "bg-orange-100 text-orange-800",
    shipping: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8 rounded-3xl">
      <div className="container mx-auto px-4">
        <SectionTitle
          subHeading={"Don't Worry"}
          heading={"Your Order History"}
          subHeadingColor="text-orange-600"
          headingColor="text-orange-900"
        />

        {/* Order Statistics */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 shadow-md border border-orange-100 text-center">
              <p className="text-sm text-orange-600 font-medium mb-1">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-orange-800">
                {orderCounts.total}
              </p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 shadow-md border border-orange-100 text-center">
              <p className="text-sm text-orange-600 font-medium mb-1">
                Pending
              </p>
              <p className="text-2xl font-bold text-orange-500">
                {orderCounts.pending}
              </p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 shadow-md border border-orange-100 text-center">
              <p className="text-sm text-blue-600 font-medium mb-1">Shipping</p>
              <p className="text-2xl font-bold text-blue-500">
                {orderCounts.shipping}
              </p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 shadow-md border border-orange-100 text-center">
              <p className="text-sm text-green-600 font-medium mb-1">
                Delivered
              </p>
              <p className="text-2xl font-bold text-green-500">
                {orderCounts.delivered}
              </p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 shadow-md border border-orange-100 text-center">
              <p className="text-sm text-red-600 font-medium mb-1">Canceled</p>
              <p className="text-2xl font-bold text-red-500">
                {orderCounts.canceled}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white bg-opacity-70 rounded-3xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-orange-200">
            <div className="inline-flex items-center justify-center bg-orange-100 rounded-full p-4 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-orange-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-orange-700 max-w-md mx-auto mb-6">
              You haven't placed any orders yet. Start shopping to see your
              order history here!
            </p>
            <button className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-medium py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden border border-orange-100 transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    expandedOrder === order._id
                      ? "bg-white"
                      : "hover:bg-white/60"
                  }`}
                  onClick={() => toggleOrder(order._id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="mr-4 bg-orange-100 p-3 rounded-xl">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-orange-600"
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
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-orange-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-orange-600 text-sm mt-1">
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-orange-700 text-sm font-medium">
                          Total
                        </p>
                        <p className="text-xl font-bold text-orange-800">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>

                      <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </div>

                      <div
                        className={`transform transition-transform duration-300 ${
                          expandedOrder === order._id ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-orange-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="border-t border-orange-200 px-6 py-5 bg-gradient-to-br from-orange-50 to-amber-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold text-orange-800 mb-4 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Customer Information
                        </h4>
                        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-orange-600 font-medium">
                                Name
                              </p>
                              <p className="text-orange-900 font-medium">
                                {order.customer.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-orange-600 font-medium">
                                Email
                              </p>
                              <p className="text-orange-900 font-medium">
                                {order.customer.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-orange-600 font-medium">
                                Phone
                              </p>
                              <p className="text-orange-900 font-medium">
                                {order.customer.phoneNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-orange-600 font-medium">
                                Address
                              </p>
                              <p className="text-orange-900 font-medium">
                                {order.customer.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-orange-800 mb-4 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Order Items ({order.items.length})
                        </h4>
                        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
                          <div className="space-y-4">
                            {order.items.map((item) => (
                              <div
                                key={item._id}
                                className="flex items-center pb-4 border-b border-orange-100 last:border-0 last:pb-0"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-xl border-2 border-orange-100"
                                />
                                <div className="ml-4 flex-1">
                                  <p className="font-bold text-orange-900">
                                    {item.name}
                                  </p>
                                  <div className="flex justify-between mt-2">
                                    <span className="text-orange-700">
                                      ${item.price.toFixed(2)} × {item.quantity}
                                    </span>
                                    <span className="font-bold text-orange-800">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="mt-2 flex justify-between">
                                    <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                                      {item.category}
                                    </span>
                                    <button className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Reorder
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-6 pt-4 border-t border-orange-100 flex justify-between items-center">
                            <div>
                              <p className="text-sm text-orange-700">
                                Order Total
                              </p>
                              <p className="text-xl font-bold text-orange-900">
                                ${order.total.toFixed(2)}
                              </p>
                            </div>
                            <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-5 rounded-full text-sm shadow-md transition-colors">
                              Track Order
                            </button>
                          </div>
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
  );
};

export default OrderHistory;
