"use client";

import { X } from "lucide-react";
import { ReportFilters } from "./ReportsFilter";

interface ActiveFilterPillsProps {
  filters: ReportFilters;
  onRemoveFilter: (key: keyof ReportFilters) => void;
  activeTab: string;
}

export function ActiveFilterPills({
  filters,
  onRemoveFilter,
  activeTab,
}: ActiveFilterPillsProps) {
  // Check if there are any active filters
  const hasActiveFilters =
    filters.searchTerm ||
    filters.category !== "all" ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined;

  if (!hasActiveFilters) return null;

  // Category name mapping for better display
  const categoryNames: Record<string, string> = {
    main: "Main Course",
    appetizer: "Appetizers",
    dessert: "Desserts",
    beverage: "Beverages",
    produce: "Produce",
    meat: "Meat",
    dairy: "Dairy",
    "dry-goods": "Dry Goods",
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.searchTerm && (
        <div className="flex items-center py-1.5 px-3 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          <span>Search: {filters.searchTerm}</span>
          <button
            onClick={() => onRemoveFilter("searchTerm")}
            className="ml-2 rounded-full hover:bg-blue-100 p-0.5 transition-colors"
            aria-label="Remove search filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {filters.category !== "all" && (
        <div className="flex items-center py-1.5 px-3 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          <span>
            Category: {categoryNames[filters.category] || filters.category}
          </span>
          <button
            onClick={() => onRemoveFilter("category")}
            className="ml-2 rounded-full hover:bg-blue-100 p-0.5 transition-colors"
            aria-label="Remove category filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
        <div className="flex items-center py-1.5 px-3 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          <span>
            {activeTab === "sales" ? "Amount" : "Quantity"}:{" "}
            {filters.minAmount !== undefined ? filters.minAmount : "Any"} to{" "}
            {filters.maxAmount !== undefined ? filters.maxAmount : "Any"}
          </span>
          <button
            onClick={() => {
              onRemoveFilter("minAmount");
              onRemoveFilter("maxAmount");
            }}
            className="ml-2 rounded-full hover:bg-blue-100 p-0.5 transition-colors"
            aria-label="Remove range filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
