"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Tag,
  X,
  CheckSquare,
  Filter,
  SlidersHorizontal,
  Calendar,
  CircleDollarSign,
  ShoppingBag
} from "lucide-react";

interface ModernFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  showPurchased: boolean;
  onShowPurchasedChange: (value: boolean) => void;
  categories: string[];
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (value: "asc" | "desc") => void;
}

export default function ModernFilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showPurchased,
  onShowPurchasedChange,
  categories,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange
}: ModernFilterBarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  // Track screen size for responsive design
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const hasActiveFilters =
    selectedCategory !== "all" || showPurchased || searchTerm.trim().length > 0;

  const clearFilters = () => {
    onCategoryChange("all");
    onSearchChange("");
    onShowPurchasedChange(false);
  };

  const sortOptions = [
    { value: "date", label: "Date Added", icon: <Calendar className="h-4 w-4" /> },
    { value: "name", label: "Name", icon: <Tag className="h-4 w-4" /> },
    { value: "category", label: "Category", icon: <Tag className="h-4 w-4" /> },
    { value: "cost", label: "Cost", icon: <CircleDollarSign className="h-4 w-4" /> },
    { value: "quantity", label: "Quantity", icon: <ShoppingBag className="h-4 w-4" /> },
    { value: "urgency", label: "Urgency", icon: <Filter className="h-4 w-4" /> }
  ];

  return (
    <div className="w-full">
      {/* Main Filter Bar */}
      <div className="bg-base-100 rounded-lg shadow-sm p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="join w-full md:w-auto md:flex-1">
            <div className="join-item bg-base-200 flex items-center justify-center px-3 border border-base-300 border-r-0">
              <Search className="h-4 w-4 text-base-content/60" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="join-item input input-bordered flex-grow focus:outline-primary"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="join-item btn btn-ghost border border-base-300 border-l-0"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Quick Select - Desktop */}
          <div className={`hidden ${isSmallScreen ? 'md:flex' : 'md:flex'} gap-2 overflow-x-auto`}>
            <span
              className={`badge ${
                selectedCategory === "all" ? "badge-primary" : "badge-outline"
              } cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => onCategoryChange("all")}
            >
              All
            </span>
            {categories.slice(0, 4).map((category) => (
              <span
                key={category}
                className={`badge ${
                  selectedCategory === category
                    ? "badge-primary"
                    : "badge-outline"
                } cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </span>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden md:inline">Sort by</span>
              <span className="md:hidden">Sort</span>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              {sortOptions.map((option) => (
                <li key={option.value}>
                  <button
                    className={sortBy === option.value ? "active" : ""}
                    onClick={() => onSortByChange(option.value)}
                  >
                    {option.icon}
                    {option.label}
                    {sortBy === option.value && (
                      <span className="ml-auto">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {sortBy && (
                <li className="menu-title pt-2">
                  <button
                    onClick={() => onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")}
                    className="btn btn-sm btn-ghost w-full justify-between"
                  >
                    <span>Direction</span>
                    <span>{sortDirection === "asc" ? "Ascending ↑" : "Descending ↓"}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Show Purchased Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPurchased}
              onChange={() => onShowPurchasedChange(!showPurchased)}
              className="toggle toggle-primary toggle-sm"
              id="show-purchased"
            />
            <label htmlFor="show-purchased" className="cursor-pointer text-sm">
              Show purchased
            </label>
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`btn btn-sm ${hasActiveFilters ? "btn-primary" : "btn-outline"} gap-2`}
            aria-expanded={isFiltersOpen}
            aria-controls="filter-panel"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden md:inline">Filters</span>
            {hasActiveFilters && (
              <div className="badge badge-sm badge-accent">{selectedCategory !== "all" ? "1" : ""}</div>
            )}
          </button>
        </div>

        {/* Expanded Filter Panel */}
        {isFiltersOpen && (
          <div id="filter-panel" className="mt-4 p-3 border border-base-300 rounded-lg bg-base-200/50 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Selector */}
              <div className="w-full">
                <label className="label">
                  <span className="label-text flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Category
                  </span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show Purchased Checkbox - Desktop */}
              <div className={`w-full ${isSmallScreen ? 'hidden' : 'hidden md:block'}`}>
                <label className="label">
                  <span className="label-text flex items-center gap-1">
                    <CheckSquare className="h-4 w-4" />
                    Status
                  </span>
                </label>
                <div className="flex items-center gap-2 h-12 px-4 border border-base-300 rounded-lg bg-base-100">
                  <input
                    type="checkbox"
                    checked={showPurchased}
                    onChange={() => onShowPurchasedChange(!showPurchased)}
                    className="checkbox checkbox-primary checkbox-sm"
                    id="show-purchased-desktop"
                  />
                  <label htmlFor="show-purchased-desktop" className="cursor-pointer">
                    Show purchased items
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="w-full flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn btn-outline btn-sm w-full gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
