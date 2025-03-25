"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { InventoryItem } from "@/lib/types";
import { GroupedInventoryItem } from "../types";

export function useInventoryFilters(groupedItems: GroupedInventoryItem[]) {
  console.log("useInventoryFilters called with groupedItems:", groupedItems?.length);

  // Filter state
  const [categoryFilter, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<keyof InventoryItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Rename to updateCategoryFilter to avoid naming conflicts with React's setState pattern
  const updateCategoryFilter = useCallback((category: string) => {
    console.log("⭐ updateCategoryFilter called with:", category, {
      currentCategory: categoryFilter,
      setCategory: typeof setCategory
    });

    try {
      setCategory(category);
      console.log("✅ Category was set to:", category);
    } catch (error) {
      console.error("❌ Error setting category:", error);
    }
  }, [categoryFilter]);

  // Log the types of the functions we're returning
  useEffect(() => {
    console.log("useInventoryFilters hook state:", {
      categoryFilter,
      searchQuery,
      sortField,
      sortDirection,
      showLowStockOnly,
      updateCategoryFilter: typeof updateCategoryFilter,
      setCategory: typeof setCategory,
      setSearchQuery: typeof setSearchQuery,
      setSortField: typeof setSortField,
      setSortDirection: typeof setSortDirection,
      setShowLowStockOnly: typeof setShowLowStockOnly
    });
  }, [categoryFilter, searchQuery, sortField, sortDirection, showLowStockOnly,
    updateCategoryFilter, setSearchQuery, setSortField, setSortDirection, setShowLowStockOnly]);

  // Filter grouped items based on search query, selected category, and low stock filter
  const filteredGroupedItems = useMemo(() => {
    if (!groupedItems || !Array.isArray(groupedItems)) return [];

    let result = [...groupedItems];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Filter by low stock
    if (showLowStockOnly) {
      result = result.filter((item) => {
        const reorderLevel = item.reorder_level ?? 5;
        const isItemLowStock =
          item.totalQuantity <= reorderLevel && item.totalQuantity > 0;
        const isItemOutOfStock = item.totalQuantity === 0;
        return isItemLowStock || isItemOutOfStock;
      });
    }

    return result;
  }, [groupedItems, searchQuery, categoryFilter, showLowStockOnly]);

  // Memoize the filtered and sorted items
  const sortedFilteredItems = useMemo(() => {
    if (!filteredGroupedItems || filteredGroupedItems.length === 0) {
      return [];
    }

    const result = [...filteredGroupedItems];

    // Apply sorting
    const sortedResult = result.sort((a, b) => {
      const aValue = a[sortField as keyof GroupedInventoryItem];
      const bValue = b[sortField as keyof GroupedInventoryItem];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === "asc" ? -1 : 1;
      if (bValue == null) return sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
          : bValue.toLowerCase().localeCompare(aValue.toLowerCase());
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    console.log("sortedFilteredItems computed:", {
      filteredGroupedItems: filteredGroupedItems?.length,
      sortedResult: sortedResult?.length,
      sortField,
      sortDirection
    });

    return sortedResult;
  }, [filteredGroupedItems, sortField, sortDirection]);

  return {
    categoryFilter,
    setCategoryFilter: updateCategoryFilter,
    setCategory,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    showLowStockOnly,
    setShowLowStockOnly,
    filteredGroupedItems,
    sortedFilteredItems,
  };
} 