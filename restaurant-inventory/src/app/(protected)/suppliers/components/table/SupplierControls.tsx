"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Filter,
  ChevronDown,
  Download,
  Upload,
  Printer,
  Search,
  Mail,
  X,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SupplierCategory } from "@/lib/types";
import { motion } from "framer-motion";

interface SupplierControlsProps {
  selectedSuppliers: Set<string>;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onCategoryFilterChange?: (category: SupplierCategory | null) => void;
  clearSelection: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onPrint?: () => void;
  onEmailSelected?: () => void;
  isLoading?: boolean;
}

export function SupplierControls({
  selectedSuppliers,
  onSearchChange,
  searchQuery,
  onCategoryFilterChange,
  clearSelection,
  onExport,
  onImport,
  onPrint,
  onEmailSelected,
  isLoading = false,
}: SupplierControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
      <div className="flex items-center flex-1 gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search suppliers"
          />
          {searchQuery && (
            <button
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
              <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onCategoryFilterChange?.(null)}
              className="cursor-pointer"
            >
              All Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.values(SupplierCategory).map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => onCategoryFilterChange?.(category)}
                className="cursor-pointer"
              >
                {category.replace("_", " ")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3">
        {/* Show selected items actions */}
        {selectedSuppliers.size > 0 ? (
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            role="region"
            aria-live="polite"
          >
            <span className="text-sm text-slate-500">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {selectedSuppliers.size}
              </span>{" "}
              supplier{selectedSuppliers.size > 1 ? "s" : ""} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={clearSelection}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={onEmailSelected}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-1.5" />
              )}
              Email
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-9"
              onClick={onPrint}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Printer className="h-4 w-4 mr-1.5" />
              )}
              Print
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={onExport}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={onImport}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1.5" />
              )}
              Import
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
