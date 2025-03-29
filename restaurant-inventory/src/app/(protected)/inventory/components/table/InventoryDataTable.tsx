"use client";

import React, { useState, useMemo } from "react";
import { InventoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, Trash } from "lucide-react";
import { ProxyImage } from "@/components/ui/proxy-image";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface InventoryDataTableProps {
  items: InventoryItem[];
  selectedItems: string[];
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  toggleItemSelection: (itemId: string) => void;
  toggleAllItems: () => void;
  formatCurrency: (value: number) => string;
  isMobile?: boolean;
  renderSortIndicator?: (column: string) => React.ReactNode;
  handleHeaderClick?: (column: string) => void;
}

// Extended InventoryItem type to include possible image_url
interface ExtendedInventoryItem extends InventoryItem {
  image_url?: string;
}

export function InventoryDataTable({
  items,
  selectedItems,
  onEditClick,
  onDeleteClick,
  onUpdateQuantity,
  toggleItemSelection,
  toggleAllItems,
  formatCurrency,
  isMobile,
  renderSortIndicator,
  handleHeaderClick,
}: InventoryDataTableProps) {
  // Category filter state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Remove selectedIds state and use selectedItems from props instead
  const selectedIdsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    selectedItems.forEach((id) => (map[id] = true));
    return map;
  }, [selectedItems]);

  // Format product ID to be more user-friendly
  const formatProductId = (id: string) => {
    return `${id.substring(0, 4)}-${id.substring(4, 8)}`;
  };

  // Filter items by category if needed
  const filteredItems = activeCategory
    ? items.filter((item) => item.category === activeCategory)
    : items;

  // Extract unique categories for quick filters
  const categories = [...new Set(items.map((item) => item.category))].sort();

  // Handle selection change
  const handleSelectionChange = (itemId: string) => {
    toggleItemSelection(itemId);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Category Filter Buttons */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 mr-2 flex items-center">
            Filter by:
          </span>
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
            className="text-xs"
          >
            All Categories
            <Badge className="ml-2 bg-white text-gray-800" variant="outline">
              {items.length}
            </Badge>
          </Button>
          {categories.map((category) => {
            const categoryCount = items.filter(
              (item) => item.category === category
            ).length;

            return (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="text-xs"
              >
                {category}
                <Badge
                  className="ml-2 bg-white text-gray-800"
                  variant="outline"
                >
                  {categoryCount}
                </Badge>
              </Button>
            );
          })}
        </div>
      )}

      {/* Traditional Table Approach */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Info Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Showing {filteredItems.length} unique products
            {filteredItems.length < items.length && (
              <> (from {items.length} total entries)</>
            )}
            . Similar items have been grouped together.
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 text-gray-600">
                <TableHead className="w-12 p-3">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={toggleAllItems}
                      checked={
                        filteredItems.length > 0 &&
                        filteredItems.every((item) => selectedIdsMap[item.id])
                      }
                      aria-label="Select all items"
                    />
                  </div>
                </TableHead>
                <TableHead className="p-3 text-left text-xs font-medium uppercase tracking-wider">
                  ID
                </TableHead>
                <TableHead
                  className="p-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleHeaderClick?.("name")}
                >
                  <div className="flex items-center">
                    Name
                    {renderSortIndicator?.("name")}
                  </div>
                </TableHead>
                <TableHead
                  className="p-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleHeaderClick?.("category")}
                >
                  <div className="flex items-center">
                    Category
                    {renderSortIndicator?.("category")}
                  </div>
                </TableHead>
                <TableHead
                  className="p-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleHeaderClick?.("quantity")}
                >
                  <div className="flex items-center">
                    Quantity
                    {renderSortIndicator?.("quantity")}
                  </div>
                </TableHead>
                <TableHead className="p-3 text-left text-xs font-medium uppercase tracking-wider">
                  Unit Type
                </TableHead>
                <TableHead
                  className="p-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleHeaderClick?.("cost")}
                >
                  <div className="flex items-center justify-end">
                    Cost
                    {renderSortIndicator?.("cost")}
                  </div>
                </TableHead>
                <TableHead
                  className="p-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleHeaderClick?.("value")}
                >
                  <div className="flex items-center justify-end">
                    Total Value
                    {renderSortIndicator?.("value")}
                  </div>
                </TableHead>
                <TableHead className="p-3 text-right text-xs font-medium uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                      <p className="text-gray-500">No inventory items found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const extendedItem = item as ExtendedInventoryItem;
                  const totalValue = item.quantity * (item.cost_per_unit || 0);
                  const isLowStock = item.quantity <= (item.reorder_level || 0);

                  return (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "group border-b border-gray-200 hover:bg-gray-50/80",
                        (item.cost_per_unit || 0) === 0 && "bg-gray-50/70",
                        item.quantity < 0 && "bg-red-50/50",
                        isLowStock && "bg-amber-50/50"
                      )}
                    >
                      <TableCell className="p-3">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={!!selectedIdsMap[item.id]}
                            onChange={() => handleSelectionChange(item.id)}
                            aria-label={`Select ${item.name}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        <Tooltip content={`Product ID: ${item.id}`}>
                          <span className="text-xs font-mono text-gray-500">
                            {formatProductId(item.id)}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden relative">
                            {extendedItem.image_url ? (
                              <div className="w-full h-full">
                                <ProxyImage
                                  src={extendedItem.image_url}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        <span className="text-gray-600">{item.category}</span>
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <div className="hidden group-hover:flex items-center space-x-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateQuantity(
                                  item.id,
                                  Math.max(0, item.quantity - 1)
                                );
                              }}
                            >
                              <span className="sr-only">Decrease</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3"
                              >
                                <path d="M5 12h14" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateQuantity(item.id, item.quantity + 1);
                              }}
                            >
                              <span className="sr-only">Increase</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3"
                              >
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600"
                        >
                          {item.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 text-right">
                        <span className="font-medium">
                          {(item.cost_per_unit || 0) === 0
                            ? "—"
                            : formatCurrency(item.cost_per_unit || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 text-right">
                        <span
                          className={cn(
                            "font-medium",
                            totalValue === 0 && "text-gray-400",
                            totalValue < 0 && "text-red-600",
                            totalValue > 1000 && "text-green-600"
                          )}
                        >
                          {totalValue === 0 ? "—" : formatCurrency(totalValue)}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center justify-center gap-1 text-gray-600 hover:text-gray-900"
                            onClick={() => onEditClick(item)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center justify-center gap-1 text-red-600 hover:text-red-800"
                            onClick={() => onDeleteClick(item)}
                          >
                            <Trash className="h-4 w-4" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
