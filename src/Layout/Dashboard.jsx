import {
  FaAd,
  FaBook,
  FaCalendar,
  FaEnvelope,
  FaHome,
  FaList,
  FaSearch,
  FaShoppingCart,
  FaUsers,
  FaUtensils,
} from "react-icons/fa";
import { NavLink, Outlet } from "react-router-dom";
import useCart from "../hooks/useCart";
import useAdmin from "../hooks/useAdmin";

const Dashboard = () => {
  const [cart] = useCart();

  // TODO: get isAdmin value from the database
  const [isAdmin] = useAdmin();

  const navLinkStyles = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-orange-500 text-white shadow-sm"
        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
    }`;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-lg border-r border-orange-100 shadow-xl sticky top-0 h-screen p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">
            BistroBoss
          </h1>
          <p className="text-sm text-gray-500">Welcome to your dashboard</p>
        </div>

        <nav className="space-y-2">
          {/* Admin Navigation (if isAdmin is true) */}
          {isAdmin ? (  // Change this `true` to `isAdmin` after implementing the `useAdmin` hook
            <>
              <NavLink to="/dashboard/adminHome" className={navLinkStyles}>
                <FaHome />
                <span>Admin Home</span>
              </NavLink>
              <NavLink to="/dashboard/addItems" className={navLinkStyles}>
                <FaUtensils />
                <span>Add New Items</span>
              </NavLink>
              <NavLink to="/dashboard/manageItems" className={navLinkStyles}>
                <FaList />
                <span>Manage Items</span>
              </NavLink>
              <NavLink to="/dashboard/bookings" className={navLinkStyles}>
                <FaBook />
                <span>Manage Bookings</span>
              </NavLink>
              <NavLink to="/dashboard/allUsers" className={navLinkStyles}>
                <FaUsers />
                <span>All Users</span>
              </NavLink>
            </>
          ) : (
            // User Navigation (if isAdmin is false)
            <>
              <NavLink to="/dashboard/userHome" className={navLinkStyles}>
                <FaHome />
                <span>User Home</span>
              </NavLink>
              <NavLink to="/dashboard/history" className={navLinkStyles}>
                <FaCalendar />
                <span>Not History</span>
              </NavLink>
              <NavLink to="/dashboard/cart" className={navLinkStyles}>
                <FaShoppingCart />
                <div className="flex justify-between items-center w-full">
                  <span>My Cart</span>
                  <span className="text-sm bg-orange-500 text-white px-2 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                </div>
              </NavLink>
              <NavLink to="/dashboard/review" className={navLinkStyles}>
                <FaAd />
                <span>Add a Review</span>
              </NavLink>
              <NavLink to="/dashboard/paymentHistory" className={navLinkStyles}>
                <FaList />
                <span>Real Payment History</span>
              </NavLink>
            </>
          )}

          <div className="border-t border-orange-200 my-4"></div>

          {/* Shared Links */}
          <NavLink to="/" className={navLinkStyles}>
            <FaHome />
            <span>Home</span>
          </NavLink>
          <NavLink to="/order/salad" className={navLinkStyles}>
            <FaSearch />
            <span>Menu</span>
          </NavLink>
          <NavLink to="/contact" className={navLinkStyles}>
            <FaEnvelope />
            <span>Contact</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
