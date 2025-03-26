"use client";

import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { Dispatch, SetStateAction } from "react";

interface RecipeSearchProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onFilterClick?: () => void;
  searchQuery?: string;
  onSearchChange?: Dispatch<SetStateAction<string>>;
  filterActive?: boolean;
}

export default function RecipeSearch({
  onSearch,
  onFilter,
  searchQuery = "",
  onSearchChange,
  onFilterClick,
  filterActive = false,
}: RecipeSearchProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="w-4 h-4 text-neutral-400" />
          </div>
          <input
            type="search"
            name="query"
            placeholder="Search recipes..."
            className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onFilterClick || onFilter}
          className={`px-4 py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors duration-200 ${
            filterActive
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <FiFilter className="w-4 h-4 mr-2" />
          Filter
          {filterActive && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-white text-orange-600 text-xs font-medium rounded">
              Active
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
