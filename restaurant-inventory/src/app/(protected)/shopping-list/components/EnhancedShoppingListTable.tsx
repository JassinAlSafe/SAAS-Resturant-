"use client";

import { useState, useEffect } from "react";
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
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  CopyCheck,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EnhancedShoppingListTableProps {
  items: ShoppingListItem[];
  onEditItem: (item: ShoppingListItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onTogglePurchased: (id: string, isPurchased: boolean) => Promise<void>;
  onAddItem: () => void;
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSortChange: (value: string) => void;
  onSortDirectionChange: (value: "asc" | "desc") => void;
  isDeleting: boolean;
  isUpdating: boolean;
  selectedItems: ShoppingListItem[];
  setSelectedItems: (items: ShoppingListItem[]) => void;
}

export default function EnhancedShoppingListTable({
  items,
  onEditItem,
  onDeleteItem,
  onTogglePurchased,
  onAddItem,
  sortBy,
  sortDirection,
  onSortChange,
  onSortDirectionChange,
  isDeleting,
  isUpdating,
  selectedItems,
  setSelectedItems,
}: EnhancedShoppingListTableProps) {
  const { formatCurrency } = useCurrency();
  const [isMobile, setIsMobile] = useState(false);

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
    return "bg-blue-100 text-blue-600";
  };

  // Check if all items are selected
  const isAllSelected =
    items.length > 0 && selectedItems.length === items.length;

  // Check if some items are selected
  const isSomeSelected =
    selectedItems.length > 0 && selectedItems.length < items.length;

  // Toggle select all items
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...items]);
    }
  };

  // Toggle select a single item
  const toggleSelectItem = (item: ShoppingListItem) => {
    const isSelected = selectedItems.some(
      (selected) => selected.id === item.id
    );
    if (isSelected) {
      setSelectedItems(
        selectedItems.filter((selected) => selected.id !== item.id)
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // Check if an item is selected
  const isItemSelected = (item: ShoppingListItem) => {
    return selectedItems.some((selected) => selected.id === item.id);
  };

  // Calculate statistics
  const totalItems = items.length;
  const purchasedItems = items.filter((item) => item.isPurchased).length;
  const purchasedPercentage =
    totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

  // Detect mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Handle header click for sorting
  const handleHeaderClick = (column: string) => {
    if (sortBy === column) {
      onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSortChange(column);
      onSortDirectionChange("asc");
    }
  };

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null;

    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1" />
    );
  };

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
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              Purchase Progress
            </span>
            <motion.span
              key={purchasedPercentage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "text-sm font-bold px-2 py-0.5 rounded-full",
                purchasedPercentage === 100
                  ? "bg-green-100 text-green-600"
                  : purchasedPercentage > 50
                  ? "bg-blue-50 text-blue-500"
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
                purchasedPercentage === 100 ? "bg-green-500" : "bg-blue-500"
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
              <div className="bg-blue-50 text-blue-500 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                <ShoppingBag className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-black">
                No shopping items
              </h3>
              <p className="text-gray-600 mb-6 max-w-md text-center">
                Your shopping list is empty. Add items to get started.
              </p>
              <Button
                onClick={onAddItem}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
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
                {isMobile ? (
                  // Mobile card view
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "p-4 hover:bg-gray-50 transition-colors",
                          isItemSelected(item) && "bg-blue-50"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <CustomCheckbox
                              checked={isItemSelected(item)}
                              onCheckedChange={() => toggleSelectItem(item)}
                              className="mt-1 h-4 w-4"
                            />

                            <div>
                              <div className="flex items-center flex-wrap gap-2 mb-1">
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
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px]"
                                  >
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Urgent
                                  </Badge>
                                )}

                                {item.isPurchased && (
                                  <Badge
                                    variant="success"
                                    className="text-[10px]"
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Purchased
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mb-2 text-xs">
                                <Badge variant="outline" className="bg-gray-50">
                                  {item.quantity} {item.unit}
                                </Badge>

                                <Badge
                                  variant="outline"
                                  className={getCategoryBadgeClass(
                                    item.category
                                  )}
                                >
                                  {item.category}
                                </Badge>

                                <span className="text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatAddedDate(item.addedAt)}
                                </span>
                              </div>

                              {item.notes && (
                                <p className="text-xs text-gray-500 mb-2 max-w-md">
                                  {item.notes}
                                </p>
                              )}

                              <div className="font-medium text-blue-600">
                                {formatCurrency(item.estimatedCost)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onEditItem(item)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onTogglePurchased(
                                      item.id,
                                      !item.isPurchased
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  {item.isPurchased
                                    ? "Mark as Unpurchased"
                                    : "Mark as Purchased"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDeleteItem(item.id)}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Desktop table view
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-[50px] p-3">
                          <CustomCheckbox
                            checked={isAllSelected}
                            onCheckedChange={toggleSelectAll}
                            className={cn(
                              "h-4 w-4",
                              isSomeSelected && "bg-blue-600 text-white"
                            )}
                          />
                        </th>
                        <th
                          className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                          onClick={() => handleHeaderClick("name")}
                        >
                          <div className="flex items-center">
                            Item Details {renderSortIndicator("name")}
                          </div>
                        </th>
                        <th
                          className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                          onClick={() => handleHeaderClick("quantity")}
                        >
                          <div className="flex items-center">
                            Qty {renderSortIndicator("quantity")}
                          </div>
                        </th>
                        <th
                          className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                          onClick={() => handleHeaderClick("category")}
                        >
                          <div className="flex items-center">
                            Category {renderSortIndicator("category")}
                          </div>
                        </th>
                        <th
                          className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                          onClick={() => handleHeaderClick("cost")}
                        >
                          <div className="flex items-center">
                            Est. Cost {renderSortIndicator("cost")}
                          </div>
                        </th>
                        <th className="w-[100px] p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className={cn(
                            "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                            item.isPurchased && "opacity-70",
                            isItemSelected(item) &&
                              "bg-blue-50 hover:bg-blue-100"
                          )}
                        >
                          <td className="text-center p-3">
                            <CustomCheckbox
                              checked={isItemSelected(item)}
                              onCheckedChange={() => toggleSelectItem(item)}
                              className="h-4 w-4"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="p-3" onClick={() => onEditItem(item)}>
                            <div className="flex flex-col py-2 cursor-pointer">
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
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px]"
                                  >
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Urgent
                                  </Badge>
                                )}

                                {item.isPurchased && (
                                  <Badge
                                    variant="success"
                                    className="text-[10px]"
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Purchased
                                  </Badge>
                                )}

                                {item.isAutoGenerated && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Auto
                                  </Badge>
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
                            <div className="font-medium tabular-nums text-blue-600">
                              {formatCurrency(item.estimatedCost)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTogglePurchased(item.id, !item.isPurchased);
                                }}
                                className="h-8 w-8 text-gray-500 hover:text-green-600"
                                disabled={isUpdating}
                                aria-label={
                                  item.isPurchased
                                    ? "Mark as unpurchased"
                                    : "Mark as purchased"
                                }
                              >
                                <CopyCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditItem(item);
                                }}
                                className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                aria-label={`Edit ${item.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteItem(item.id);
                                }}
                                disabled={isDeleting}
                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                                aria-label={`Delete ${item.name}`}
                              >
                                {isDeleting ? (
                                  <span className="h-4 w-4 border-2 border-red-500 border-r-transparent rounded-full animate-spin inline-block"></span>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table Footer */}
              <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 bg-gray-50">
                <div className="flex items-center gap-1 mb-2 sm:mb-0">
                  <BarChart3 className="h-4 w-4" />
                  <span>
                    Showing {items.length} of {items.length} items
                  </span>
                </div>
                <div className="flex items-center">
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
