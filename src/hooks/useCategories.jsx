import { useState, useEffect } from "react";
import useAxiosPublic from "./useAxiosPublic";

const useCategories = () => {
    const axiosPublic = useAxiosPublic();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosPublic.get("/categories");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [axiosPublic]);

    return { categories, loading };
};

export default useCategories;