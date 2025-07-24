import { useState, useEffect, useMemo } from "react";

const useSelectedProducts = (initialCart = [], initialSelectedIds = []) => {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);

  // Memoize cart to avoid unnecessary re-renders
  const stableCart = useMemo(() => initialCart, [JSON.stringify(initialCart)]);

  useEffect(() => {
    // Ensure selectedIds only include IDs that still exist in the cart
    const validIds = stableCart.map(item => item._id);
    setSelectedIds(prevIds => prevIds.filter(id => validIds.includes(id)));
  }, [stableCart]);

  // Filter cart items that match selectedIds
  const selectedProducts = useMemo(() => {
    return stableCart.filter(item => selectedIds.includes(item._id));
  }, [stableCart, selectedIds]);

  const toggleProductSelection = (id) => {
    setSelectedIds(prevIds =>
      prevIds.includes(id)
        ? prevIds.filter(prevId => prevId !== id)
        : [...prevIds, id]
    );
  };

  const calculateSelectedTotal = () => {
    return selectedProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  console.log(selectedProducts);

  return {
    selectedProducts,
    selectedIds,
    toggleProductSelection,
    calculateSelectedTotal
  };
};

export default useSelectedProducts;
