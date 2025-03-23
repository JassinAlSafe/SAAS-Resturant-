"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSearch, FiFilter, FiArrowDown } from "react-icons/fi";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";

interface RecipeSearchProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onSort?: () => void;
  searchQuery?: string;
  onSearchChange?: Dispatch<SetStateAction<string>>;
  showArchivedRecipes?: boolean;
  onToggleArchivedRecipes?: (show: boolean) => void;
  onFilterClick?: () => void;
  sortField?: "name" | "price" | "popularity" | "category";
  sortDirection?: "asc" | "desc";
}

export default function RecipeSearch({
  onSearch,
  onFilter,
  onSort,
  searchQuery = "",
  onSearchChange,
  // These props are included for TypeScript compatibility with parent components
  // but are not currently used in this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showArchivedRecipes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggleArchivedRecipes,
  onFilterClick,
  sortField,
  sortDirection,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-6"
    >
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="w-4 h-4 text-slate-400" />
          </div>
          <Input
            type="search"
            name="query"
            placeholder="Search recipes..."
            className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button
          type="button"
          onClick={onFilterClick || onFilter}
          variant="outline"
          className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <FiFilter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button
          type="button"
          onClick={onSort}
          variant="outline"
          className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <FiArrowDown className={`w-4 h-4 mr-2 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
          Sort: {sortField ? sortField.charAt(0).toUpperCase() + sortField.slice(1) : "Name"}
        </Button>
      </form>
    </motion.div>
  );
}
