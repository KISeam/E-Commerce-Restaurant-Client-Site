import React, { useContext } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";

const MenuCart = ({ cartDetails }) => {
  const { name, image, recipe, price, _id, category } = cartDetails;
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();
  const [cart, refetch] = useCart();

  const handleAddToCart = async () => {
    if (!user || !user.email) {
      Swal.fire({
        title: "You are not Logged In",
        text: "Please login to add to the cart",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, login!",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login", { state: { from: location } });
        }
      });
      return;
    }

    try {
      // Check if item already exists in cart
      const existingItem = cart.find(item => item.menuId === _id && item.email === user.email);

      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + 1;
        await axiosSecure.patch(`/carts/${existingItem._id}`, { 
          quantity: newQuantity 
        });
        
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Quantity increased",
          text: `${name} quantity updated to ${newQuantity}`,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        // Add new item if it doesn't exist
        const cartItem = {
          menuId: _id,
          email: user.email,
          name,
          image,
          price,
          category,
          quantity: 1,
        };

        await axiosSecure.post("/carts", cartItem);
        
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Item added to cart",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      // Refetch cart to update UI
      refetch();
    } catch (err) {
      console.error("Failed to update cart", err.response?.data || err);
      Swal.fire({
        icon: "error",
        title: "Failed to update cart",
        text: "Please try again later",
      });
    }
  };

  return (
    <div className="bg-[#F3F3F3] rounded-xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="h-[300px] relative">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-[#BB8506] text-white px-3 py-2 rounded-lg">
          ${price}
        </div>
      </div>
      <div className="p-4 md:py-8 md:px-10 text-center">
        <h3 className="text-lg md:text-xl text-[#151515] font-semibold">
          {name}
        </h3>
        <p className="md:text-lg text-gray-600 mt-1 line-clamp-2">{recipe}</p>
        <button
          onClick={handleAddToCart}
          className="btn btn-outline bg-[#E8E8E8] hover:bg-[#1F2937] border-0 border-b-4 text-[#BB8506] uppercase md:text-lg px-8 py-5 rounded-lg mt-3 md:mt-6"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default MenuCart;