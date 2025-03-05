"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { useCurrency } from "@/lib/currency-context";
import { ShoppingListItem } from "@/lib/services/shopping-list-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiTrash2 } from "react-icons/fi";
import { Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShoppingListTableProps {
  items: ShoppingListItem[];
  onMarkPurchased: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function ShoppingListTable({
  items,
  onMarkPurchased,
  onRemoveItem,
}: ShoppingListTableProps) {
  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // State for bulk selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Handle select all
  const handleSelectAll = () => {
    if (
      selectedItems.size === items.filter((item) => !item.isPurchased).length
    ) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(
          items.filter((item) => !item.isPurchased).map((item) => item.id)
        )
      );
    }
  };

  // Handle select item
  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Handle purchase checkbox change
  const handlePurchaseChange = (itemId: string, checked: boolean) => {
    if (checked) {
      try {
        // Mark as purchased immediately
        onMarkPurchased(itemId);

        // Remove from selected items if it was selected
        if (selectedItems.has(itemId)) {
          const newSelected = new Set(selectedItems);
          newSelected.delete(itemId);
          setSelectedItems(newSelected);
        }
      } catch (error) {
        console.error("Error marking item as purchased:", error);
        // The parent component will handle showing the error notification
      }
    }
  };

  // Handle bulk mark as purchased
  const handleBulkMarkAsPurchased = () => {
    selectedItems.forEach((itemId) => {
      onMarkPurchased(itemId);
    });
    setSelectedItems(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {selectedItems.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-blue-700">
            {selectedItems.size} item{selectedItems.size > 1 ? "s" : ""}{" "}
            selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkMarkAsPurchased}
            className="bg-white hover:bg-green-50 border-green-200 text-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark All as Purchased
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[50px] py-3">
                <div className="flex items-center justify-center">
                  <CustomCheckbox
                    id="select-all"
                    checked={
                      selectedItems.size ===
                        items.filter((item) => !item.isPurchased).length &&
                      items.some((item) => !item.isPurchased)
                    }
                    onCheckedChange={handleSelectAll}
                    disabled={!items.some((item) => !item.isPurchased)}
                  />
                </div>
              </TableHead>
              <TableHead className="py-3 font-medium text-gray-700">
                Item
              </TableHead>
              <TableHead className="py-3 font-medium text-gray-700">
                Category
              </TableHead>
              <TableHead className="py-3 font-medium text-gray-700">
                Quantity
              </TableHead>
              <TableHead className="py-3 font-medium text-gray-700">
                Cost
              </TableHead>
              <TableHead className="py-3 font-medium text-gray-700">
                Source
              </TableHead>
              <TableHead className="py-3 text-center font-medium text-gray-700">
                Purchased
              </TableHead>
              <TableHead className="py-3 text-center font-medium text-gray-700 w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-gray-500"
                >
                  No items found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    item.isPurchased ? "bg-green-50" : ""
                  }`}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center justify-center">
                      {!item.isPurchased ? (
                        <CustomCheckbox
                          id={`select-${item.id}`}
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                      ) : (
                        <CustomCheckbox
                          variant="purchased"
                          checked={true}
                          disabled
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-medium text-gray-900">
                    <div className="flex items-center">
                      <span>{item.name}</span>
                      {item.isPurchased && (
                        <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                          Purchased
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <span className="text-gray-500 ml-1">{item.unit}</span>
                  </TableCell>
                  <TableCell className="py-4 font-medium text-gray-900">
                    {formatCurrency(item.estimatedCost)}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={item.isAutoGenerated ? "secondary" : "outline"}
                      className={
                        item.isAutoGenerated
                          ? "bg-purple-100 text-purple-800 border-purple-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {item.isAutoGenerated
                        ? "Auto (Inventory)"
                        : "Manual (User)"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <CustomCheckbox
                                id={`purchase-${item.id}`}
                                checked={item.isPurchased}
                                onCheckedChange={(checked) =>
                                  handlePurchaseChange(item.id, checked)
                                }
                                variant={
                                  item.isPurchased ? "purchased" : "default"
                                }
                                disabled={item.isPurchased}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {item.isPurchased
                                ? "Purchased"
                                : "Mark as purchased"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove item"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
