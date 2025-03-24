"use client";

import { ShoppingListItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Clock,
  Plus,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { DataTable, Column } from "@/components/ui/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Define columns for the table
  const columns: Column<ShoppingListItem>[] = [
    {
      id: "status",
      header: "",
      cell: (item) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePurchased(item.id, !item.isPurchased);
                  }}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "h-5 w-5 border-2 rounded-md flex items-center justify-center transition-all cursor-pointer hover:shadow-sm",
                        item.isPurchased
                          ? "border-primary bg-primary text-primary-foreground"
                          : item.isUrgent
                          ? "border-red-400 bg-red-50/40"
                          : "border-blue-300 bg-transparent hover:bg-blue-50/50"
                      )}
                    >
                      {item.isPurchased && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <input
                        type="checkbox"
                        checked={item.isPurchased}
                        onChange={() => {}} // Controlled by parent onClick
                        disabled={isUpdating}
                        className="sr-only"
                        aria-label={`Mark ${item.name} as ${
                          item.isPurchased ? "not purchased" : "purchased"
                        }`}
                      />
                    </div>
                    {isUpdating && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Mark as {item.isPurchased ? "not purchased" : "purchased"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      sortable: false,
    },
    {
      id: "name",
      header: "Item Details",
      accessorKey: "name",
      cell: (item) => {
        return (
          <div className="flex flex-col py-2">
            <div className="flex items-center">
              <span
                className={cn(
                  "text-sm font-medium",
                  item.isUrgent &&
                    !item.isPurchased &&
                    "text-red-600 font-semibold",
                  item.isPurchased && "text-muted-foreground line-through"
                )}
              >
                {item.name}
              </span>

              <div className="flex space-x-1 ml-2">
                {item.isUrgent && !item.isPurchased && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}

                {item.isPurchased && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Purchased
                  </Badge>
                )}

                {item.isAutoGenerated && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Auto
                  </Badge>
                )}
              </div>
            </div>

            {item.notes && (
              <p className="text-xs text-slate-500 mt-1 max-w-md truncate">
                {item.notes}
              </p>
            )}

            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
              {item.addedAt && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatAddedDate(item.addedAt)}
                </span>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "quantity",
      header: "Qty",
      accessorKey: "quantity",
      cell: (item) => {
        return (
          <div className="text-sm">
            <span
              className={cn(
                "px-2 py-1 rounded-md tabular-nums font-medium inline-flex",
                item.isPurchased ? "bg-slate-100" : "bg-blue-50/50"
              )}
            >
              {item.quantity}
              {item.unit && (
                <span className="ml-1 text-slate-500">{item.unit}</span>
              )}
            </span>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      cell: (item) => {
        const categoryColorMap: Record<string, string> = {
          Pantry: "bg-amber-50 text-amber-700 border-amber-200",
          Dairy: "bg-blue-50 text-blue-700 border-blue-200",
          Produce: "bg-green-50 text-green-700 border-green-200",
          Meat: "bg-red-50 text-red-700 border-red-200",
          Bakery: "bg-yellow-50 text-yellow-700 border-yellow-200",
          Seafood: "bg-cyan-50 text-cyan-700 border-cyan-200",
          Other: "bg-purple-50 text-purple-700 border-purple-200",
        };

        const category = item.category;
        const colorClass =
          categoryColorMap[category] ||
          "bg-slate-50 text-slate-700 border-slate-200";

        return (
          <div>
            <Badge
              variant="outline"
              className={cn(
                "inline-flex rounded-md text-xs font-medium",
                colorClass,
                item.isPurchased && "opacity-70"
              )}
            >
              {category || "Uncategorized"}
            </Badge>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "estimatedCost",
      header: "Est. Cost",
      accessorKey: "estimatedCost",
      cell: (item) => {
        return (
          <div
            className={cn(
              "text-right px-3 py-1 rounded-md tabular-nums text-sm font-medium inline-block",
              item.isPurchased
                ? "bg-slate-100 text-slate-500"
                : "bg-green-50/50 text-green-700"
            )}
          >
            {formatCurrency(item.estimatedCost || 0)}
          </div>
        );
      },
      sortable: true,
    },
  ];

  // Custom row styling based on item state
  const getRowClassName = (item: ShoppingListItem) => {
    return cn(
      "hover:bg-slate-50/80 transition-colors",
      item.isPurchased && "bg-slate-50/70",
      item.isUrgent &&
        !item.isPurchased &&
        "bg-red-50/10 border-l-2 border-l-red-400"
    );
  };

  // Handle item deletion with confirmation
  const handleDeleteItem = (item: ShoppingListItem) => {
    if (isDeleting) return;
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      onDeleteItem(item.id);
    }
  };

  // If there are no items, show empty state
  if (items.length === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/50 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50/70 shadow-sm">
          <ShoppingBag className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="mt-6 text-lg font-medium text-slate-700">
          No items in your shopping list
        </h3>
        <p className="mt-3 text-sm text-slate-500 max-w-md">
          Your shopping list is empty. Add items manually or let us generate a
          list based on your inventory levels.
        </p>
        <div className="mt-6 flex space-x-3">
          <Button onClick={onAddItem} variant="default" className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Item Manually
          </Button>
          <Button onClick={onAddItem} variant="outline" className="shadow-sm">
            Generate Shopping List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <DataTable
        data={items}
        columns={columns}
        keyField="id"
        onEdit={onEditItem}
        onDelete={handleDeleteItem}
        rowClassName={getRowClassName}
        emptyMessage="Your shopping list is empty."
        className="bg-white rounded-md overflow-hidden border-separate border-spacing-0"
      />
    </div>
  );
}
