"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Package,
  PlusCircle,
  MinusCircle,
  Info,
  Pencil,
  Trash,
  Plus,
  Minus,
} from "lucide-react";
import { InventoryItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency-context";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { CustomToggle } from "@/components/ui/custom-toggle";

interface InventoryTableProps {
  items: InventoryItem[];
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
  isCompactView?: boolean;
  onCategoryClick?: (category: string) => void;
}

export default function InventoryTable({
  items,
  onEditClick,
  onDeleteClick,
  onUpdateQuantity,
  isCompactView = false,
  onCategoryClick,
}: InventoryTableProps) {
  const { formatCurrency } = useCurrency();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isBulkActionsVisible, setIsBulkActionsVisible] = useState(false);
  const [bulkQuantityChange, setBulkQuantityChange] = useState(1);

  useEffect(() => {
    // Reset selected items when items change
    setSelectedItems(new Set());
    updateBulkActionsVisibility(new Set());
  }, [items]);

  const updateBulkActionsVisibility = (selectedSet: Set<string>) => {
    setIsBulkActionsVisible(selectedSet.size > 0);
  };

  const handleSelectItem = (itemId: string, isSelected: boolean) => {
    const newSelectedItems = new Set(selectedItems);

    if (isSelected) {
      newSelectedItems.add(itemId);
    } else {
      newSelectedItems.delete(itemId);
    }

    setSelectedItems(newSelectedItems);
    updateBulkActionsVisibility(newSelectedItems);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allIds = new Set(items.map((item) => item.id));
      setSelectedItems(allIds);
      updateBulkActionsVisibility(allIds);
    } else {
      setSelectedItems(new Set());
      updateBulkActionsVisibility(new Set());
    }
  };

  const handleBulkDelete = () => {
    // Confirm before proceeding
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.size} items?`
      )
    ) {
      // Execute delete for each selected item
      selectedItems.forEach((itemId) => {
        const item = items.find((i) => i.id === itemId);
        if (item) {
          onDeleteClick(item);
        }
      });

      // Reset selection
      setSelectedItems(new Set());
      updateBulkActionsVisibility(new Set());
    }
  };

  const handleBulkUpdateQuantity = (increase: boolean) => {
    if (bulkQuantityChange <= 0) return;

    selectedItems.forEach((itemId) => {
      const item = items.find((i) => i.id === itemId);
      if (item && onUpdateQuantity) {
        const delta = increase ? bulkQuantityChange : -bulkQuantityChange;
        const newQuantity = Math.max(0, item.quantity + delta);
        onUpdateQuantity(itemId, newQuantity);
      }
    });
  };

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
      bag: "bags",
      container: "containers",
      pack: "packs",
      package: "packages",
      jar: "jars",
      carton: "cartons",
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

  // Check if item is approaching reorder level (warning level)
  const isApproachingReorderLevel = (item: InventoryItem): boolean => {
    const reorderLevel = getReorderLevel(item);
    // Warning level is 30% above reorder level
    const warningThreshold = reorderLevel * 1.3;
    return item.quantity > reorderLevel && item.quantity <= warningThreshold;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground stroke-[1.25px]" />
        <h3 className="mt-4 text-lg font-medium">No items found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No inventory items match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Panel */}
      {isBulkActionsVisible && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-border/40 shadow-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary font-medium px-3 py-1.5"
              >
                {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}{" "}
                selected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(false)}
                className="text-sm"
              >
                Clear selection
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center rounded-md border shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 h-8"
                    onClick={() =>
                      setBulkQuantityChange(Math.max(1, bulkQuantityChange - 1))
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <input
                    type="number"
                    value={bulkQuantityChange}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val > 0) setBulkQuantityChange(val);
                    }}
                    className="w-14 text-center h-8 border-x focus:outline-none focus:ring-1 focus:ring-ring"
                    min="1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 h-8"
                    onClick={() =>
                      setBulkQuantityChange(bulkQuantityChange + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkUpdateQuantity(true)}
                className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Add to stock
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkUpdateQuantity(false)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
              >
                <MinusCircle className="h-4 w-4 mr-1.5" />
                Remove from stock
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBulkDelete}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              >
                <Trash className="h-4 w-4 mr-1.5" />
                Delete selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="w-[50px]">
                <CustomCheckbox
                  checked={
                    items.length > 0 && selectedItems.size === items.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all items"
                />
              </TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Quantity</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">
                Reorder Level
              </TableHead>
              <TableHead className="font-semibold hidden md:table-cell text-right">
                Unit Cost
              </TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const lowStock = isLowStock(item);
              const outOfStock = isOutOfStock(item);
              const approachingReorder = isApproachingReorderLevel(item);
              const reorderLevel = getReorderLevel(item);

              return (
                <TableRow
                  key={item.id}
                  className={`
                    ${isCompactView ? "h-12" : "h-16"}
                    ${
                      outOfStock
                        ? "bg-red-50/50 dark:bg-red-950/10"
                        : lowStock
                        ? "bg-yellow-50/50 dark:bg-yellow-950/10"
                        : approachingReorder
                        ? "bg-orange-50/50 dark:bg-orange-950/10"
                        : ""
                    }
                    hover:bg-muted/50 transition-colors
                  `}
                >
                  <TableCell className="w-[50px]">
                    <CustomCheckbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={(checked) =>
                        handleSelectItem(item.id, checked === true)
                      }
                      aria-label={`Select ${item.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(lowStock || outOfStock || approachingReorder) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle
                                className={`
                                  ${
                                    outOfStock
                                      ? "text-red-500"
                                      : lowStock
                                      ? "text-yellow-500"
                                      : "text-orange-400"
                                  }
                                  h-4 w-4
                                `}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              {outOfStock
                                ? "Out of stock"
                                : lowStock
                                ? "Low stock"
                                : "Approaching reorder level"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => onCategoryClick?.(item.category)}
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {onUpdateQuantity ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => handleQuickUpdate(item, false)}
                          disabled={item.quantity <= 0}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value);
                            if (!isNaN(newQty) && newQty >= 0) {
                              onUpdateQuantity(item.id, newQty);
                            }
                          }}
                          className="w-16 h-8 rounded-md border text-center"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => handleQuickUpdate(item, true)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span>{formatUnit(item.quantity, item.unit)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        outOfStock
                          ? "destructive"
                          : lowStock
                          ? "warning"
                          : approachingReorder
                          ? "outline"
                          : "secondary"
                      }
                      className={`
                        ${
                          outOfStock
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : lowStock
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : approachingReorder
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }
                      `}
                    >
                      {outOfStock
                        ? "Out of stock"
                        : lowStock
                        ? "Low stock"
                        : approachingReorder
                        ? "Reorder soon"
                        : "In stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span>
                        {reorderLevel} {item.unit}
                      </span>
                      {(lowStock || outOfStock) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Current stock is{" "}
                              {outOfStock
                                ? "depleted"
                                : `below reorder level of ${reorderLevel} ${item.unit}`}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    {formatCurrency(item.cost_per_unit)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => onEditClick(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit item</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onDeleteClick(item)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete item</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
