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
    <div className="mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold tracking-tight mb-2 md:mb-0">
          Inventory
        </h1>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative w-full md:w-[180px]">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Select
                      value={selectedCategory}
                      onValueChange={onCategoryChange}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-950 pl-9">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
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
                <TooltipContent side="bottom">
                  <p>Filter by category</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="relative flex-grow w-full md:w-auto">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Quick Search"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-950 w-full md:w-[220px]"
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
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => onSearchChange("")}
                    >
                      <FiX className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    className="gap-1.5 bg-primary text-primary-foreground"
                    onClick={onAddClick}
                  >
                    <FiPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add product</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Add new inventory item</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => onViewModeChange("table")}
                  >
                    <FiList className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Table view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => onViewModeChange("cards")}
                  >
                    <FiGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Card view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
                          "gap-1 bg-white dark:bg-gray-950",
                          hasActiveFilters && "border-primary/50 text-primary"
                        )}
                      >
                        <FiSliders className="h-4 w-4" />
                        <span className="hidden sm:inline">Filters</span>
                        {hasActiveFilters && (
                          <Badge
                            variant="secondary"
                            className="ml-1 h-5 px-1.5 rounded-full"
                          >
                            {(searchTerm ? 1 : 0) +
                              (selectedCategory !== "all" ? 1 : 0) +
                              (showLowStock ? 1 : 0)}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Advanced filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent className="w-[260px] p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Advanced Filters</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={clearFilters}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="show-low-stock"
                        className="text-sm cursor-pointer"
                      >
                        Show low stock only
                      </Label>
                      <Switch
                        id="show-low-stock"
                        checked={showLowStock}
                        onCheckedChange={onLowStockChange}
                      />
                    </div>

                    {(lowStockCount > 0 || outOfStockCount > 0) && (
                      <div className="text-xs text-muted-foreground pt-1 space-y-1.5">
                        {lowStockCount > 0 && (
                          <div className="flex items-center gap-1.5 mb-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-1.5 rounded">
                            <FiAlertTriangle className="h-3 w-3 text-amber-500" />
                            <span>{lowStockCount} items low on stock</span>
                          </div>
                        )}
                        {outOfStockCount > 0 && (
                          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-1.5 rounded">
                            <FiAlertTriangle className="h-3 w-3 text-red-500" />
                            <span>{outOfStockCount} items out of stock</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Sort by</Label>
                    <div className="grid grid-cols-1 gap-1">
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
                            "justify-between h-8",
                            sortField === option.field && "bg-muted font-medium"
                          )}
                          onClick={() => handleSortChange(option.field)}
                        >
                          {option.label}
                          {sortField === option.field && (
                            <span>
                              {sortDirection === "asc" ? (
                                <FiChevronUp className="h-4 w-4" />
                              ) : (
                                <FiChevronDown className="h-4 w-4" />
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

            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          onClick={clearFilters}
                        >
                          <FiRefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Reset all filters</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2 mt-2"
          >
            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="secondary"
                  className="gap-1 pl-2 pr-1 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FiSearch className="h-3 w-3 mr-1" />
                  Search: {searchTerm}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => onSearchChange("")}
                  >
                    <FiX className="h-3 w-3" />
                  </Button>
                </Badge>
              </motion.div>
            )}

            {selectedCategory !== "all" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <Badge
                  variant="secondary"
                  className="gap-1 pl-2 pr-1 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FiTag className="h-3 w-3 mr-1" />
                  Category: {selectedCategory}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => onCategoryChange("all")}
                  >
                    <FiX className="h-3 w-3" />
                  </Button>
                </Badge>
              </motion.div>
            )}

            {showLowStock && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Badge
                  variant="secondary"
                  className="gap-1 pl-2 pr-1 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FiAlertTriangle className="h-3 w-3 mr-1" />
                  Low Stock Only
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => onLowStockChange(false)}
                  >
                    <FiX className="h-3 w-3" />
                  </Button>
                </Badge>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
