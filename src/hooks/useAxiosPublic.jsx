import axios from "axios";
import React from "react";

const axiosPublic = axios.create({
  baseURL: "https://e-commerce-restaurant-server-site.onrender.com" || "http://localhost:5000",
});

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
