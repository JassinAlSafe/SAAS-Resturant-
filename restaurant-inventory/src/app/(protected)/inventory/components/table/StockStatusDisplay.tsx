"use client";

import React from "react";
import { InventoryItem } from "@/lib/types";
import {
  formatUnit,
  getReorderLevel,
  getStockStatusColor,
  getStockStatusLetter,
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
  const stockStatus = getStockStatusLetter(item);
  const stockStatusColor = getStockStatusColor(item);
  const reorderLevel = getReorderLevel(item);
  
  // Calculate max stock as 3x reorder level if not specified
  const maxStock = item.max_stock || (reorderLevel * 3);

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
              <div className="text-xs text-muted-foreground">
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
          />
        </div>
      )}
    </div>
  );
}
