import React, { useState, useEffect } from "react";
import {
  FaTrashAlt,
  FaShoppingBag,
  FaArrowLeft,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { FiShoppingCart, FiPackage } from "react-icons/fi";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";
import useSelectedProducts from "../../../hooks/useSelectedProducts";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";

const Cart = () => {
  const [cart, refetch, isLoading] = useCart();
  const axiosSecure = useAxiosSecure();
  const [localCart, setLocalCart] = useState([]);
  const {
    selectedProducts,
    selectedIds,
    toggleProductSelection,
    calculateSelectedTotal,
  } = useSelectedProducts(cart);

  useEffect(() => {
    if (cart.length > 0) {
      setLocalCart(
        cart.map((item) => ({ ...item, quantity: item.quantity || 1 }))
      );
    } else {
      setLocalCart([]);
    }
  }, [cart]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setLocalCart((prevCart) =>
      prevCart.map((item) =>
        item._id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axiosSecure.patch(`/carts/${id}`, { quantity: newQuantity });
      refetch();
    } catch (err) {
      console.error("Error updating quantity:", err);
      Swal.fire({
        title: "Update Failed",
        text: "Failed to update item quantity",
        icon: "error",
        background: "#fff",
      });
    }
  };

  const handleQuantityUpdate = (id, change) => {
    const item = localCart.find((i) => i._id === id);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + change);
    updateQuantity(id, newQuantity);
    handleQuantityChange(id, newQuantity);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Remove Item?",
      text: "This item will be removed from your cart",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove it",
      customClass: {
        container: "font-sans",
        title: "text-xl font-semibold text-gray-800",
        htmlContainer: "text-gray-600",
        confirmButton: "px-4 py-2 rounded-lg",
        cancelButton: "px-4 py-2 rounded-lg",
      },
      background: "#fff",
      backdrop: "rgba(0,0,0,0.1)",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/carts/${id}`);
        Swal.fire({
          title: "Removed!",
          text: "Item has been removed from your cart",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "#fff",
        });
        refetch();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Error!",
          text: "Failed to remove item",
          icon: "error",
          background: "#fff",
        });
        refetch();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-100 to-orange-200 flex items-center justify-center animate-pulse">
            <FiShoppingCart className="text-orange-500 text-4xl" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">0</span>
          </div>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-4">
          Loading your cart...
        </h3>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>
      </div>
    );
  }

  if (!localCart.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-8 rounded-2xl shadow-sm border border-orange-100 max-w-md w-full text-center">
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-orange-200">
            <FiShoppingCart className="text-orange-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Looks like you haven't added any items to your cart yet. Start
            shopping to fill it up!
          </p>
          <Link
            to="/order"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
          >
            <FaShoppingBag className="text-lg" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <SectionTitle
        subHeading={"Review your items"}
        heading={"Your Shopping Cart"}
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiShoppingCart className="text-orange-500 text-xl" />
                  Shopping Cart ({cart.length || 0} items)
                </h2>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    className="checkbox orange-checkbox border-gray-300 cursor-pointer"
                    checked={selectedProducts.length === cart.length}
                    onChange={() => {
                      if (selectedProducts.length === cart.length) {
                        selectedIds.forEach((id) => toggleProductSelection(id));
                      } else {
                        cart.forEach((item) => {
                          if (!selectedIds.includes(item._id)) {
                            toggleProductSelection(item._id);
                          }
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Select all
                  </label>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {localCart.map((item) => (
                <div
                  key={item._id}
                  className="p-5 flex flex-col sm:flex-row gap-5 items-start hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={selectedProducts.some((p) => p._id === item._id)}
                      onChange={() => toggleProductSelection(item._id)}
                      className="checkbox orange-checkbox border-gray-300 cursor-pointer"
                    />
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden w-20 h-20 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                            {item.name}
                          </h3>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-orange-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-500 text-sm mt-1 mb-3">
                          SKU: {item._id.substring(0, 8)}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-4">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                            <button
                              onClick={() => handleQuantityUpdate(item._id, -1)}
                              disabled={item.quantity <= 1}
                              className={`p-2 ${
                                item.quantity <= 1
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-orange-500 hover:bg-orange-50 cursor-pointer"
                              }`}
                            >
                              <FaMinus size={12} />
                            </button>
                            <div className="text-base font-bold w-12 text-center py-2 text-orange-600 bg-gray-50">
                              {item.quantity}
                            </div>
                            <button
                              onClick={() => handleQuantityUpdate(item._id, 1)}
                              className="p-2 text-orange-500 hover:bg-orange-50 cursor-pointer"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition cursor-pointer text-sm"
                          >
                            <FaTrashAlt size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/order"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition hover:underline"
            >
              <FaArrowLeft className="text-sm" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiPackage className="text-orange-500 text-xl" />
                Order Summary
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({selectedProducts.length} items)</span>
                  <span className="font-medium">
                    ${calculateSelectedTotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {calculateSelectedTotal() > 50 ? "FREE" : "$5.99"}
                  </span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Tax (8%)</span>
                  <span className="font-medium">
                    ${(calculateSelectedTotal() * 0.08).toFixed(2)}
                  </span>
                </div>

                <div className="h-px bg-gray-200 my-4"></div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">
                    $
                    {(
                      calculateSelectedTotal() +
                      (calculateSelectedTotal() > 50 ? 0 : 5.99) +
                      calculateSelectedTotal() * 0.08
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                to="/dashboard/payment"
                state={{
                  cart: cart,
                  selectedIds: selectedIds,
                }}
              >
                <button
                  disabled={selectedProducts.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all ${
                    selectedProducts.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 cursor-pointer hover:shadow-lg"
                  }`}
                >
                  Proceed to Checkout
                </button>
              </Link>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Free shipping on orders over $50</p>
                <p>Taxes calculated at checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
