"use client";

import React from "react";
import { InventoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Pencil,
  Plus,
  Minus,
} from "lucide-react";
import { ProxyImage } from "@/components/ui/proxy-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUnit, isLowStock, isOutOfStock } from "./inventoryUtils";
import { StockStatusDisplay } from "./StockStatusDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExpandedItemContent } from "./ExpandedItemContent";

// Extended InventoryItem type to include possible image_url
interface ExtendedInventoryItem extends InventoryItem {
  expiry_date?: string;
  image_url?: string;
}

interface TableItemProps {
  item: InventoryItem;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  compactMode: boolean;
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
  toggleItemSelection: (itemId: string) => void;
  toggleExpanded: (itemId: string) => void;
  formatCurrency: (value: number) => string;
}

export function TableItem({
  item,
  index,
  isExpanded,
  isSelected,
  compactMode,
  onEditClick,
  // onDeleteClick,
  onUpdateQuantity,
  toggleItemSelection,
  toggleExpanded,
  formatCurrency,
}: TableItemProps) {
  const itemIsLowStock = isLowStock(item);
  const itemIsOutOfStock = isOutOfStock(item);

  // Quick update quantity handler
  const handleQuickUpdate = (increment: boolean) => {
    if (!onUpdateQuantity) return;

    const delta = increment ? 1 : -1;
    const newQuantity = Math.max(0, item.quantity + delta);

    // Only update if the quantity actually changed
    if (newQuantity !== item.quantity) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <React.Fragment>
      <tr
        className={cn(
          "transition-all duration-150 group",
          compactMode ? "h-10" : "",
          isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40",
          isExpanded && !isSelected && "bg-muted/20"
        )}
      >
        <td
          className={cn(
            "whitespace-nowrap",
            compactMode ? "px-3 py-1" : "px-4 py-3"
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

        {/* # and SKU columns only visible in standard view */}
        {!compactMode && (
          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-muted-foreground">
            {index + 1}
          </td>
        )}

        {!compactMode && (
          <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-muted-foreground">
            {item.id.substring(0, 8)}
          </td>
        )}

        <td
          className={cn(
            "whitespace-nowrap",
            compactMode ? "px-3 py-1" : "px-4 py-3"
          )}
        >
          <div className="flex items-center gap-3">
            {!compactMode && (
              <div className="w-10 h-10 shrink-0 bg-muted/50 rounded-md flex items-center justify-center overflow-hidden relative">
                {(item as ExtendedInventoryItem).image_url ? (
                  <ProxyImage
                    src={(item as ExtendedInventoryItem).image_url!}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                )}
              </div>
            )}
            <div>
              <div
                className={cn(
                  "font-medium line-clamp-1",
                  compactMode ? "text-xs" : "text-sm"
                )}
              >
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
            "whitespace-nowrap",
            compactMode ? "px-3 py-1" : "px-4 py-3"
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              "font-normal bg-muted/30",
              compactMode ? "text-[10px] px-1 py-0" : "text-xs"
            )}
          >
            {item.category}
          </Badge>
        </td>

        <td
          className={cn(
            "whitespace-nowrap text-right",
            compactMode ? "px-3 py-1" : "px-4 py-3"
          )}
        >
          <span
            className={cn("font-medium", compactMode ? "text-xs" : "text-sm")}
          >
            {formatCurrency(item.cost_per_unit || 0)}
          </span>
        </td>

        <td
          className={cn(
            "whitespace-nowrap text-right",
            compactMode ? "px-3 py-1" : "px-4 py-3"
          )}
        >
          <div className="flex items-center justify-end gap-1">
            <span
              className={cn(
                "font-medium",
                compactMode ? "text-xs" : "text-sm",
                itemIsOutOfStock && "text-red-600 dark:text-red-400",
                itemIsLowStock &&
                  !itemIsOutOfStock &&
                  "text-amber-600 dark:text-amber-400"
              )}
            >
              {item.quantity}
            </span>
            <span
              className={cn(
                "text-muted-foreground ml-1",
                compactMode ? "text-[10px]" : "text-xs"
              )}
            >
              {formatUnit(item.quantity, item.unit)}
            </span>

            {/* Show update controls on hover in standard view */}
            {!compactMode && onUpdateQuantity && (
              <div className="hidden group-hover:flex ml-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  onClick={() => handleQuickUpdate(false)}
                  disabled={item.quantity <= 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  onClick={() => handleQuickUpdate(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </td>

        <td
          className={cn(
            "whitespace-nowrap text-center",
            compactMode ? "px-3 py-1" : "px-4 py-3"
          )}
        >
          <StockStatusDisplay item={item} compactMode={compactMode} />
        </td>

        <td
          className={cn(
            "whitespace-nowrap text-center",
            compactMode ? "px-2 py-1" : "px-4 py-3"
          )}
        >
          <div className="flex items-center justify-center">
            {compactMode ? (
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => onEditClick(item)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => toggleExpanded(item.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEditClick(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Edit item</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-full",
                          isExpanded && "bg-muted/60"
                        )}
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
                        {isExpanded ? "Collapse details" : "Expand details"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded row with additional details */}
      {isExpanded && (
        <tr className="bg-muted/10 dark:bg-gray-900/10">
          <td colSpan={9} className="p-0">
            <ExpandedItemContent item={item} formatCurrency={formatCurrency} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
