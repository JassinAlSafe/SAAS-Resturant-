"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiX,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiPlus,
  FiSliders,
  FiTag,
} from "react-icons/fi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  sortField?: string;
  setSortField?: (field: string) => void;
  sortDirection?: "asc" | "desc";
  setSortDirection?: (direction: "asc" | "desc") => void;
  showLowStock?: boolean;
  onLowStockChange?: (value: boolean) => void;
  lowStockCount?: number;
  outOfStockCount?: number;
  viewMode?: "table" | "cards";
  onViewModeChange?: (mode: "table" | "cards") => void;
  onAddClick?: () => void;
}

export default function InventoryFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortField = "name",
  setSortField = () => {},
  sortDirection = "asc",
  setSortDirection = () => {},
  showLowStock = false,
  onLowStockChange = () => {},
  lowStockCount = 0,
  outOfStockCount = 0,
  viewMode = "table",
  onViewModeChange = () => {},
  onAddClick = () => {},
}: InventoryFiltersProps) {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onLowStockChange(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm !== "" || selectedCategory !== "all" || showLowStock;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Header */}
        <h1 className="text-2xl font-bold tracking-tight mb-2 md:mb-0 text-gray-800">
          Inventory
        </h1>

        {/* Main Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative w-full md:w-[180px]">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 h-4 w-4" />
                    <Select
                      value={selectedCategory}
                      onValueChange={onCategoryChange}
                    >
                      <SelectTrigger className="bg-white pl-9 h-10 border-gray-300 hover:border-orange-300 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg w-full">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-md rounded-lg">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white border border-gray-200 shadow-md text-gray-800">
                  <p>Filter by category</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Search */}
            <div className="relative grow w-full md:w-[220px]">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 h-4 w-4" />
              <Input
                placeholder="Quick Search"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-white w-full h-10 border-gray-300 hover:border-orange-300 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg"
              />
              <AnimatePresence>
                {searchTerm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-orange-600 icon-button"
                      onClick={() => onSearchChange("")}
                    >
                      <FiX className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Add Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white h-10 min-w-[40px] rounded-lg shadow-sm hover:shadow transition-all duration-200"
                    onClick={onAddClick}
                  >
                    <FiPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add product</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white border border-gray-200 shadow-md text-gray-800">
                  <p>Add new inventory item</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      className={`h-10 w-10 rounded-none transition-colors duration-200 ${
                        viewMode === "table"
                          ? "bg-orange-600 text-white"
                          : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                      onClick={() => onViewModeChange("table")}
                    >
                      <FiList className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white border border-gray-200 shadow-md text-gray-800">
                    <p>Table view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "cards" ? "default" : "ghost"}
                      size="sm"
                      className={`h-10 w-10 rounded-none transition-colors duration-200 ${
                        viewMode === "cards"
                          ? "bg-orange-600 text-white"
                          : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                      onClick={() => onViewModeChange("cards")}
                    >
                      <FiGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white border border-gray-200 shadow-md text-gray-800">
                    <p>Card view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Advanced Filters */}
            <Popover
              open={isAdvancedFiltersOpen}
              onOpenChange={setIsAdvancedFiltersOpen}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "gap-1 bg-white h-10 border-gray-300 hover:border-orange-300 rounded-lg transition-colors duration-200",
                          hasActiveFilters && "border-orange-300 text-orange-600 bg-orange-50/50"
                        )}
                      >
                        <FiSliders className="h-4 w-4" />
                        <span className="hidden sm:inline">Filters</span>
                        {hasActiveFilters && (
                          <Badge
                            variant="secondary"
                            className="ml-1 h-5 px-1.5 rounded-full bg-orange-100 text-orange-700"
                          >
                            {(searchTerm ? 1 : 0) +
                              (selectedCategory !== "all" ? 1 : 0) +
                              (showLowStock ? 1 : 0)}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white border border-gray-200 shadow-md text-gray-800">
                    <p>Advanced filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Advanced Filters Popover Content */}
              <PopoverContent className="w-[280px] p-4 shadow-lg border border-gray-200 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Advanced Filters
                    </h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={clearFilters}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Low Stock Toggle */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="show-low-stock"
                        className="text-sm cursor-pointer text-gray-700"
                      >
                        Show low stock only
                      </Label>
                      <Switch
                        id="show-low-stock"
                        checked={showLowStock}
                        onCheckedChange={onLowStockChange}
                        className="data-[state=checked]:bg-orange-600"
                      />
                    </div>

                    {/* Stock Alerts */}
                    {(lowStockCount > 0 || outOfStockCount > 0) && (
                      <div className="text-xs text-gray-600 pt-1 space-y-1.5">
                        {lowStockCount > 0 && (
                          <div className="flex items-center gap-1.5 mb-1 bg-amber-50 text-amber-700 p-2 rounded border border-amber-100">
                            <FiAlertTriangle className="h-3 w-3 text-amber-500" />
                            <span>{lowStockCount} items low on stock</span>
                          </div>
                        )}
                        {outOfStockCount > 0 && (
                          <div className="flex items-center gap-1.5 bg-red-50 text-red-700 p-2 rounded border border-red-100">
                            <FiAlertTriangle className="h-3 w-3 text-red-500" />
                            <span>{outOfStockCount} items out of stock</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900">
                      Sort by
                    </Label>
                    <div className="grid grid-cols-1 gap-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                      {[
                        { label: "Name", field: "name" },
                        { label: "Category", field: "category" },
                        { label: "Quantity", field: "quantity" },
                        { label: "Price", field: "cost_per_unit" },
                      ].map((option) => (
                        <Button
                          key={option.field}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "justify-between h-9 px-3 rounded-none",
                            sortField === option.field
                              ? "bg-orange-50 text-orange-700 font-medium"
                              : "bg-transparent hover:bg-gray-100 text-gray-700"
                          )}
                          onClick={() => handleSortChange(option.field)}
                        >
                          <span>{option.label}</span>
                          {sortField === option.field && (
                            <span>
                              {sortDirection === "asc" ? (
                                <FiChevronUp className="h-4 w-4 text-orange-600" />
                              ) : (
                                <FiChevronDown className="h-4 w-4 text-orange-600" />
                              )}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-3 border-t border-gray-200"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Active filters:</span>

              {selectedCategory !== "all" && (
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1 pl-2 h-6"
                >
                  <span>Category: {selectedCategory}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCategoryChange("all")}
                    className="h-4 w-4 p-0 ml-1 text-orange-500 hover:text-orange-700 hover:bg-transparent rounded-full"
                  >
                    <FiX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {searchTerm && (
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1 pl-2 h-6"
                >
                  <span>Search: {searchTerm}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSearchChange("")}
                    className="h-4 w-4 p-0 ml-1 text-orange-500 hover:text-orange-700 hover:bg-transparent rounded-full"
                  >
                    <FiX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {showLowStock && (
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1 pl-2 h-6"
                >
                  <span>Low stock only</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLowStockChange(false)}
                    className="h-4 w-4 p-0 ml-1 text-orange-500 hover:text-orange-700 hover:bg-transparent rounded-full"
                  >
                    <FiX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-6 px-2 ml-auto flex items-center gap-1"
              >
                <FiRefreshCw className="h-3 w-3" />
                Reset all
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
