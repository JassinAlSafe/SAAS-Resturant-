"use client";

import React from "react";
import { InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Plus,
  Minus,
  ArrowUpDown,
  ChevronUp,
} from "lucide-react";
import { formatUnit } from "./inventoryUtils";

interface InventoryItemActionsProps {
  item: InventoryItem;
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
  toggleExpanded: (itemId: string) => void;
  formatCurrency: (value: number) => string;
}

export default function InventoryItemActions({
  item,
  onEditClick,
  onDeleteClick,
  onUpdateQuantity,
  toggleExpanded,
  formatCurrency,
}: InventoryItemActionsProps) {
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
    <div className="bg-linear-to-r from-muted/50 to-card rounded-lg border border-border shadow-xs overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-5 py-3">
        <h3 className="font-medium">Item Actions</h3>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Quantity Update Section */}
          {onUpdateQuantity && (
            <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-700 dark:text-blue-400">
                  Update Quantity
                </h4>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Current:{" "}
                  <span className="font-medium text-foreground">
                    {item.quantity} {formatUnit(item.quantity, item.unit)}
                  </span>
                </div>

                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickUpdate(false)}
                    disabled={item.quantity <= 0}
                    className="h-8 rounded-r-none border-r-0 bg-card hover:bg-muted/30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <div className="h-8 w-10 flex items-center justify-center border-y border-input bg-card text-sm font-medium">
                    {item.quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickUpdate(true)}
                    className="h-8 rounded-l-none border-l-0 bg-card hover:bg-muted/30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit/Delete Section */}
          <div className="bg-muted/50 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Manage Item</h4>
            </div>

            <div className="flex gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => onEditClick(item)}
                className="h-9 px-4 flex-1"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit Details
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteClick(item)}
                className="h-9 px-3 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 dark:border-red-900 dark:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="sm:col-span-2 flex flex-wrap gap-2 mt-2 border-t pt-4 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => toggleExpanded(item.id)}
            >
              <ChevronUp className="h-3.5 w-3.5 mr-1" />
              Collapse Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
