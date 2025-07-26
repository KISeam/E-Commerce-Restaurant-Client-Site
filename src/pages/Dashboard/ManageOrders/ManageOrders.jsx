import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import {
  FaSearch,
  FaFilter,
  FaEnvelope,
  FaTrash,
  FaSave,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaDollarSign,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const ManageOrders = () => {
  const axiosSecure = useAxiosSecure();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipping: 0,
    delivered: 0,
    canceled: 0,
  });
  const [statusChanges, setStatusChanges] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: "orderDate",
    direction: "desc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Status options
  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "shipping", label: "Shipping" },
    { value: "delivered", label: "Delivered" },
    { value: "canceled", label: "Canceled" },
  ];

  // Order status options
  const orderStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "shipping", label: "Shipping" },
    { value: "delivered", label: "Delivered" },
    { value: "canceled", label: "Canceled" },
  ];

  // Fetch all orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosSecure.get("/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setOrders(response.data);
        setFilteredOrders(response.data);
        setLoading(false);
        calculateStats(response.data);

        // Initialize status changes
        const initialStatusChanges = {};
        response.data.forEach((order) => {
          initialStatusChanges[order._id] = order.status;
        });
        setStatusChanges(initialStatusChanges);
      } catch (err) {
        setError("Failed to fetch orders");
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Calculate order statistics
  const calculateStats = (orders) => {
    const stats = {
      total: orders.length,
      pending: 0,
      shipping: 0,
      delivered: 0,
      canceled: 0,
    };

    orders.forEach((order) => {
      if (order.status) {
        stats[order.status]++;
      }
    });

    setStats(stats);
  };

  // Apply filters
  useEffect(() => {
    let result = orders;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order._id.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query) ||
          order.customer.phoneNumber.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, statusFilter, searchQuery]);

  // Handle temporary status change
  const handleTempStatusChange = (orderId, newStatus) => {
    setStatusChanges((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  // Toggle row expansion
  const toggleRowExpansion = (orderId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const paginatedOrders = sortedOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Save status change to backend with confirmation
  const saveStatusChange = async (order) => {
    const newStatus = statusChanges[order._id];

    if (newStatus === order.status) {
      Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "Status hasn't changed",
        showConfirmButton: false,
        timer: 1500,
        background: "#f8f9fa",
      });
      return;
    }

    // Show confirmation dialog before saving
    const result = await Swal.fire({
      title: "Confirm Status Change?",
      html: `Are you sure you want to change the status of order <b>#${order._id.substring(
        0,
        8
      )}</b> from <span class="${getStatusBadgeClass(
        order.status
      )} px-2 py-1 rounded">${
        order.status
      }</span> to <span class="${getStatusBadgeClass(
        newStatus
      )} px-2 py-1 rounded">${newStatus}</span>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update status!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      // Revert to original status if canceled
      setStatusChanges((prev) => ({
        ...prev,
        [order._id]: order.status,
      }));
      return;
    }

    try {
      await axiosSecure.patch(
        `/orders/${order._id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update local state
      const updatedOrders = orders.map((o) =>
        o._id === order._id ? { ...o, status: newStatus } : o
      );

      setOrders(updatedOrders);
      calculateStats(updatedOrders);

      // Update status changes
      setStatusChanges((prev) => ({
        ...prev,
        [order._id]: newStatus,
      }));

      // Send email notification
      try {
        await axiosSecure.post("/email/send-order-emails", {
          order: {
            ...order,
            status: newStatus,
          },
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }

      // Show success notification
      Swal.fire({
        icon: "success",
        title: "Order Updated!",
        html: `Order status changed to <span class="${getStatusBadgeClass(
          newStatus
        )} px-2 py-1 rounded">${newStatus}</span>`,
        showConfirmButton: false,
        timer: 2000,
        background: "#f8f9fa",
      });
    } catch (err) {
      console.error("Error updating order:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update order status",
        confirmButtonColor: "#f97316",
      });
    }
  };

  // Helper function for status badge classes
  const getStatusBadgeClass = (status) => {
    const statusStyles = {
      pending: "bg-amber-100 text-amber-800",
      shipping: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
    };

    return statusStyles[status] || "bg-gray-100 text-gray-800";
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    return (
      <span
        className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadgeClass(
          status
        )}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Handle order deletion
  const handleDeleteOrder = async (order) => {
    Swal.fire({
      title: "Delete Order?",
      text: `Are you sure you want to delete order #${order._id}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.delete(`/orders/${order._id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          // Update local state
          const updatedOrders = orders.filter((o) => o._id !== order._id);
          setOrders(updatedOrders);
          calculateStats(updatedOrders);

          // Send cancellation email
          try {
            await axiosSecure.post("/email/send-order-emails", {
              order: {
                ...order,
                status: "canceled",
              },
              action: "cancellation",
            });
          } catch (emailError) {
            console.error("Email sending failed:", emailError);
          }

          // Show success notification
          Swal.fire({
            icon: "success",
            title: "Order Deleted!",
            text: `Order #${order._id} has been deleted`,
            showConfirmButton: false,
            timer: 2000,
            background: "#f8f9fa",
          });
        } catch (err) {
          console.error("Error deleting order:", err);
          Swal.fire({
            icon: "error",
            title: "Deletion Failed",
            text: "Failed to delete order",
            confirmButtonColor: "#f97316",
          });
        }
      }
    });
  };

  // Send custom email notification
  const sendEmailNotification = async (order) => {
    const { value: message } = await Swal.fire({
      title: `Send Notification to ${order.customer.name}`,
      input: "textarea",
      inputLabel: "Message",
      inputPlaceholder: "Type your notification message here...",
      inputAttributes: {
        "aria-label": "Type your notification message here",
      },
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Send",
    });

    if (message) {
      try {
        await axiosSecure.post("/email/send-order-emails", {
          order,
          customMessage: message,
        });

        Swal.fire({
          icon: "success",
          title: "Notification Sent!",
          text: "Your message has been sent to the customer",
          showConfirmButton: false,
          timer: 2000,
          background: "#f8f9fa",
        });
      } catch (err) {
        console.error("Error sending email:", err);
        Swal.fire({
          icon: "error",
          title: "Sending Failed",
          text: "Failed to send notification",
          confirmButtonColor: "#f97316",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 text-xl font-medium">{error}</div>
        <button
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Orders
              </h1>
              <p className="mt-2 text-gray-600">
                View, manage, and track customer orders
              </p>
            </div>
            <div className="text-sm bg-white border border-orange-100 text-orange-700 px-4 py-2 rounded-lg">
              Showing{" "}
              <span className="font-semibold">
                {indexOfFirstOrder + 1}-
                {Math.min(indexOfLastOrder, sortedOrders.length)}
              </span>{" "}
              of <span className="font-semibold">{sortedOrders.length}</span>{" "}
              orders
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 mb-8">
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-orange-500">
            <div className="text-gray-500 text-sm font-medium">
              Total Orders
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-amber-400">
            <div className="text-gray-500 text-sm font-medium">Pending</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.pending}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
            <div className="text-gray-500 text-sm font-medium">Shipping</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.shipping}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
            <div className="text-gray-500 text-sm font-medium">Delivered</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.delivered}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-red-500">
            <div className="text-gray-500 text-sm font-medium">Canceled</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.canceled}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-8 text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="statusFilter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Status
              </label>
              <div className="relative">
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md bg-white cursor-pointer"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search Orders
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-md bg-white"
                  placeholder="Order ID, customer, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="flex items-center px-4 py-2.5 border border-orange-500 text-orange-600 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-orange-50 transition-colors w-full justify-center cursor-pointer"
              >
                <FaFilter className="mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg text-gray-600 border border-gray-200">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No orders found
              </h3>
              <p className="text-gray-500">
                Try changing your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Order ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-orange-600 transition-colors"
                        onClick={() => handleSort("orderDate")}
                      >
                        <div className="flex items-center">
                          <span>Date</span>
                          {sortConfig.key === "orderDate" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? (
                                <FaChevronUp size={12} />
                              ) : (
                                <FaChevronDown size={12} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-orange-600 transition-colors"
                        onClick={() => handleSort("total")}
                      >
                        <div className="flex items-center">
                          <span>Total</span>
                          {sortConfig.key === "total" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? (
                                <FaChevronUp size={12} />
                              ) : (
                                <FaChevronDown size={12} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedOrders.map((order) => (
                      <React.Fragment key={order._id}>
                        <tr
                          className={`hover:bg-orange-50 transition-colors cursor-pointer ${
                            expandedRows[order._id] ? "bg-orange-50" : ""
                          }`}
                          onClick={() => toggleRowExpansion(order._id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <span>#{order._id.substring(0, 8)}</span>
                              <span className="ml-2">
                                {expandedRows[order._id] ? (
                                  <FaChevronUp
                                    size={12}
                                    className="text-orange-500"
                                  />
                                ) : (
                                  <FaChevronDown
                                    size={12}
                                    className="text-orange-500"
                                  />
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1 text-orange-500" />
                              {new Date(order.orderDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <FaDollarSign className="mr-1 text-orange-500" />
                              {order.total.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <select
                                value={statusChanges[order._id] || order.status}
                                onChange={(e) =>
                                  handleTempStatusChange(
                                    order._id,
                                    e.target.value
                                  )
                                }
                                className="block w-32 pl-3 pr-8 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md bg-white"
                              >
                                {orderStatusOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveStatusChange(order);
                                }}
                                className="flex items-center px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors shadow-sm"
                                title="Save Status"
                              >
                                <FaSave className="mr-1" />
                                <span className="hidden sm:inline">Save</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendEmailNotification(order);
                                }}
                                className="p-2 text-gray-600 hover:text-orange-600 transition-colors rounded-full hover:bg-orange-50"
                                title="Send Notification"
                              >
                                <FaEnvelope />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOrder(order);
                                }}
                                className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                title="Delete Order"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expandedRows[order._id] && (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 bg-orange-25">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                    <span className="bg-orange-500 w-1 h-4 mr-2 rounded"></span>
                                    Order Items
                                  </h3>
                                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                    <div className="grid grid-cols-4 gap-2 font-medium text-sm text-gray-500 uppercase tracking-wider px-2 pb-2">
                                      <div>Item</div>
                                      <div>Price</div>
                                      <div>Qty</div>
                                      <div>Subtotal</div>
                                    </div>
                                    <div className="space-y-2">
                                      {order.items.map((item, index) => (
                                        <div
                                          key={index}
                                          className="grid grid-cols-4 gap-2 bg-white p-2 rounded border border-gray-100"
                                        >
                                          <div className="font-medium text-gray-900">
                                            {item.name}
                                          </div>
                                          <div className="text-gray-500">
                                            ${item.price.toFixed(2)}
                                          </div>
                                          <div className="text-gray-500">
                                            {item.quantity}
                                          </div>
                                          <div className="font-medium text-gray-900">
                                            $
                                            {(
                                              item.price * item.quantity
                                            ).toFixed(2)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                    <span className="bg-orange-500 w-1 h-4 mr-2 rounded"></span>
                                    Customer Information
                                  </h3>
                                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                    <div className="space-y-3">
                                      <div className="flex">
                                        <div className="w-8 flex items-center">
                                          <FaUser className="text-orange-500" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-semibold text-gray-500">
                                            Name
                                          </div>
                                          <div className="font-medium">
                                            {order.customer.name}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex">
                                        <div className="w-8 flex items-center">
                                          <FaEnvelope className="text-orange-500" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-semibold text-gray-500">
                                            Email
                                          </div>
                                          <div>{order.customer.email}</div>
                                        </div>
                                      </div>
                                      <div className="flex">
                                        <div className="w-8 flex items-center">
                                          <FaPhone className="text-orange-500" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-semibold text-gray-500">
                                            Phone
                                          </div>
                                          <div>
                                            {order.customer.phoneNumber}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex">
                                        <div className="w-8 flex items-center">
                                          <FaMapMarkerAlt className="text-orange-500" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-semibold text-gray-500">
                                            Address
                                          </div>
                                          <div>{order.customer.address}</div>
                                        </div>
                                      </div>
                                      <div className="flex">
                                        <div className="w-8 flex items-center">
                                          <FaCalendarAlt className="text-orange-500" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-semibold text-gray-500">
                                            Order Date
                                          </div>
                                          <div>
                                            {new Date(
                                              order.orderDate
                                            ).toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {indexOfFirstOrder + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(indexOfLastOrder, sortedOrders.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {sortedOrders.length}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <FaChevronLeft
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>

                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? "z-10 bg-orange-50 border-orange-500 text-orange-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <FaChevronRight
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
