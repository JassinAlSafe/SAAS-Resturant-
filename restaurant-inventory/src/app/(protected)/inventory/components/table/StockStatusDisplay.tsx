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

interface StockStatusDisplayProps {
  item: InventoryItem;
  compactMode?: boolean;
}

export function StockStatusDisplay({
  item,
  compactMode = false,
}: StockStatusDisplayProps) {
  const itemIsLowStock = isLowStock(item);
  const itemIsOutOfStock = isOutOfStock(item);
  const stockStatus = getStockStatusLetter(item);
  const stockStatusColor = getStockStatusColor(item);
  const reorderLevel = getReorderLevel(item);

  return (
    <div className="flex justify-center">
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
          <TooltipContent side="left">
            <p>
              {itemIsOutOfStock
                ? "Out of Stock"
                : itemIsLowStock
                ? `Low Stock (Reorder at ${reorderLevel} ${formatUnit(
                    reorderLevel,
                    item.unit
                  )})`
                : "In Stock"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
