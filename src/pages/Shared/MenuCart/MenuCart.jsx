import React, { useContext } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";

const MenuCart = ({ cartDetails }) => {
  const { name, image, recipe, price, _id } = cartDetails;
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();
  const [, refetch] = useCart();

  const handleAddToCart = () => {
    if (user && user.email) {
      const cartItem = {
        menuId: _id, // food id
        email: user.email, // logged-in user email
        name, // ✅ required in schema
        image,
        price,
        quantity: 1,
      };

      axiosSecure
        .post("/carts", cartItem)
        .then((res) => {
          if (res.data._id || res.data.insertedId) {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Item added to cart",
              showConfirmButton: false,
              timer: 1500,
            });
            // Refetch cart to update the cart count
            refetch();
          }
        })
        .catch((err) => {
          console.error("Failed to add to cart", err.response?.data || err);
        });
    } else {
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
          onClick={() => handleAddToCart(cartDetails)}
          className="btn btn-outline bg-[#E8E8E8] hover:bg-[#1F2937] border-0 border-b-4 text-[#BB8506] uppercase md:text-lg px-8 py-5 rounded-lg mt-3 md:mt-6"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default MenuCart;
