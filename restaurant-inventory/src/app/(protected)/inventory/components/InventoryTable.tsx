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
  Trash2,
  Plus,
  Minus,
  Trash,
  AlertCircle,
  Check,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

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
    <div className="rounded-md border">
      <Card>
        {/* Bulk Actions Toolbar - Only visible when items are selected */}
        {isBulkActionsVisible && (
          <div className="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-medium px-3 py-1.5 rounded-full shadow-sm"
              >
                {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}{" "}
                selected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="shadow-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                onClick={() => handleSelectAll(false)}
              >
                Clear selection
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity adjustment:
                </span>
                <div className="flex items-center border rounded-md overflow-hidden shadow-sm border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() =>
                      setBulkQuantityChange(Math.max(1, bulkQuantityChange - 1))
                    }
                  >
                    <Minus className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                  </Button>
                  <input
                    type="number"
                    value={bulkQuantityChange}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        setBulkQuantityChange(val);
                      }
                    }}
                    className="w-14 text-center border-x h-8 dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                    min="1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() =>
                      setBulkQuantityChange(bulkQuantityChange + 1)
                    }
                  >
                    <Plus className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkUpdateQuantity(true)}
                  className="bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:text-green-700 shadow-sm dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30 transition-colors"
                >
                  <PlusCircle className="h-4 w-4 mr-1.5 stroke-[2px]" />
                  Add {bulkQuantityChange} to stock
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkUpdateQuantity(false)}
                  className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 shadow-sm dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <MinusCircle className="h-4 w-4 mr-1.5 stroke-[2px]" />
                  Remove {bulkQuantityChange} from stock
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 shadow-sm dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash className="h-4 w-4 mr-1.5 stroke-[2px]" />
                  Delete selected
                </Button>
              </div>
            </div>
          </div>
        )}
        <Table className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-850">
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
              <TableHead className="w-12 h-10">
                <Checkbox
                  checked={
                    items.length > 0 && selectedItems.size === items.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all items"
                  className="h-5 w-5 rounded-md"
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                Category
              </TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                Quantity
              </TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                Status
              </TableHead>
              <TableHead className="font-semibold hidden md:table-cell text-gray-700 dark:text-gray-300">
                Reorder Level
              </TableHead>
              <TableHead className="font-semibold hidden md:table-cell text-right text-gray-700 dark:text-gray-300">
                Unit Cost
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              // Calculate stock status
              const lowStock = isLowStock(item);
              const outOfStock = isOutOfStock(item);
              const approachingReorder = isApproachingReorderLevel(item);
              const reorderLevel = getReorderLevel(item);

              return (
                <TableRow
                  key={item.id}
                  className={`
                    transition-colors
                    ${isCompactView ? "h-10" : ""}
                    ${
                      outOfStock
                        ? "bg-red-50/80 dark:bg-red-950/10 border-l-4 border-l-red-500 dark:border-l-red-700"
                        : lowStock
                        ? "bg-yellow-50/80 dark:bg-yellow-950/10 border-l-4 border-l-yellow-500 dark:border-l-yellow-600"
                        : approachingReorder && !lowStock && !outOfStock
                        ? "bg-amber-50/70 dark:bg-amber-950/5 border-l-4 border-l-amber-400 dark:border-l-amber-600"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-l-transparent"
                    }
                    border-b border-gray-100 dark:border-gray-800
                  `}
                >
                  <TableCell className={`${isCompactView ? "py-2" : ""}`}>
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={(checked) =>
                        handleSelectItem(item.id, checked === true)
                      }
                      aria-label={`Select ${item.name}`}
                      className="h-5 w-5 rounded-md"
                    />
                  </TableCell>
                  <TableCell
                    className={`font-medium ${isCompactView ? "py-2" : ""}`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        {(lowStock || outOfStock || approachingReorder) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <AlertTriangle
                                    className={`
                                    ${
                                      outOfStock
                                        ? "text-red-500"
                                        : lowStock
                                        ? "text-yellow-500"
                                        : "text-amber-400"
                                    }
                                    inline mr-1 h-4 w-4 stroke-[2.5px]
                                  `}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {outOfStock
                                  ? "Out of stock!"
                                  : lowStock
                                  ? "Low stock!"
                                  : "Approaching reorder level"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <span className="truncate max-w-[180px] font-medium text-gray-800 dark:text-gray-200">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={isCompactView ? "py-2" : ""}>
                    <Badge
                      variant="outline"
                      className="font-normal px-3 py-1.5 rounded-full shadow-sm bg-white dark:bg-gray-800 border-[1.5px] border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-750"
                      onClick={() => onCategoryClick?.(item.category)}
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className={`${isCompactView ? "py-2" : ""}`}>
                    <div className="flex items-center justify-start">
                      {onUpdateQuantity ? (
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 rounded-full border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  onClick={() => handleQuickUpdate(item, false)}
                                  disabled={item.quantity <= 0}
                                >
                                  <MinusCircle className="h-4 w-4 stroke-[2px] text-gray-600 dark:text-gray-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Decrease quantity</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <div className="flex flex-col items-center min-w-[60px]">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value, 10);
                                if (!isNaN(newQty) && newQty >= 0) {
                                  onUpdateQuantity(item.id, newQty);
                                }
                              }}
                              className="w-14 text-center h-8 rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:ring-1 focus:ring-primary/50 focus:border-primary"
                              min="0"
                            />
                            <span className="text-xs text-muted-foreground mt-1">
                              {formatUnit(item.quantity, item.unit)}
                            </span>
                          </div>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 rounded-full border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  onClick={() => handleQuickUpdate(item, true)}
                                >
                                  <PlusCircle className="h-4 w-4 stroke-[2px] text-gray-600 dark:text-gray-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Increase quantity</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {item.quantity}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {formatUnit(item.quantity, item.unit)}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={isCompactView ? "py-2" : ""}>
                    <div className="flex items-center">
                      {outOfStock && (
                        <Badge
                          variant="outline"
                          className="border-[1.5px] bg-red-50 border-red-500 text-red-600 dark:bg-red-950/30 dark:border-red-400 dark:text-red-400 w-fit shadow-sm px-2.5 py-1 rounded-full font-medium"
                        >
                          <AlertCircle className="mr-1 h-3.5 w-3.5 stroke-[2.5px]" />
                          Out of stock
                        </Badge>
                      )}
                      {lowStock && !outOfStock && (
                        <Badge
                          variant="outline"
                          className="border-[1.5px] bg-yellow-50 border-yellow-500 text-yellow-600 dark:bg-yellow-950/30 dark:border-yellow-400 dark:text-yellow-400 w-fit shadow-sm px-2.5 py-1 rounded-full font-medium"
                        >
                          <AlertTriangle className="mr-1 h-3.5 w-3.5 stroke-[2.5px]" />
                          Low stock
                        </Badge>
                      )}
                      {approachingReorder && !lowStock && !outOfStock && (
                        <Badge
                          variant="outline"
                          className="border-[1.5px] bg-amber-50 border-amber-400 text-amber-500 dark:bg-amber-950/30 dark:border-amber-300 dark:text-amber-300 w-fit shadow-sm px-2.5 py-1 rounded-full font-medium"
                        >
                          <AlertCircle className="mr-1 h-3.5 w-3.5 stroke-[2.5px]" />
                          Reorder soon
                        </Badge>
                      )}
                      {!approachingReorder && !lowStock && !outOfStock && (
                        <Badge
                          variant="outline"
                          className="border-[1.5px] bg-green-50 border-green-500 text-green-600 dark:bg-green-950/30 dark:border-green-400 dark:text-green-400 w-fit shadow-sm px-2.5 py-1 rounded-full font-medium"
                        >
                          <Check className="mr-1 h-3.5 w-3.5 stroke-[2.5px]" />
                          In stock
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`hidden md:table-cell ${
                      isCompactView ? "py-2" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {reorderLevel}
                      </span>{" "}
                      <span className="text-muted-foreground ml-1">
                        {formatUnit(reorderLevel, item.unit)}
                      </span>
                      {(lowStock || outOfStock) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-2">
                                <Info className="h-4 w-4 text-muted-foreground inline" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Current stock is{" "}
                                {outOfStock
                                  ? "depleted"
                                  : `below the reorder level of ${reorderLevel} ${formatUnit(
                                      reorderLevel,
                                      item.unit
                                    )}`}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`hidden md:table-cell text-right ${
                      isCompactView ? "py-2" : ""
                    }`}
                  >
                    <div className="flex items-center justify-end">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {new Intl.NumberFormat("sv-SE", {
                          style: "currency",
                          currency: "SEK",
                          minimumFractionDigits: 2,
                        }).format(item.unitCost || 0)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-right ${isCompactView ? "py-2" : ""}`}
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditClick(item)}
                        className="h-8 w-8 border-gray-200 hover:border-primary/50 hover:bg-primary/5 dark:border-gray-700 dark:hover:border-primary/50 dark:hover:bg-primary/10 transition-colors rounded-md shadow-sm"
                      >
                        <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="sr-only">Edit {item.name}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteClick(item)}
                        className="h-8 w-8 border-gray-200 hover:border-red-200 hover:bg-red-50 dark:border-gray-700 dark:hover:border-red-900 dark:hover:bg-red-950/30 transition-colors rounded-md shadow-sm"
                      >
                        <Trash className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="sr-only">Delete {item.name}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
