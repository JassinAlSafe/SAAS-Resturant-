"use client";

import { useState, useEffect } from "react";
import { Filter, X, XCircle, ChevronRight } from "lucide-react";
import { TabType } from "../types";

interface ReportsFilterProps {
  activeTab: TabType;
  onFilterChange: (filters: ReportFilters) => void;
  tabIndex?: number;
}

export interface ReportFilters {
  searchTerm: string;
  category: string;
  minAmount?: number;
  maxAmount?: number;
}

export function ReportsFilter({
  activeTab,
  onFilterChange,
  tabIndex,
}: ReportsFilterProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    searchTerm: "",
    category: "all",
    minAmount: undefined,
    maxAmount: undefined,
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category !== "all") count++;
    if (filters.minAmount !== undefined) count++;
    if (filters.maxAmount !== undefined) count++;
    setActiveFilterCount(count);
  }, [filters]);

  const handleFilterChange = (
    key: keyof ReportFilters,
    value: string | number | undefined
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Check if a range is active
  const isRangeActive =
    filters.minAmount !== undefined || filters.maxAmount !== undefined;

  return (
    <ul
      tabIndex={tabIndex}
      className="dropdown-content z-[1] menu p-0 shadow-lg bg-white rounded-lg w-80 border border-gray-200 mt-2"
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center">
            <Filter className="h-4 w-4 mr-2 text-blue-500" />
            Filter Options
          </h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "sales" ? "items" : "ingredients"
                }...`}
                value={filters.searchTerm}
                onChange={(e) =>
                  handleFilterChange("searchTerm", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
              />
              {filters.searchTerm && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={() => handleFilterChange("searchTerm", "")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Categories</option>
              {activeTab === "sales" ? (
                <>
                  <option value="main">Main Course</option>
                  <option value="appetizer">Appetizers</option>
                  <option value="dessert">Desserts</option>
                  <option value="beverage">Beverages</option>
                </>
              ) : (
                <>
                  <option value="produce">Produce</option>
                  <option value="meat">Meat</option>
                  <option value="dairy">Dairy</option>
                  <option value="dry-goods">Dry Goods</option>
                </>
              )}
            </select>
          </div>

          {/* Amount/Quantity Range */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">
                {activeTab === "sales" ? "Amount Range" : "Quantity Range"}
              </label>
              {isRangeActive && (
                <button
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    handleFilterChange("minAmount", undefined);
                    handleFilterChange("maxAmount", undefined);
                  }}
                >
                  Clear range
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minAmount",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxAmount",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-3 bg-gray-50 flex justify-end rounded-b-lg">
        <button
          onClick={() => {
            setFilters({
              searchTerm: "",
              category: "all",
              minAmount: undefined,
              maxAmount: undefined,
            });
            onFilterChange({
              searchTerm: "",
              category: "all",
              minAmount: undefined,
              maxAmount: undefined,
            });
          }}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => onFilterChange(filters)}
          className="ml-2 px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </ul>
  );
}
