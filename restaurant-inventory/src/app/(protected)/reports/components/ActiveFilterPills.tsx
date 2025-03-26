"use client";

import { XIcon } from "lucide-react";
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
    <div className="flex flex-wrap gap-2 my-4">
      {filters.searchTerm && (
        <div className="badge badge-lg bg-primary bg-opacity-10 text-primary gap-1">
          <span>Search: {filters.searchTerm}</span>
          <button
            onClick={() => onRemoveFilter("searchTerm")}
            className="ml-1 rounded-full hover:bg-base-300 p-0.5"
          >
            <XIcon className="h-3 w-3" />
            <span className="sr-only">Remove search filter</span>
          </button>
        </div>
      )}

      {filters.category !== "all" && (
        <div className="badge badge-lg bg-primary bg-opacity-10 text-primary gap-1">
          <span>
            Category: {categoryNames[filters.category] || filters.category}
          </span>
          <button
            onClick={() => onRemoveFilter("category")}
            className="ml-1 rounded-full hover:bg-base-300 p-0.5"
          >
            <XIcon className="h-3 w-3" />
            <span className="sr-only">Remove category filter</span>
          </button>
        </div>
      )}

      {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
        <div className="badge badge-lg bg-primary bg-opacity-10 text-primary gap-1">
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
            className="ml-1 rounded-full hover:bg-base-300 p-0.5"
          >
            <XIcon className="h-3 w-3" />
            <span className="sr-only">Remove range filter</span>
          </button>
        </div>
      )}
    </div>
  );
}
