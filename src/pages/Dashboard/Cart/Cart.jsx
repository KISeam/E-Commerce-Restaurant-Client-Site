import React from "react";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";

const Cart = () => {
  const [cart = [], refetch, isLoading] = useCart();
  const axiosSecure = useAxiosSecure();

  const totalPrice = cart.reduce(
    (total, item) => total + (item.price || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-orange-500"></span>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="text-center mt-16">
        <h2 className="text-3xl font-semibold text-gray-700">
          Your cart is empty
        </h2>
        <Link
          to="/order"
          className="inline-block mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  const handleDelete = async (id) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This item will be removed from your cart!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete it",
  });

  if (confirm.isConfirmed) {
    try {
      await axiosSecure.delete(`/carts/${id}`);
      Swal.fire("Deleted!", "Item has been removed.", "success");
      refetch(); // ✅ always refetch
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete item!", "error");
      refetch(); // ✅ always refetch
    }
  }
};


  return (
    <div className="p-6 md:p-10 bg-white shadow-lg rounded-2xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🛒 Items in Cart: {cart.length}
        </h2>
        <h2 className="text-2xl font-bold text-gray-800">
          💰 Total: ${totalPrice.toFixed(2)}
        </h2>
        <Link to="/dashboard/payment">
          <button className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-all cursor-pointer">
            Proceed to Pay
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-md">
          <thead className="bg-orange-100 text-orange-700">
            <tr className="text-left text-sm font-semibold uppercase">
              <th className="p-4">#</th>
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {cart.map((item, index) => (
              <tr
                key={item._id}
                className="border-t hover:bg-orange-50 transition"
              >
                <td className="p-4 font-medium">{index + 1}</td>
                <td className="p-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </td>
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4">${item.price?.toFixed(2)}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500 hover:text-red-700 transition cursor-pointer"
                    title="Remove from cart"
                  >
                    <FaTrashAlt size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cart;
