"use client";

import React from "react";
import { InventoryItem } from "@/lib/types";
import {
  formatUnit,
  getReorderLevel,
  isLowStock,
  isOutOfStock,
} from "./inventoryUtils";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InventoryLevelIndicator } from "../InventoryLevelIndicator";

interface StockStatusDisplayProps {
  item: InventoryItem;
  compactMode?: boolean;
  showProgressBar?: boolean;
}

export function StockStatusDisplay({
  item,
  compactMode = false,
  showProgressBar = !compactMode, // Show progress bar by default in standard mode
}: StockStatusDisplayProps) {
  const itemIsLowStock = isLowStock(item);
  const itemIsOutOfStock = isOutOfStock(item);
  const reorderLevel = getReorderLevel(item);
  
  // Calculate max stock as 3x reorder level if not specified
  const maxStock = item.max_stock || (reorderLevel * 3);

  // Get stock status letter
  const getStockStatusLetter = (item: InventoryItem): string => {
    if (item.quantity === 0) return "C";
    if (item.quantity <= (item.reorder_point || item.minimum_stock_level || 5))
      return "B";
    return "A";
  };

  // Get stock status color using DaisyUI classes
  const getStockStatusColor = (item: InventoryItem): string => {
    if (isOutOfStock(item)) {
      return "text-error border-error/30 bg-error/10";
    }
    if (isLowStock(item)) {
      return "text-warning border-warning/30 bg-warning/10";
    }
    return "text-success border-success/30 bg-success/10";
  };

  const stockStatus = getStockStatusLetter(item);
  const stockStatusColor = getStockStatusColor(item);

  return (
    <div className={cn("flex", showProgressBar ? "flex-col items-center gap-2" : "justify-center")}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center justify-center font-medium border",
                compactMode ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm",
                "rounded-full",
                stockStatusColor
              )}
            >
              {stockStatus}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="max-w-xs">
            <div className="text-sm">
              <div className="font-medium mb-1">
                {itemIsOutOfStock
                  ? "Out of Stock"
                  : itemIsLowStock
                  ? "Low Stock"
                  : "In Stock"}
              </div>
              <div className="text-xs text-base-content/70">
                {itemIsLowStock && !itemIsOutOfStock
                  ? `Below reorder level of ${reorderLevel} ${formatUnit(
                      reorderLevel,
                      item.unit
                    )}`
                  : itemIsOutOfStock
                  ? `Reorder level: ${reorderLevel} ${formatUnit(
                      reorderLevel,
                      item.unit
                    )}`
                  : `Reorder level: ${reorderLevel} ${formatUnit(
                      reorderLevel,
                      item.unit
                    )}`}
              </div>
              
              {/* Add inventory level indicator in the tooltip */}
              <div className="mt-2">
                <InventoryLevelIndicator
                  currentStock={item.quantity}
                  minStock={0}
                  maxStock={maxStock}
                  size="sm"
                  showLabels={true}
                />
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Show inventory level indicator below the status badge in standard mode */}
      {showProgressBar && (
        <div className="w-16">
          <InventoryLevelIndicator
            currentStock={item.quantity}
            minStock={0}
            maxStock={maxStock}
            size="sm"
            showLabels={false}
          />
        </div>
      )}
    </div>
  );
}
