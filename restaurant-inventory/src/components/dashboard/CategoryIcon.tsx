"use client";

import React from "react";
import {
  FiPackage,
  FiShoppingBag,
  FiHome,
  FiSettings,
  FiBarChart2,
  FiShoppingCart,
} from "react-icons/fi";

interface CategoryIconProps {
  categoryName: string;
  className?: string;
}

export const CategoryIcon = ({
  categoryName,
  className = "h-5 w-5 text-white",
}: CategoryIconProps) => {
  // Map category names to appropriate icons
  switch (categoryName) {
    case "Meat":
      return <FiShoppingBag className={className} />;
    case "Produce":
      return <FiHome className={className} />;
    case "Dairy":
      return <FiSettings className={className} />;
    case "Dry Goods":
      return <FiBarChart2 className={className} />;
    case "Seafood":
      return <FiShoppingCart className={className} />;
    default:
      return <FiPackage className={className} />;
  }
};
