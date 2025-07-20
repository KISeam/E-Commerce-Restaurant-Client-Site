import { useQuery } from "@tanstack/react-query";
import React from "react";
import { axiosSecure } from "./useAxiosSecure";
import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";

const useCart = () => {
  const { user } = useContext(AuthContext);
  const { refetch, data: cart = [], isLoading } = useQuery({
    queryKey: ["cart", user?.email],
    queryFn: async () => {
      const response = await axiosSecure.get(`/carts?email=${user?.email}`);
      return response.data;
    },
  });

  return [cart, refetch, isLoading];
};

export default useCart;
