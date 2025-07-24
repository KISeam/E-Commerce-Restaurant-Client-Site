import React from "react";
import useAuth from "../../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import {
  FaDollarSign,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaChartBar,
  FaStar,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const AdminHome = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const {
    data: adminStats,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await axiosSecure.get("/admin/admin-stats");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Data Loading Error
          </h3>
          <p className="text-gray-600 mb-6">
            {error.message || "Failed to load dashboard data"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Colors for charts
  const COLORS = ["#f97316", "#f59e0b", "#eab308", "#ef4444", "#22c55e"];
  const STATUS_COLORS = {
    Pending: "#eab308",
    Processing: "#f59e0b",
    Completed: "#22c55e",
    Cancelled: "#ef4444",
  };

  // Format data for charts
  const orderStatusData = adminStats?.orderStatus
    ? Object.entries(adminStats.orderStatus)
        .map(([status, data]) => ({
          status,
          count: data.count,
          revenue: data.revenue,
        }))
        .filter((item) => item.count > 0)
    : [];

  // Use direct data from adminStats
  const revenueTrendData = adminStats?.revenueTrend || [];

  // FIX: Ensure category names are properly displayed
  const topCategoriesData = adminStats?.topCategories?.length
    ? adminStats.topCategories.map((cat) => ({
        ...cat,
        name: cat.name || "Uncategorized",
      }))
    : [];

  const topItemsData = adminStats?.topItems?.length ? adminStats.topItems : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-8 rounded-3xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome back,{" "}
          <span className="text-orange-500">
            {user?.displayName || "Admin"}
          </span>
        </h1>
        <p className="text-gray-600 mt-1">
          Here's your store performance overview
        </p>
        <div className="w-16 h-1 bg-orange-500 rounded-full mt-2"></div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Revenue"
          value={`$${adminStats?.revenue?.toFixed(2) || "0.00"}`}
          icon={<FaDollarSign className="h-6 w-6" />}
          color="bg-gradient-to-r from-orange-400 to-orange-600"
          trend="+12.5% from last month"
        />
        <StatCard
          title="Customers"
          value={adminStats?.users || "0"}
          icon={<FaUsers className="h-6 w-6" />}
          color="bg-gradient-to-r from-amber-400 to-amber-600"
          trend="+8.2% from last month"
        />
        <StatCard
          title="Products"
          value={adminStats?.menuItems || "0"}
          icon={<FaBox className="h-6 w-6" />}
          color="bg-gradient-to-r from-yellow-400 to-yellow-600"
          trend="+5 new products"
        />
        <StatCard
          title="Orders"
          value={adminStats?.orders || "0"}
          icon={<FaShoppingCart className="h-6 w-6" />}
          color="bg-gradient-to-r from-red-400 to-red-600"
          trend="+14.3% from last month"
        />
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center ml-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueTrendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  labelStyle={{
                    color: "#4B5563", // text-gray-600
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                  formatter={(value, name) => {
                    if (name === "revenue")
                      return [`$${Number(value).toFixed(2)}`, "Total Revenue"];
                    if (name === "orders") return [value, "Total Orders"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Total Revenue"
                />
                <Bar
                  dataKey="orders"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  name="Total Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Order Status Distribution
              </h2>
              <p className="text-sm text-gray-500">
                Current status of all orders
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {adminStats?.orders || 0} total orders
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  label={({ status, percent }) =>
                    `${status}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        STATUS_COLORS[entry.status] ||
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const status = data.status;
                      const count = data.count;
                      const revenue = data.revenue;

                      return (
                        <div className="bg-white border border-gray-200 rounded-md shadow p-2 text-gray-800">
                          <p className="font-medium">{`${status}: ${count} Orders`}</p>
                          {revenue !== undefined && (
                            <p className="text-gray-500">{`Total Revenue: $${Number(
                              revenue
                            ).toFixed(2)}`}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={(value) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                  payload={orderStatusData.map((item, index) => ({
                    value: item.status,
                    type: "circle",
                    color:
                      STATUS_COLORS[item.status] ||
                      COLORS[index % COLORS.length],
                  }))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Analysis Section */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 mb-8">
        {/* Top Categories Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Top Categories
              </h2>
              <p className="text-sm text-gray-500">
                By revenue and quantity sold
              </p>
            </div>
            <FaChartBar className="text-orange-500 text-xl" />
          </div>
          <div className="h-72">
            {topCategoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topCategoriesData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    className="text-gray-600 uppercase text-center"
                    tick={{ fontSize: 14, fill: "#6b7280", fontWeight: 600 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 space-y-2">
                            <p className="text-[#3b82f6]">
                              Sold Quantity :{" "}
                              <span className="font-semibold">
                                {data.count}
                              </span>
                            </p>
                            <p className="text-orange-500">
                              Total Revenue :{" "}
                              <span className="font-semibold">
                                ${Number(data.revenue).toFixed(2)}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#f97316"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="count"
                    name="Items Sold"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Top Selling Items
              </h2>
              <p className="text-sm text-gray-500">Most popular products</p>
            </div>
            <FaStar className="text-amber-500 text-xl" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Items Sold
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topItemsData.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="font-bold mr-2">{item.count}</span>
                        <span className="text-xs text-gray-400">items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaDollarSign className="text-green-500 mr-1 text-xs" />
                        <span className="font-semibold">
                          {item.revenue.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {topItemsData.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      No top selling items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
            <p className="text-sm text-gray-500">Latest system events</p>
          </div>
          <button className="text-orange-500 hover:text-orange-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {(adminStats?.recentActivities || []).map((activity, index) => (
            <div
              key={index}
              className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0 group hover:bg-orange-50 hover:bg-opacity-30 p-3 rounded-lg transition-colors duration-200"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-800">
                  {activity.user}{" "}
                  <span className="font-normal text-gray-600">
                    {activity.action}
                  </span>
                </p>
                {activity.amount && (
                  <span className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full mt-1">
                    {activity.amount}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap group-hover:text-orange-600 transition-colors">
                {activity.time}
              </div>
            </div>
          ))}
          {adminStats?.recentActivities?.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <div
      className={`${color} text-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 transform`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold tracking-wide uppercase opacity-85 mb-2">
            {title}
          </p>
          <p className="text-3xl font-extrabold mb-3">{value}</p>
          <p className="text-xs font-medium opacity-85">{trend}</p>
        </div>
        <div className="bg-white bg-opacity-25 p-4 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
