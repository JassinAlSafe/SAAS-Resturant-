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
          "rounded-lg border-t border-b border-base-300 overflow-hidden transition-all duration-200 flex-1",
          compactMode ? "bg-base-200/50" : "bg-base-100"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Table Header */}
            <thead>
              <tr
                className={cn(
                  "border-b border-base-300",
                  compactMode
                    ? "bg-base-200/80"
                    : "bg-base-100"
                )}
              >
                <th className="w-[40px] px-4 py-4 text-left">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={
                        selectedItems.length === items.length &&
                        items.length > 0
                      }
                      onChange={toggleAllItems}
                    />
                  </div>
                </th>
                {!compactMode && (
                  <th className="w-[60px] px-4 py-4 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider">
                    #
                  </th>
                )}
                {!compactMode && (
                  <th className="w-[120px] px-4 py-4 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider whitespace-nowrap">
                    SKU
                  </th>
                )}
                <th className="px-4 py-4 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider cursor-pointer">
                  <TableHeader
                    label="Item"
                    field="name"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-base-content/60 uppercase tracking-wider cursor-pointer">
                  <TableHeader
                    label="Category"
                    field="category"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </th>
                <th className="px-4 py-4 text-right text-xs font-medium text-base-content/60 uppercase tracking-wider cursor-pointer whitespace-nowrap">
                  <TableHeader
                    label="Price"
                    field="cost_per_unit"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </th>
                <th className="px-4 py-4 text-right text-xs font-medium text-base-content/60 uppercase tracking-wider cursor-pointer">
                  <TableHeader
                    label="Stock"
                    field="quantity"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </th>
                <th className="w-[100px] px-4 py-4 text-center text-xs font-medium text-base-content/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-[100px] px-4 py-4 text-center text-xs font-medium text-base-content/60 uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody
              className={cn(
                "divide-y",
                compactMode
                  ? "divide-base-200"
                  : "divide-base-300"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 py-3 text-sm text-base-content/60">
          <div className="flex-1">
            Showing {startIndex + 1} to {endIndex} of {items.length} items
            {selectedItems.length > 0 && ` (${selectedItems.length} selected)`}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 flex items-center justify-center"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center">
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 flex items-center justify-center"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-sm">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="select select-bordered select-sm h-8 min-h-8 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
