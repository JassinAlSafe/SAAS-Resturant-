"use client";

import { useState, useMemo, useCallback } from "react";
import { InventoryItem } from "@/lib/types";
import { GroupedInventoryItem } from "../types";

/**
 * Custom hook for filtering and sorting inventory items
 * 
 * Provides state and functions for:
 * - Category filtering
 * - Text search
 * - Sorting by field and direction
 * - Low stock filtering
 * - Computed filtered and sorted items
 */
export function useInventoryFilters(groupedItems: GroupedInventoryItem[]) {
  // Filter state
  const [categoryFilter, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<keyof InventoryItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Rename to updateCategoryFilter to avoid naming conflicts with React's setState pattern
  const updateCategoryFilter = useCallback((category: string) => {
    setCategory(category);
  }, []);

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
    return result.sort((a, b) => {
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
  }, [filteredGroupedItems, sortField, sortDirection]);

  // Reset filters function from the .tsx version
  const resetFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setSortField("name");
    setSortDirection("asc");
    setShowLowStockOnly(false);
  };

  return {
    // Filter state and setters
    categoryFilter,
    setCategoryFilter: updateCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    showLowStockOnly,
    setShowLowStockOnly,

    // Results
    filteredGroupedItems,
    sortedFilteredItems,

    // Additional utilities
    resetFilters,
    hasActiveFilters:
      searchQuery !== "" ||
      categoryFilter !== "all" ||
      sortField !== "name" ||
      sortDirection !== "asc" ||
      showLowStockOnly,
  };
} 