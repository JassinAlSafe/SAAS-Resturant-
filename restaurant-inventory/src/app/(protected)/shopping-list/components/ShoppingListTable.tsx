"use client";

import { ShoppingListItem } from "@/lib/types";
import {
  Loader2,
  Clock,
  Plus,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Trash2,
  BarChart3,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ShoppingListTableProps {
  items: ShoppingListItem[];
  onEditItem: (item: ShoppingListItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onTogglePurchased: (id: string, isPurchased: boolean) => Promise<void>;
  isDeleting: boolean;
  isUpdating: boolean;
  onAddItem: () => void;
}

export default function ShoppingListTable({
  items,
  onEditItem,
  onDeleteItem,
  onTogglePurchased,
  isDeleting,
  isUpdating,
  onAddItem,
}: ShoppingListTableProps) {
  const { formatCurrency } = useCurrency();

  // Helper function to format dates in a more readable way
  const formatAddedDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else if (isThisWeek(date)) {
      return format(date, "EEEE"); // Day name
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  // Helper function to get category color
  const getCategoryBadgeClass = (category: string) => {
    const colors: Record<string, string> = {
      Produce: "badge-success",
      Meat: "badge-error",
      Dairy: "badge-info",
      Bakery: "badge-warning",
      Pantry: "badge-warning",
      Seafood: "badge-info",
      Frozen: "badge-primary",
      Beverages: "badge-secondary",
      Cleaning: "badge-neutral",
      Office: "badge-accent",
    };

    return colors[category] || "badge-neutral";
  };

  // Calculate statistics
  const totalItems = items.length;
  const purchasedItems = items.filter((item) => item.isPurchased).length;
  const purchasedPercentage =
    totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full flex flex-col"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card bg-base-100 shadow"
      >
        {/* Progress bar for purchased items */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs opacity-70 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Purchase progress
            </span>
            <span className="text-xs font-medium">
              {purchasedPercentage}% complete
            </span>
          </div>
          <progress
            className={cn(
              "progress w-full",
              purchasedPercentage === 100
                ? "progress-success"
                : "progress-warning"
            )}
            value={purchasedPercentage}
            max="100"
          ></progress>
        </div>

        {/* Table or Empty State */}
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="avatar placeholder mb-6">
                <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
                  <ShoppingBag className="h-12 w-12" />
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">No shopping items</h3>
              <p className="text-base-content/70 mb-6 max-w-md">
                Your shopping list is empty. Add items to get started.
              </p>
              <button onClick={onAddItem} className="btn btn-primary gap-2">
                <Plus className="h-4 w-4" />
                Add First Item
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-auto"
            >
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th className="w-[50px]"></th>
                      <th>Item Details</th>
                      <th>Qty</th>
                      <th>Category</th>
                      <th>Est. Cost</th>
                      <th className="w-[100px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className={cn(
                          "hover transition-colors",
                          item.isPurchased && "opacity-70"
                        )}
                        onClick={() => onEditItem(item)}
                      >
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={item.isPurchased}
                            className={cn(
                              "checkbox checkbox-sm",
                              item.isPurchased
                                ? "checkbox-success"
                                : item.isUrgent
                                ? "checkbox-warning"
                                : "checkbox-primary"
                            )}
                            onChange={(e) => {
                              e.stopPropagation();
                              onTogglePurchased(item.id, !item.isPurchased);
                            }}
                            disabled={isUpdating}
                          />
                        </td>
                        <td>
                          <div className="flex flex-col py-2">
                            <div className="flex items-center flex-wrap gap-2">
                              <span
                                className={cn(
                                  "font-medium",
                                  item.isUrgent &&
                                    !item.isPurchased &&
                                    "text-error",
                                  item.isPurchased && "line-through"
                                )}
                              >
                                {item.name}
                              </span>

                              {item.isUrgent && !item.isPurchased && (
                                <span className="badge badge-sm badge-error gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Urgent
                                </span>
                              )}

                              {item.isPurchased && (
                                <span className="badge badge-sm badge-success gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Purchased
                                </span>
                              )}

                              {item.isAutoGenerated && (
                                <span className="badge badge-sm badge-info">
                                  Auto
                                </span>
                              )}
                            </div>

                            {item.notes && (
                              <p className="text-xs opacity-70 mt-1 max-w-md truncate">
                                {item.notes}
                              </p>
                            )}

                            <div className="text-xs opacity-70 mt-1 space-x-2">
                              {item.addedAt && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatAddedDate(item.addedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="badge badge-primary badge-outline">
                            {item.quantity}
                            {item.unit && (
                              <span className="ml-1">{item.unit}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div
                            className={`badge badge-sm ${getCategoryBadgeClass(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </div>
                        </td>
                        <td>
                          <div className="font-medium tabular-nums">
                            {formatCurrency(item.estimatedCost)}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditItem(item);
                              }}
                              className="btn btn-ghost btn-xs"
                              aria-label={`Edit ${item.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteItem(item.id);
                              }}
                              disabled={isDeleting}
                              className="btn btn-ghost btn-xs text-error"
                              aria-label={`Delete ${item.name}`}
                            >
                              {isDeleting ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-center text-sm opacity-70 bg-base-200/30">
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>
                    Showing {items.length} of {items.length} items
                  </span>
                </div>
                <div className="flex items-center mt-2 sm:mt-0">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    Last updated: {format(new Date(), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
