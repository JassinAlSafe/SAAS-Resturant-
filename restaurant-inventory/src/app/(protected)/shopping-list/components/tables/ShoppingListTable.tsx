"use client";

import { ShoppingListItem } from "@/lib/types";
import {
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
import { useState, useEffect } from "react";

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

  // Helper function to get category color - modified to use new color theme
  const getCategoryBadgeClass = (category: string) => {
    // Using a single orange accent color with different opacities for categories
    return "bg-orange-100 text-orange-600";
  };

  // Calculate statistics
  const totalItems = items.length;
  const purchasedItems = items.filter((item) => item.isPurchased).length;
  const purchasedPercentage =
    totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

  // Inside the component, after all the current variables and functions but before the return statement
  // Add responsive view toggle
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Add effect to handle responsive view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("card");
      } else {
        setViewMode("table");
      }
    };

    // Set initial view mode
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        className="bg-white rounded-lg shadow-sm border border-gray-100"
      >
        {/* Progress bar for purchased items */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1.5 text-black">
              <CheckCircle2 className="h-4 w-4 text-orange-500" />
              Purchase Progress
            </span>
            <motion.span
              key={purchasedPercentage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "text-sm font-bold px-2 py-0.5 rounded-full",
                purchasedPercentage === 100
                  ? "bg-orange-100 text-orange-600"
                  : purchasedPercentage > 50
                  ? "bg-orange-50 text-orange-500"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              {purchasedPercentage}% complete
            </motion.span>
          </div>
          <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${purchasedPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "absolute top-0 left-0 h-full rounded-full",
                purchasedPercentage === 100 ? "bg-orange-500" : "bg-orange-400"
              )}
            />
            {purchasedPercentage > 0 && purchasedPercentage < 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  x: ["0%", "5%", "0%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            )}
          </div>
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
              className="flex flex-col items-center justify-center py-16 px-4"
            >
              <div className="bg-orange-50 text-orange-500 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                <ShoppingBag className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-black">
                No shopping items
              </h3>
              <p className="text-gray-600 mb-6 max-w-md text-center">
                Your shopping list is empty. Add items to get started.
              </p>
              <button
                onClick={onAddItem}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add First Item
              </button>
            </motion.div>
          ) : (
            <>
              {viewMode === "table" ? (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-auto"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-[50px] p-3"></th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Item Details
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Qty
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Category
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Est. Cost
                          </th>
                          <th className="w-[100px] p-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className={cn(
                              "border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer",
                              item.isPurchased && "opacity-70"
                            )}
                            onClick={() => onEditItem(item)}
                          >
                            <td className="text-center p-3">
                              <input
                                type="checkbox"
                                checked={item.isPurchased}
                                className={cn(
                                  "h-4 w-4 rounded",
                                  item.isPurchased
                                    ? "text-orange-500 focus:ring-orange-500"
                                    : item.isUrgent
                                    ? "text-orange-500 focus:ring-orange-500"
                                    : "text-orange-400 focus:ring-orange-400"
                                )}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  onTogglePurchased(item.id, !item.isPurchased);
                                }}
                                disabled={isUpdating}
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col py-2">
                                <div className="flex items-center flex-wrap gap-2">
                                  <span
                                    className={cn(
                                      "font-medium text-black",
                                      item.isUrgent &&
                                        !item.isPurchased &&
                                        "text-red-600",
                                      item.isPurchased &&
                                        "line-through text-gray-500"
                                    )}
                                  >
                                    {item.name}
                                  </span>

                                  {item.isUrgent && !item.isPurchased && (
                                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      Urgent
                                    </span>
                                  )}

                                  {item.isPurchased && (
                                    <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Purchased
                                    </span>
                                  )}

                                  {item.isAutoGenerated && (
                                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                                      Auto
                                    </span>
                                  )}
                                </div>

                                {item.notes && (
                                  <p className="text-xs text-gray-500 mt-1 max-w-md truncate">
                                    {item.notes}
                                  </p>
                                )}

                                <div className="text-xs text-gray-500 mt-1 space-x-2">
                                  {item.addedAt && (
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatAddedDate(item.addedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                {item.quantity}
                                {item.unit && (
                                  <span className="ml-1">{item.unit}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div
                                className={`text-xs px-2 py-0.5 rounded-full ${getCategoryBadgeClass(
                                  item.category
                                )}`}
                              >
                                {item.category}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium tabular-nums text-black">
                                {formatCurrency(item.estimatedCost)}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditItem(item);
                                  }}
                                  className="text-gray-500 hover:text-orange-500 p-1 rounded-full hover:bg-orange-50 transition-colors"
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
                                  className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                  aria-label={`Delete ${item.name}`}
                                >
                                  {isDeleting ? (
                                    <span className="h-4 w-4 border-2 border-red-500 border-r-transparent rounded-full animate-spin inline-block"></span>
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
                  <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 bg-gray-50">
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
              ) : (
                <motion.div
                  key="cards"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 grid grid-cols-1 gap-4"
                >
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "bg-white rounded-lg shadow-sm border p-4",
                        item.isPurchased
                          ? "border-gray-200 bg-gray-50"
                          : item.isUrgent
                          ? "border-orange-200"
                          : "border-gray-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.isPurchased}
                            className={cn(
                              "h-5 w-5 rounded",
                              item.isPurchased
                                ? "text-orange-500 focus:ring-orange-500"
                                : item.isUrgent
                                ? "text-orange-500 focus:ring-orange-500"
                                : "text-orange-400 focus:ring-orange-400"
                            )}
                            onChange={(e) => {
                              e.stopPropagation();
                              onTogglePurchased(item.id, !item.isPurchased);
                            }}
                          />
                          <div>
                            <h3
                              className={cn(
                                "font-medium text-gray-900",
                                item.isPurchased && "line-through text-gray-500"
                              )}
                            >
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <span>
                                {item.quantity} {item.unit}
                              </span>
                              {item.isUrgent && (
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full ml-2">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditItem(item);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            getCategoryBadgeClass(item.category)
                          )}
                        >
                          {item.category || "Uncategorized"}
                        </span>

                        {item.estimatedCost > 0 && (
                          <span className="text-sm font-medium">
                            {formatCurrency(item.estimatedCost)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
