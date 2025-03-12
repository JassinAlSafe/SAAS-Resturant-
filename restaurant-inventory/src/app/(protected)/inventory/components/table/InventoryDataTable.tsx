"use client";

import React, { useState, useEffect } from "react";
import { InventoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TableHeader } from "./TableHeader";
import { TableItem } from "./TableItem";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface InventoryDataTableProps {
  items: InventoryItem[];
  compactMode: boolean;
  selectedItems: string[];
  expandedItems: Record<string, boolean>;
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
  toggleItemSelection: (itemId: string) => void;
  toggleAllItems: () => void;
  toggleExpanded: (itemId: string) => void;
  formatCurrency: (value: number) => string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  handleSort?: (field: string) => void;
}

export function InventoryDataTable({
  items,
  compactMode,
  selectedItems,
  expandedItems,
  onEditClick,
  onDeleteClick,
  onUpdateQuantity,
  toggleItemSelection,
  toggleAllItems,
  toggleExpanded,
  formatCurrency,
  sortField = "name",
  sortDirection = "asc",
  handleSort = () => {},
}: InventoryDataTableProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, sortField, sortDirection]);

  // Calculate pagination values
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, items.length);
  const currentItems = items.slice(startIndex, endIndex);

  // Page navigation functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToLastPage = () => goToPage(totalPages);

  return (
    <div className="flex flex-col h-full">
      {/* Table Container */}
      <div
        className={cn(
          "rounded-lg border-t border-b border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200 flex-1",
          compactMode ? "bg-slate-50/50" : "bg-white dark:bg-slate-950"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Table Header */}
            <thead>
              <tr
                className={cn(
                  "border-b",
                  compactMode
                    ? "bg-slate-100/80"
                    : "bg-slate-50/80 dark:bg-slate-900/30"
                )}
              >
                <th className="w-[40px] px-4 py-4 text-left">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={
                        selectedItems.length === items.length &&
                        items.length > 0
                      }
                      onChange={toggleAllItems}
                    />
                  </div>
                </th>
                {!compactMode && (
                  <th className="w-[60px] px-4 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    #
                  </th>
                )}
                {!compactMode && (
                  <th className="w-[120px] px-4 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    SKU
                  </th>
                )}
                <th className="px-4 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
                  <TableHeader
                    label="Item"
                    field="name"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
                  <TableHeader
                    label="Category"
                    field="category"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </th>
                <th className="px-4 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer whitespace-nowrap">
                  <TableHeader
                    label="Price"
                    field="cost_per_unit"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </th>
                <th className="px-4 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
                  <TableHeader
                    label="Stock"
                    field="quantity"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </th>
                <th className="w-[100px] px-4 py-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-[100px] px-4 py-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody
              className={cn(
                "divide-y",
                compactMode
                  ? "divide-slate-100"
                  : "divide-slate-200 dark:divide-slate-800"
              )}
            >
              {currentItems.map((item, index) => (
                <TableItem
                  key={item.id}
                  item={item}
                  index={startIndex + index + 1}
                  isExpanded={expandedItems[item.id] || false}
                  isSelected={selectedItems.includes(item.id)}
                  compactMode={compactMode}
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                  onUpdateQuantity={onUpdateQuantity}
                  toggleItemSelection={toggleItemSelection}
                  toggleExpanded={toggleExpanded}
                  formatCurrency={formatCurrency}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 py-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex-1">
            Showing {startIndex + 1} to {endIndex} of {items.length} items
            {selectedItems.length > 0 && ` (${selectedItems.length} selected)`}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-slate-500 border-slate-200"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-slate-500 border-slate-200"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-slate-500 border-slate-200"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-slate-500 border-slate-200"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>

              <select
                className="ml-2 h-8 rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 px-2 text-xs text-slate-700 dark:text-slate-300"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
