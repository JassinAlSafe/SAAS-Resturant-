"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Tag,
  Check,
  RefreshCw,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  showPurchased: boolean;
  onShowPurchasedChange: (value: boolean) => void;
  categories: string[];
  sortBy: string;
  onSortChange: (value: string) => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (value: "asc" | "desc") => void;
  onClearFilters: () => void;
}

export default function SearchFilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showPurchased,
  onShowPurchasedChange,
  categories,
  sortBy,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
  onClearFilters,
}: SearchFilterBarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate active filters
  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchTerm.trim() !== "" ||
    showPurchased ||
    sortBy !== "date" ||
    sortDirection !== "desc";

  // Check if on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current && !isMobile) {
      searchInputRef.current.focus();
    }
  }, [isMobile]);

  // Sort options
  const sortOptions = [
    { value: "date", label: "Date Added", icon: null },
    { value: "name", label: "Name", icon: null },
    { value: "category", label: "Category", icon: null },
    { value: "cost", label: "Estimated Cost", icon: null },
    { value: "quantity", label: "Quantity", icon: null },
    { value: "urgency", label: "Urgency", icon: null },
  ];

  // Get current sort option label
  const currentSortOption =
    sortOptions.find((option) => option.value === sortBy)?.label ||
    "Date Added";

  // Get popular categories for quick filters
  const quickFilterCategories = categories.slice(0, 5);

  // Function to format category name when it's long
  const formatCategoryName = (name: string) => {
    return name.length > 15 ? `${name.slice(0, 13)}...` : name;
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Bar */}
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input input-bordered w-full pl-10 h-12 focus:outline-primary"
              aria-label="Search shopping list items"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-3 flex items-center"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 lg:flex-nowrap">
            {/* Category Dropdown */}
            <div className="dropdown">
              <label
                tabIndex={0}
                className="btn btn-outline flex justify-between items-center gap-2 w-full sm:w-auto min-w-[180px] h-12 px-4"
              >
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="flex-grow text-left">
                  {selectedCategory === "all"
                    ? "All Categories"
                    : formatCategoryName(selectedCategory)}
                </span>
                <ChevronDown className="h-4 w-4" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-lg w-56 mt-1"
              >
                <li className="menu-title">Filter by Category</li>
                <li>
                  <a
                    className={selectedCategory === "all" ? "active" : ""}
                    onClick={() => onCategoryChange("all")}
                  >
                    {selectedCategory === "all" && (
                      <Check className="h-4 w-4" />
                    )}
                    All Categories
                  </a>
                </li>
                {categories.map((category) => (
                  <li key={category}>
                    <a
                      className={selectedCategory === category ? "active" : ""}
                      onClick={() => onCategoryChange(category)}
                    >
                      {selectedCategory === category && (
                        <Check className="h-4 w-4" />
                      )}
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort Dropdown */}
            <div className="dropdown">
              <label
                tabIndex={0}
                className="btn btn-outline flex justify-between items-center gap-2 w-full sm:w-auto min-w-[180px] h-12 px-4"
              >
                {sortDirection === "asc" ? (
                  <ArrowUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-gray-500" />
                )}
                <span className="flex-grow text-left">
                  Sort: {currentSortOption}
                </span>
                <ChevronDown className="h-4 w-4" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-lg w-56 mt-1"
              >
                <li className="menu-title">Sort By</li>
                {sortOptions.map((option) => (
                  <li key={option.value}>
                    <a
                      className={sortBy === option.value ? "active" : ""}
                      onClick={() => onSortChange(option.value)}
                    >
                      {sortBy === option.value && <Check className="h-4 w-4" />}
                      {option.label}
                    </a>
                  </li>
                ))}
                <li className="menu-title">Direction</li>
                <li>
                  <a
                    className={sortDirection === "asc" ? "active" : ""}
                    onClick={() => onSortDirectionChange("asc")}
                  >
                    <ArrowUp className="h-4 w-4" />
                    Ascending (A-Z, 0-9)
                  </a>
                </li>
                <li>
                  <a
                    className={sortDirection === "desc" ? "active" : ""}
                    onClick={() => onSortDirectionChange("desc")}
                  >
                    <ArrowDown className="h-4 w-4" />
                    Descending (Z-A, 9-0)
                  </a>
                </li>
              </ul>
            </div>

            {/* Show Purchased Checkbox */}
            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg h-12">
              <CheckSquare className="h-4 w-4 text-gray-500" />
              <span className="text-sm whitespace-nowrap">Show Purchased</span>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={showPurchased}
                onChange={(e) => onShowPurchasedChange(e.target.checked)}
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                className="btn btn-ghost text-gray-600 hover:text-gray-900 h-12"
                onClick={onClearFilters}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Quick Access Category Filters */}
        {!isMobile && quickFilterCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <div
              className={cn(
                "badge px-3 py-2 cursor-pointer",
                selectedCategory === "all"
                  ? "badge-primary"
                  : "badge-outline hover:bg-gray-100"
              )}
              onClick={() => onCategoryChange("all")}
            >
              All
            </div>
            {quickFilterCategories.map((category) => (
              <div
                key={category}
                className={cn(
                  "badge px-3 py-2 cursor-pointer",
                  selectedCategory === category
                    ? "badge-primary"
                    : "badge-outline hover:bg-gray-100"
                )}
                onClick={() => onCategoryChange(category)}
              >
                {formatCategoryName(category)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">
            Active filters:
          </span>
          {selectedCategory !== "all" && (
            <div className="badge badge-sm badge-info gap-1 py-3">
              <Tag className="h-3 w-3" />
              {formatCategoryName(selectedCategory)}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onCategoryChange("all")}
              />
            </div>
          )}

          {searchTerm && (
            <div className="badge badge-sm badge-secondary gap-1 py-3">
              <Search className="h-3 w-3" />
              {searchTerm.length > 15
                ? searchTerm.slice(0, 13) + "..."
                : searchTerm}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onSearchChange("")}
              />
            </div>
          )}

          {showPurchased && (
            <div className="badge badge-sm badge-success gap-1 py-3">
              <CheckSquare className="h-3 w-3" />
              Purchased Items
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onShowPurchasedChange(false)}
              />
            </div>
          )}

          {(sortBy !== "date" || sortDirection !== "desc") && (
            <div className="badge badge-sm badge-warning gap-1 py-3">
              {sortDirection === "asc" ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              Sort: {currentSortOption}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  onSortChange("date");
                  onSortDirectionChange("desc");
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
