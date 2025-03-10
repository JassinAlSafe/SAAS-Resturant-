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
} from "lucide-react";
import { InventoryItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency-context";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
      <div className="flex items-center justify-end p-2 border-b bg-muted/30">
        <div className="flex items-center space-x-2">
          <Switch
            id="compact-mode"
            checked={compactMode}
            onCheckedChange={setCompactMode}
          />
          <Label htmlFor="compact-mode" className="text-sm cursor-pointer">
            Compact View
          </Label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Category</TableHead>
              <TableHead className="font-medium">Quantity</TableHead>
              <TableHead className="font-medium hidden md:table-cell">
                Reorder Level
              </TableHead>
              <TableHead className="font-medium hidden sm:table-cell">
                Cost
              </TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              // Calculate stock status
              const lowStock = isLowStock(item);
              const outOfStock = isOutOfStock(item);
              const reorderLevel = getReorderLevel(item);

              return (
                <TableRow
                  key={item.id}
                  className={`
                    ${outOfStock ? "bg-red-50 dark:bg-red-950/20" : ""}
                    ${lowStock ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}
                    hover:bg-muted/50 transition-colors
                    ${compactMode ? "h-12" : ""}
                  `}
                >
                  <TableCell
                    className={`font-medium ${compactMode ? "py-2" : ""}`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        {(lowStock || outOfStock) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <AlertTriangle
                                    className={`
                                    ${
                                      outOfStock
                                        ? "text-red-500"
                                        : "text-yellow-500"
                                    }
                                    inline mr-1 h-4 w-4 stroke-[2px]
                                  `}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {outOfStock ? "Out of stock!" : "Low stock!"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <span className="truncate max-w-[180px]">
                          {item.name}
                        </span>
                      </div>

                      {!compactMode && outOfStock && (
                        <Badge variant="destructive" className="mt-1 w-fit">
                          Out of stock
                        </Badge>
                      )}
                      {!compactMode && lowStock && !outOfStock && (
                        <Badge
                          variant="outline"
                          className="mt-1 w-fit text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20"
                        >
                          Low stock
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={compactMode ? "py-2" : ""}>
                    <Badge variant="outline" className="font-normal">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`${
                      lowStock || outOfStock ? "text-red-600 font-medium" : ""
                    } ${compactMode ? "py-2" : ""}`}
                  >
                    <div className="flex items-center gap-1">
                      {onUpdateQuantity && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleQuickUpdate(item, false)}
                              >
                                <MinusCircle className="h-5 w-5 stroke-[2px]" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Decrease quantity</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <span className="min-w-[60px] text-center">
                        {item.quantity} {formatUnit(item.quantity, item.unit)}
                      </span>

                      {onUpdateQuantity && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-600 hover:bg-green-50 hover:text-green-700"
                                onClick={() => handleQuickUpdate(item, true)}
                              >
                                <PlusCircle className="h-5 w-5 stroke-[2px]" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Increase quantity</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`hidden md:table-cell ${
                      compactMode ? "py-2" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      {reorderLevel} {formatUnit(reorderLevel, item.unit)}
                      {(lowStock || outOfStock) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-2">
                                <Info className="h-4 w-4 text-blue-500 stroke-[2px]" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {outOfStock
                                ? "Item needs to be restocked immediately!"
                                : "Item is below reorder level"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`hidden sm:table-cell ${
                      compactMode ? "py-2" : ""
                    }`}
                  >
                    {formatCurrency(item.cost_per_unit)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${compactMode ? "py-2" : ""}`}
                  >
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
                              onClick={() => onEditClick(item)}
                            >
                              <Pencil className="h-4 w-4 mr-1 stroke-[2px]" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit item details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                              onClick={() => onDeleteClick(item)}
                            >
                              <Trash2 className="h-4 w-4 mr-1 stroke-[2px]" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete this item</TooltipContent>
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
