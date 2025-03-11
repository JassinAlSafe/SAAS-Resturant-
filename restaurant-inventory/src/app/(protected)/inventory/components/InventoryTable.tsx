"use client";

import React from "react";
import {
  Package,
  PlusCircle,
  MinusCircle,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ChevronRight,
  LayoutList,
  LayoutGrid,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { InventoryItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency-context";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

// Extended InventoryItem type to include possible image_url
interface ExtendedInventoryItem extends InventoryItem {
  expiry_date?: string;
  image_url?: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
}

export default function InventoryTable({
  items,
  onEditClick,
  onDeleteClick,
  onUpdateQuantity,
}: InventoryTableProps) {
  const { formatCurrency } = useCurrency();
  const [compactMode, setCompactMode] = useState(false);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Helper function to pluralize units correctly
  const formatUnit = (quantity: number, unit: string): string => {
    // Don't pluralize certain units
    if (["kg", "g", "l", "ml"].includes(unit.toLowerCase())) {
      return unit;
    }

    // Pluralize common units
    const pluralRules: Record<string, string> = {
      box: "boxes",
      can: "cans",
      bottle: "bottles",
      piece: "pieces",
      unit: "units",
    };

    return quantity === 1
      ? unit
      : pluralRules[unit.toLowerCase()] || `${unit}s`;
  };

  // Quick update quantity handler
  const handleQuickUpdate = (item: InventoryItem, increment: boolean) => {
    if (!onUpdateQuantity) return;

    const delta = increment ? 1 : -1;
    const newQuantity = Math.max(0, item.quantity + delta);

    // Only update if the quantity actually changed
    if (newQuantity !== item.quantity) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  // Calculate reorder level if not provided
  const getReorderLevel = (item: InventoryItem): number => {
    return item.reorder_point || item.minimum_stock_level || 5; // Default to 5 if not specified
  };

  // Check if item is low on stock
  const isLowStock = (item: InventoryItem): boolean => {
    const reorderLevel = getReorderLevel(item);
    return item.quantity <= reorderLevel && item.quantity > 0;
  };

  // Check if item is out of stock
  const isOutOfStock = (item: InventoryItem): boolean => {
    return item.quantity === 0;
  };

  // Toggle expanded state for an item
  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Toggle all items selection
  const toggleAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  // Get stock status letter
  const getStockStatusLetter = (item: InventoryItem): string => {
    if (isOutOfStock(item)) return "C";
    if (isLowStock(item)) return "B";
    return "A";
  };

  // Get stock status color
  const getStockStatusColor = (item: InventoryItem): string => {
    if (isOutOfStock(item))
      return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30";
    if (isLowStock(item))
      return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30";
    return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30";
  };

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    const aValue = a[sortField as keyof InventoryItem];
    const bValue = b[sortField as keyof InventoryItem];

    // Handle special cases
    if (sortField === "cost_per_unit") {
      const aNum =
        typeof aValue === "number" ? aValue : parseFloat(String(aValue || 0));
      const bNum =
        typeof bValue === "number" ? bValue : parseFloat(String(bValue || 0));

      if (sortDirection === "asc") {
        return aNum > bNum ? 1 : -1;
      } else {
        return aNum < bNum ? 1 : -1;
      }
    }

    // Default string comparison
    const aStr = String(aValue || "");
    const bStr = String(bValue || "");

    if (sortDirection === "asc") {
      return aStr > bStr ? 1 : -1;
    } else {
      return aStr < bStr ? 1 : -1;
    }
  });

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-muted"
      >
        <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-6 text-xl font-medium">No items found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          No inventory items match your current filters. Try adjusting your
          search criteria or category selection.
        </p>
      </motion.div>
    );
  }

  // Render the table header with sort indicators
  const renderSortableHeader = (label: string, field: string) => {
    const isActive = sortField === field;
    return (
      <div
        className="flex items-center gap-1 cursor-pointer group"
        onClick={() => handleSort(field)}
      >
        {label}
        <span
          className={cn(
            "transition-colors",
            isActive
              ? "text-foreground"
              : "text-muted-foreground/0 group-hover:text-muted-foreground/50"
          )}
        >
          {isActive ? (
            sortDirection === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-50" />
          )}
        </span>
      </div>
    );
  };

  // Calculate stats for selected items
  const selectedItemsValue =
    selectedItems.length > 0
      ? selectedItems.reduce((sum, id) => {
          const item = items.find((i) => i.id === id);
          return sum + (item ? item.cost_per_unit * item.quantity : 0);
        }, 0)
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={compactMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompactMode(!compactMode)}
                  className="h-9 gap-1.5"
                >
                  {compactMode ? (
                    <LayoutGrid className="h-4 w-4" />
                  ) : (
                    <LayoutList className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {compactMode ? "Expanded view" : "Compact view"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  {compactMode
                    ? "Switch to expanded view"
                    : "Switch to compact view"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSortField("name");
                    setSortDirection("asc");
                  }}
                  className="h-9 gap-1.5"
                  disabled={sortField === "name" && sortDirection === "asc"}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset sort</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Reset to default sorting</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-3 bg-primary/5 px-3 py-1.5 rounded-md">
            <div>
              <span className="text-sm font-medium">
                {selectedItems.length} selected
              </span>
              {selectedItemsValue > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Value: {formatCurrency(selectedItemsValue)})
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems([])}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border overflow-hidden bg-white dark:bg-gray-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b">
              <tr>
                <th className="w-[40px] px-4 py-3 text-left">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      checked={
                        selectedItems.length === items.length &&
                        items.length > 0
                      }
                      onChange={toggleAllItems}
                    />
                  </div>
                </th>
                <th className="w-[60px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th
                  className="w-[30%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  {renderSortableHeader("Name", "name")}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("category")}
                >
                  {renderSortableHeader("Category", "category")}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("cost_per_unit")}
                >
                  {renderSortableHeader("Price", "cost_per_unit")}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("quantity")}
                >
                  {renderSortableHeader("Stock", "quantity")}
                </th>
                <th className="w-[60px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-[80px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {sortedItems.map((item, index) => {
                const isExpanded = expandedItems[item.id] || false;
                const isSelected = selectedItems.includes(item.id);
                const isHovered = hoveredRow === item.id;
                const reorderLevel = getReorderLevel(item);
                const itemIsLowStock = isLowStock(item);
                const itemIsOutOfStock = isOutOfStock(item);
                const stockStatus = getStockStatusLetter(item);
                const stockStatusColor = getStockStatusColor(item);

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={cn(
                        "transition-all duration-150",
                        isSelected && "bg-primary/5",
                        isHovered && !isSelected && "bg-muted/30",
                        !isSelected && !isHovered && "hover:bg-muted/20",
                        compactMode && "h-12"
                      )}
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td
                        className={cn(
                          "px-4 whitespace-nowrap",
                          compactMode ? "py-2" : "py-3"
                        )}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleItemSelection(item.id)}
                          />
                        </div>
                      </td>
                      <td
                        className={cn(
                          "px-4 whitespace-nowrap text-sm font-medium text-muted-foreground",
                          compactMode ? "py-2" : "py-3"
                        )}
                      >
                        {index + 1}
                      </td>
                      <td
                        className={cn(
                          "px-4 whitespace-nowrap text-xs font-mono text-muted-foreground",
                          compactMode ? "py-2" : "py-3"
                        )}
                      >
                        {item.id.substring(0, 8)}
                      </td>
                      <td
                        className={cn(
                          "px-4 whitespace-nowrap",
                          compactMode ? "py-2" : "py-3"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {!compactMode && (
                            <div className="w-10 h-10 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden relative">
                              {(item as ExtendedInventoryItem).image_url ? (
                                <Image
                                  src={
                                    (item as ExtendedInventoryItem).image_url!
                                  }
                                  alt={item.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                              )}
                            </div>
                          )}
                          <div>
                            <div className="font-medium line-clamp-1">
                              {item.name}
                            </div>
                            {!compactMode && item.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        className={cn(
                          "px-4 whitespace-nowrap",
                          compactMode ? "py-2" : "py-3"
                        )}
                      >
                        <Badge variant="outline" className="font-normal">
                          {item.category}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          "px-4 whitespace-nowrap text-right",
                          compactMode ? "py-2" : "py-3"
                        )}
                      >
                        {formatCurrency(item.cost_per_unit)}
                      </td>
                      <td
                        className={cn(
                          "px-4 whitespace-nowrap text-right",
                          compactMode ? "py-2" : "py-3"
                        )}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span
                            className={cn(
                              "font-medium",
                              itemIsOutOfStock &&
                                "text-red-600 dark:text-red-400",
                              itemIsLowStock &&
                                !itemIsOutOfStock &&
                                "text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {item.quantity}
                          </span>
                          <span className="text-muted-foreground text-sm ml-1">
                            {formatUnit(item.quantity, item.unit)}
                          </span>
                        </div>
                      </td>
                      <td
                        className={cn(
                          "px-4 whitespace-nowrap text-center",
                          compactMode ? "py-2" : "py-3"
                        )}
                      >
                        <div className="flex justify-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm",
                                    stockStatusColor
                                  )}
                                >
                                  {stockStatus}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p>
                                  {itemIsOutOfStock
                                    ? "Out of Stock"
                                    : itemIsLowStock
                                    ? `Low Stock (Reorder at ${reorderLevel})`
                                    : "In Stock"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                      <td
                        className={cn(
                          "px-4 whitespace-nowrap text-center",
                          compactMode ? "py-2" : "py-3"
                        )}
                      >
                        <div className="flex items-center justify-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => toggleExpanded(item.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p>
                                  {isExpanded
                                    ? "Collapse details"
                                    : "Expand details"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row with additional details */}
                    {isExpanded && (
                      <tr className="bg-gray-50/50 dark:bg-gray-900/20">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Product Image Section */}
                            {(item as ExtendedInventoryItem).image_url && (
                              <div className="md:col-span-3 mb-4">
                                <div className="h-48 w-full sm:w-64 mx-auto relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-800">
                                  <Image
                                    src={
                                      (item as ExtendedInventoryItem).image_url!
                                    }
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 256px"
                                    className="object-cover"
                                    priority
                                  />
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="text-sm font-medium mb-2">
                                Stock Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Reorder Level:
                                  </span>
                                  <span>
                                    {reorderLevel} {item.unit}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Total Value:
                                  </span>
                                  <span>
                                    {formatCurrency(
                                      item.cost_per_unit * item.quantity
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Status:
                                  </span>
                                  <span
                                    className={cn(
                                      itemIsOutOfStock &&
                                        "text-red-600 dark:text-red-400",
                                      itemIsLowStock &&
                                        !itemIsOutOfStock &&
                                        "text-amber-600 dark:text-amber-400",
                                      !itemIsLowStock &&
                                        !itemIsOutOfStock &&
                                        "text-green-600 dark:text-green-400"
                                    )}
                                  >
                                    {itemIsOutOfStock
                                      ? "Out of Stock"
                                      : itemIsLowStock
                                      ? "Low Stock"
                                      : "In Stock"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {item.supplier_id && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  Supplier Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Supplier ID:
                                    </span>
                                    <span>{item.supplier_id}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="text-sm font-medium mb-2">
                                Actions
                              </h4>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => onEditClick(item)}
                                >
                                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                                  onClick={() => onDeleteClick(item)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                  Delete
                                </Button>
                              </div>

                              {onUpdateQuantity && (
                                <div className="mt-3">
                                  <h4 className="text-xs font-medium mb-1.5">
                                    Update Quantity
                                  </h4>
                                  <div className="flex items-center">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 rounded-l-md rounded-r-none border-r-0"
                                      onClick={() =>
                                        handleQuickUpdate(item, false)
                                      }
                                      disabled={item.quantity <= 0}
                                    >
                                      <MinusCircle className="h-4 w-4" />
                                    </Button>
                                    <div className="h-8 px-3 flex items-center justify-center border border-input bg-background min-w-[40px]">
                                      {item.quantity}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 rounded-r-md rounded-l-none border-l-0"
                                      onClick={() =>
                                        handleQuickUpdate(item, true)
                                      }
                                    >
                                      <PlusCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
