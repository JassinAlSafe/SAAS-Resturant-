"use client";

import React, { useState } from "react";
import { MoreHorizontal, Minus, Plus, ImageIcon, ChevronDown, ChevronRight, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/lib/types";
import { ProxyImage } from "@/components/ui/proxy-image";
import { formatUnit, isLowStock, isOutOfStock } from "./inventoryUtils";
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
  isExpanded: boolean;
  isSelected: boolean;
  compactMode: boolean;
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  formatCurrency: (value: number) => string;
}

export function TableItem({
  item,
  isExpanded,
  isSelected,
  compactMode,
  onEditClick,
  onDeleteClick,
  onUpdateQuantity,
  onToggleSelect,
  onToggleExpand,
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
          "transition-all duration-150 group border-b border-gray-100",
          compactMode ? "h-10" : "",
          isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50",
          isExpanded && !isSelected && "bg-gray-50"
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
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={isSelected}
              onChange={onToggleSelect}
            />
          </div>
        </td>

        {/* # and SKU columns only visible in standard view */}
        {!compactMode && (
          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-base-content/60">
            {item.id.substring(0, 8)}
          </td>
        )}

        {/* Name column */}
        <td
          className={cn(
            "whitespace-nowrap",
            compactMode ? "px-3 py-1" : "px-4 py-3"
          )}
        >
          <div className="flex items-center gap-3">
            {!compactMode && (
              <div className="w-10 h-10 shrink-0 bg-base-200 rounded-md flex items-center justify-center overflow-hidden relative">
                {(item as ExtendedInventoryItem).image_url ? (
                  <ProxyImage
                    src={(item as ExtendedInventoryItem).image_url!}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-base-content/30" />
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
                <div className="text-xs text-base-content/60 line-clamp-1 mt-0.5">
                  {item.description}
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Category column */}
        <td
          className={cn(
            "whitespace-nowrap",
            compactMode ? "px-3 py-1" : "px-4 py-3"
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              "font-normal bg-base-200/50",
              compactMode ? "text-[10px] px-1 py-0" : "text-xs"
            )}
          >
            {item.category}
          </Badge>
        </td>

        {/* Quantity column */}
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
                itemIsOutOfStock && "text-error",
                itemIsLowStock &&
                  !itemIsOutOfStock &&
                  "text-warning"
              )}
            >
              {item.quantity}
            </span>
            <span
              className={cn(
                "text-base-content/60 ml-1",
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
                  size="sm"
                  className="h-6 w-6 rounded text-base-content/60 hover:text-base-content hover:bg-base-200"
                  onClick={() => handleQuickUpdate(false)}
                  disabled={item.quantity <= 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 rounded text-base-content/60 hover:text-base-content hover:bg-base-200"
                  onClick={() => handleQuickUpdate(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </td>

        {/* Unit column */}
        <td
          className={cn(
            "whitespace-nowrap",
            compactMode ? "px-3 py-1" : "px-4 py-3"
          )}
        >
          <span className={cn("text-sm text-gray-600", compactMode ? "text-xs" : "text-sm")}>
            {item.unit}
          </span>
        </td>

        {/* Cost column */}
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

        {/* Total Value column */}
        <td
          className={cn(
            "whitespace-nowrap text-right",
            compactMode ? "px-3 py-1" : "px-4 py-3"
          )}
        >
          <span
            className={cn("font-medium", compactMode ? "text-xs" : "text-sm")}
          >
            {formatCurrency((item.cost_per_unit || 0) * item.quantity)}
          </span>
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
                  size="sm"
                  className="h-6 w-6 rounded-full btn-ghost hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => onEditClick(item)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 rounded-full btn-ghost hover:bg-red-50 hover:text-red-600"
                  onClick={() => onDeleteClick(item)}
                >
                  <Trash className="h-3 w-3 text-red-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 rounded-full btn-ghost hover:bg-orange-50 hover:text-orange-600"
                  onClick={onToggleExpand}
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
                        size="sm"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity btn-ghost hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => onEditClick(item)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-gray-500" />
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
                        size="sm"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity btn-ghost hover:bg-red-50 hover:text-red-600"
                        onClick={() => onDeleteClick(item)}
                      >
                        <Trash className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Delete item</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 rounded-full",
                          isExpanded ? "bg-orange-100 text-orange-600" : "opacity-0 group-hover:opacity-100 hover:bg-orange-50 hover:text-orange-600"
                        )}
                        onClick={onToggleExpand}
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
        <tr className="bg-base-200/10">
          <td colSpan={9} className="p-0">
            <ExpandedItemContent item={item} formatCurrency={formatCurrency} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
