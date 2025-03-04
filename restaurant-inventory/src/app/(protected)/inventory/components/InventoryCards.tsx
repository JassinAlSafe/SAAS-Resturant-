"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/lib/types";
import { FiEdit2, FiTrash2, FiPackage } from "react-icons/fi";
import { useCurrency } from "@/lib/currency-context";

interface InventoryCardsProps {
  items: InventoryItem[];
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
}

export function InventoryCards({
  items,
  onEditClick,
  onDeleteClick,
}: InventoryCardsProps) {
  const { formatCurrency } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg">
        <FiPackage className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No items found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No inventory items match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        // Calculate stock status
        const isLowStock = item.quantity <= item.reorderLevel;
        const isOutOfStock = item.quantity === 0;

        return (
          <Card key={item.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg truncate">{item.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {item.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600"
                    onClick={() => onEditClick(item)}
                    title="Edit item"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600"
                    onClick={() => onDeleteClick(item)}
                    title="Delete item"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Quantity:
                  </span>
                  <span
                    className={isLowStock ? "text-red-600 font-medium" : ""}
                  >
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Reorder Level:
                  </span>
                  <span>
                    {item.reorderLevel} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cost:</span>
                  <span>{formatCurrency(item.cost_per_unit)}</span>
                </div>
              </div>

              {/* Stock Status Indicators */}
              {isOutOfStock && (
                <div className="mt-3 py-1 px-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 text-xs font-medium rounded">
                  Out of stock
                </div>
              )}
              {isLowStock && !isOutOfStock && (
                <div className="mt-3 py-1 px-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs font-medium rounded">
                  Low stock
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
