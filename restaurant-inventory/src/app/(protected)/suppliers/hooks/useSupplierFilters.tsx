"use client";

import { useState, useEffect, useMemo } from "react";
import { Supplier, SupplierCategory } from "@/lib/types";

export function useSupplierFilters(suppliers: Supplier[]) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<SupplierCategory | null>(null);

  // Filter suppliers based on search term and selected category
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      // Filter by search term
      const matchesSearch =
        !searchTerm ||
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contactName &&
          supplier.contactName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (supplier.email &&
          supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.phone &&
          supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by category
      const matchesCategory =
        !selectedCategory || supplier.categories.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [suppliers, searchTerm, selectedCategory]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredSuppliers,
    resetFilters,
  };
}
