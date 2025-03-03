"use client";

import { useState, useMemo } from "react";
import { ShoppingListItem } from "@/lib/services/shopping-list-service";

export function useShoppingListFilters(items: ShoppingListItem[]) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPurchased, setShowPurchased] = useState(false);

  // Filtered shopping list items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesPurchasedFilter = showPurchased ? true : !item.isPurchased;

      return matchesSearch && matchesCategory && matchesPurchasedFilter;
    });
  }, [items, searchTerm, selectedCategory, showPurchased]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setShowPurchased(false);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    showPurchased,
    setShowPurchased,
    filteredItems,
    resetFilters,
  };
}
