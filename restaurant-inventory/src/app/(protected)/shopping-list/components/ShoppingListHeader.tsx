"use client";

import { Search, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ShoppingListHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  sortBy?: string;
  onSortChange?: (value: string) => void;
}

export default function ShoppingListHeader({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy = "date",
  onSortChange = () => {},
}: ShoppingListHeaderProps) {
  // Sort options
  const sortOptions = [
    { value: "date", label: "Date Added" },
    { value: "name", label: "Name" },
    { value: "category", label: "Category" },
    { value: "cost", label: "Cost" },
    { value: "quantity", label: "Quantity" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="w-full md:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-[240px] h-10 pl-9 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FilterX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Category:</span>
          <Select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full md:w-[180px] h-10 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Sort by:</span>
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full md:w-[180px] h-10 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
