import { useState, useMemo } from "react";
import { InventoryItem } from "@/lib/types";

export function useInventoryFilters(items: InventoryItem[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter items based on search term and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  // Sort filtered items
  const sortedFilteredItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aValue: any = a[sortField as keyof InventoryItem];
      let bValue: any = b[sortField as keyof InventoryItem];

      // Handle string comparisons
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Compare values
      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredItems, sortField, sortDirection]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortField("name");
    setSortDirection("asc");
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filteredItems,
    sortedFilteredItems,
    resetFilters,
    hasActiveFilters:
      searchTerm !== "" ||
      selectedCategory !== "all" ||
      sortField !== "name" ||
      sortDirection !== "asc",
  };
}
