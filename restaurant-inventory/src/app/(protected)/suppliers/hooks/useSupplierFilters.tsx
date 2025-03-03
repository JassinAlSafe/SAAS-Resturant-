"use client";

import { useState, useMemo } from "react";
import { Supplier } from "@/lib/types";

export function useSupplierFilters(suppliers: Supplier[]) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered suppliers based on search term
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) {
      return suppliers; // Return all suppliers if no search term
    }

    const lowercaseSearch = searchTerm.toLowerCase();

    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(lowercaseSearch) ||
        (supplier.contactName &&
          supplier.contactName.toLowerCase().includes(lowercaseSearch)) ||
        (supplier.email &&
          supplier.email.toLowerCase().includes(lowercaseSearch)) ||
        (supplier.phone &&
          supplier.phone.toLowerCase().includes(lowercaseSearch)) ||
        (supplier.address &&
          supplier.address.toLowerCase().includes(lowercaseSearch))
    );
  }, [suppliers, searchTerm]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredSuppliers,
    resetFilters,
  };
}
