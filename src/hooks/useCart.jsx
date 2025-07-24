// useCart.jsx ✅ FIXED
import { useQuery } from "@tanstack/react-query";
import React, { useContext } from "react";
import useAxiosSecure from "./useAxiosSecure"; // ✅ default import
import { AuthContext } from "../providers/AuthProvider";

const useCart = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure(); // ✅ call the hook

  const { refetch, data: cart = [], isLoading } = useQuery({
    queryKey: ["cart", user?.email],
    enabled: !!user?.email, // ensures it doesn't run with null
    queryFn: async () => {
      const response = await axiosSecure.get(`/carts?email=${user.email}`);
      return response.data;
    },
  });

  return [cart, refetch, isLoading];
};

export default useCart;
