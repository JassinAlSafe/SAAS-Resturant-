"use client";

import { ShoppingListItem } from "@/lib/types";
import {
  Clock,
  Plus,
  ShoppingBag,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> =
      {
        Produce: {
          bg: "bg-green-50",
          text: "text-green-600",
          border: "border-green-200",
        },
        Meat: {
          bg: "bg-red-50",
          text: "text-red-600",
          border: "border-red-200",
        },
        Dairy: {
          bg: "bg-blue-50",
          text: "text-blue-600",
          border: "border-blue-200",
        },
        Bakery: {
          bg: "bg-amber-50",
          text: "text-amber-600",
          border: "border-amber-200",
        },
        Pantry: {
          bg: "bg-yellow-50",
          text: "text-yellow-600",
          border: "border-yellow-200",
        },
        Seafood: {
          bg: "bg-cyan-50",
          text: "text-cyan-600",
          border: "border-cyan-200",
        },
        Frozen: {
          bg: "bg-indigo-50",
          text: "text-indigo-600",
          border: "border-indigo-200",
        },
        Beverages: {
          bg: "bg-purple-50",
          text: "text-purple-600",
          border: "border-purple-200",
        },
        Cleaning: {
          bg: "bg-slate-50",
          text: "text-slate-600",
          border: "border-slate-200",
        },
        Office: {
          bg: "bg-pink-50",
          text: "text-pink-600",
          border: "border-pink-200",
        },
      };

    return (
      colors[category] || {
        bg: "bg-gray-50",
        text: "text-gray-600",
        border: "border-gray-200",
      }
    );
  };

  // Calculate statistics
  const totalItems = items.length;
  const purchasedItems = items.filter((item) => item.isPurchased).length;
  const purchasedPercentage =
    totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
      {/* Progress bar for purchased items */}
      <div className="p-5 bg-blue-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Purchase progress
          </span>
          <span className="text-sm font-semibold">
            {purchasedItems} of {totalItems} items ({purchasedPercentage}%)
          </span>
        </div>
        <Progress
          value={purchasedPercentage}
          className="h-2 rounded-full bg-gray-100"
          variant={purchasedPercentage >= 100 ? "success" : "primary"}
        />
      </div>

      {/* Table or Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white">
          <div className="rounded-full bg-gray-50 p-6 mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Your shopping list is empty
          </h3>
          <p className="text-gray-500 mb-8 max-w-md">
            You haven&apos;t added any items to your shopping list yet. Add your
            first item to get started.
          </p>
          <Button
            onClick={onAddItem}
            size="lg"
            className="gap-2 bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
            Add First Item
          </Button>
        </div>
      ) : (
        <CardContent className="p-0">
          {/* Desktop table view */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
                    Item
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
                    Category
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
                    Quantity
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
                    Cost
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
                    Added
                  </th>
                  <th className="py-3 px-4 text-center font-medium text-gray-500 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-gray-100 hover:bg-gray-50/50 transition-colors",
                      item.isPurchased && "bg-gray-50/30"
                    )}
                  >
                    {/* Status checkbox */}
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.isPurchased}
                          onChange={() =>
                            onTogglePurchased(item.id, !item.isPurchased)
                          }
                          disabled={isUpdating}
                          className="h-5 w-5 rounded text-blue-500 border-gray-300 focus:ring focus:ring-blue-200 cursor-pointer"
                        />
                        {item.isUrgent && (
                          <span className="ml-2 text-xs font-medium px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                            Urgent
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Item name */}
                    <td className="py-3 px-4">
                      <div
                        className={cn(
                          "font-medium",
                          item.isPurchased && "line-through text-gray-400"
                        )}
                      >
                        {item.name}
                        {item.isAutoGenerated && (
                          <span className="ml-2 text-xs font-medium px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded">
                            Auto
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-gray-500 text-xs mt-1">
                          {item.notes}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full",
                          item.category === "Dairy" &&
                            "bg-blue-50 text-blue-600",
                          item.category === "Pantry" &&
                            "bg-yellow-50 text-yellow-600",
                          item.category === "Beverages" &&
                            "bg-purple-50 text-purple-600",
                          item.category === "Meat" && "bg-red-50 text-red-600",
                          item.category === "Produce" &&
                            "bg-green-50 text-green-600",
                          item.category === "Seafood" &&
                            "bg-cyan-50 text-cyan-600",
                          item.category === "Bakery" &&
                            "bg-amber-50 text-amber-600",
                          item.category === "Frozen" &&
                            "bg-indigo-50 text-indigo-600",
                          item.category === "Cleaning" &&
                            "bg-slate-50 text-slate-600",
                          item.category === "Office" &&
                            "bg-pink-50 text-pink-600"
                        )}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4">
                      <span className="font-medium">{item.quantity}</span>
                      <span className="text-gray-500 ml-1">{item.unit}</span>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4">
                      <span className="font-medium">
                        {formatCurrency(item.estimatedCost)}
                      </span>
                    </td>

                    {/* Added date */}
                    <td className="py-3 px-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-3 w-3 mr-1.5 text-gray-400" />
                        {formatAddedDate(item.addedAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onEditItem(item)}
                          disabled={isUpdating}
                          className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-500 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3 p-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-4 border border-gray-100 rounded-lg",
                  item.isPurchased && "bg-gray-50/30"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={item.isPurchased}
                        onChange={() =>
                          onTogglePurchased(item.id, !item.isPurchased)
                        }
                        disabled={isUpdating}
                        className="h-5 w-5 rounded text-blue-500 border-gray-300 focus:ring focus:ring-blue-200 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium",
                            item.isPurchased && "line-through text-gray-400"
                          )}
                        >
                          {item.name}
                        </span>
                        {item.isUrgent && (
                          <span className="text-xs font-medium px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                            Urgent
                          </span>
                        )}
                        {item.isAutoGenerated && (
                          <span className="text-xs font-medium px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded">
                            Auto
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 items-center text-sm">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            item.category === "Dairy" &&
                              "bg-blue-50 text-blue-600",
                            item.category === "Pantry" &&
                              "bg-yellow-50 text-yellow-600",
                            item.category === "Beverages" &&
                              "bg-purple-50 text-purple-600",
                            item.category === "Meat" &&
                              "bg-red-50 text-red-600",
                            item.category === "Produce" &&
                              "bg-green-50 text-green-600",
                            item.category === "Seafood" &&
                              "bg-cyan-50 text-cyan-600",
                            item.category === "Bakery" &&
                              "bg-amber-50 text-amber-600",
                            item.category === "Frozen" &&
                              "bg-indigo-50 text-indigo-600",
                            item.category === "Cleaning" &&
                              "bg-slate-50 text-slate-600",
                            item.category === "Office" &&
                              "bg-pink-50 text-pink-600"
                          )}
                        >
                          {item.category}
                        </span>

                        <span className="text-gray-500">
                          <span className="font-medium text-gray-700">
                            {item.quantity}
                          </span>{" "}
                          {item.unit}
                        </span>

                        <span className="text-gray-500">
                          <span className="font-medium text-gray-700">
                            {formatCurrency(item.estimatedCost)}
                          </span>
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-gray-500 text-xs mt-2 bg-gray-50 p-2 rounded">
                          {item.notes}
                        </p>
                      )}

                      <div className="flex items-center text-gray-400 text-xs mt-3">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatAddedDate(item.addedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditItem(item)}
                      disabled={isUpdating}
                      className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-500 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      disabled={isDeleting}
                      className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
