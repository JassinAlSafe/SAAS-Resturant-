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
import { Package } from "lucide-react";

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
          "rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 flex-1 shadow-sm",
          compactMode ? "bg-gray-50" : "bg-white"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Table Header */}
            <thead>
              <tr
                className={cn(
                  "border-b border-gray-200",
                  compactMode
                    ? "bg-gray-50"
                    : "bg-white"
                )}
              >
                <th className="w-[40px] px-4 py-3 text-left">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={
                        selectedItems.length === items.length &&
                        items.length > 0
                      }
                      onChange={toggleAllItems}
                    />
                  </div>
                </th>
                <TableHeader
                  label="Name"
                  field="name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                />
                <TableHeader
                  label="Category"
                  field="category"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                />
                <TableHeader
                  label="Quantity"
                  field="quantity"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                />
                <TableHeader
                  label="Unit"
                  field="unit"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                />
                <TableHeader
                  label="Cost"
                  field="cost_per_unit"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                />
                <TableHeader
                  label="Total Value"
                  field="total_value"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                />
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <TableItem
                  key={item.id}
                  item={item}
                  isSelected={selectedItems.includes(item.id)}
                  isExpanded={!!expandedItems[item.id]}
                  onToggleSelect={() => toggleItemSelection(item.id)}
                  onToggleExpand={() => toggleExpanded(item.id)}
                  onEditClick={() => onEditClick(item)}
                  onDeleteClick={() => onDeleteClick(item)}
                  onUpdateQuantity={onUpdateQuantity}
                  formatCurrency={formatCurrency}
                  compactMode={compactMode}
                />
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500 bg-white"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">No inventory items found</p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your filters or add new items
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {items.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-xs text-gray-500">
            Showing {startIndex + 1} to {endIndex} of {items.length} items
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-gray-200 text-gray-500"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-gray-200 text-gray-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="px-2 text-sm text-gray-600 font-medium">
              {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-gray-200 text-gray-500"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-gray-200 text-gray-500"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
