"use client";

import { useState, useEffect } from "react";
import { FilterIcon, XCircleIcon } from "lucide-react";
import { TabType } from "../types";

interface ReportsFilterProps {
  activeTab: TabType;
  onFilterChange: (filters: ReportFilters) => void;
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
}: ReportsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    <div>
      {/* Filter Button Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={`btn ${
          activeFilterCount > 0 ? "btn-primary" : "btn-outline"
        } btn-sm h-9 rounded-lg flex items-center gap-1.5`}
      >
        <FilterIcon className="h-3.5 w-3.5" />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <div className="badge badge-sm badge-secondary">
            {activeFilterCount}
          </div>
        )}
      </button>

      {/* Filter Drawer */}
      <div className={`drawer drawer-end ${isOpen ? "drawer-open" : ""}`}>
        <input
          id="filter-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isOpen}
          readOnly
        />
        <div className="drawer-side z-50">
          <label
            htmlFor="filter-drawer"
            className="drawer-overlay"
            onClick={() => setIsOpen(false)}
          ></label>
          <div className="p-4 w-80 min-h-full bg-base-100 text-base-content">
            <div className="mb-5">
              <div className="text-xl flex items-center gap-2 font-bold">
                <FilterIcon className="h-5 w-5" />
                Filter {activeTab === "sales" ? "Sales" : "Inventory"}
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
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
                    className={`input input-bordered w-full pr-8 ${
                      filters.searchTerm ? "input-primary" : ""
                    }`}
                  />
                  {filters.searchTerm && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content text-opacity-60 hover:text-opacity-100"
                      onClick={() => handleFilterChange("searchTerm", "")}
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className={`select select-bordered w-full ${
                    filters.category !== "all" ? "select-primary" : ""
                  }`}
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

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">
                    {activeTab === "sales" ? "Amount Range" : "Quantity Range"}
                  </label>
                  {isRangeActive && (
                    <button
                      className="text-xs text-primary hover:opacity-80"
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
                      className={`input input-bordered w-full ${
                        filters.minAmount !== undefined ? "input-primary" : ""
                      }`}
                    />
                  </div>
                  <span className="text-base-content text-opacity-60">to</span>
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
                      className={`input input-bordered w-full ${
                        filters.maxAmount !== undefined ? "input-primary" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-6 border-t">
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    const resetFilters = {
                      searchTerm: "",
                      category: "all",
                      minAmount: undefined,
                      maxAmount: undefined,
                    };
                    setFilters(resetFilters);
                    onFilterChange(resetFilters);
                    setIsOpen(false);
                  }}
                >
                  Reset
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
