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
import { FiTrash2, FiList } from "react-icons/fi";
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
      {selectedItems.size > 0 && (
        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-3">
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
        </div>
      )}

      <div className="rounded-lg border border-gray-100 shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-[50px] bg-gray-50/50 font-medium">
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
              <TableHead className="bg-gray-50/50 font-medium">Item</TableHead>
              <TableHead className="bg-gray-50/50 font-medium">
                Category
              </TableHead>
              <TableHead className="bg-gray-50/50 font-medium">
                Quantity
              </TableHead>
              <TableHead className="bg-gray-50/50 font-medium">Cost</TableHead>
              <TableHead className="bg-gray-50/50 font-medium">
                Source
              </TableHead>
              <TableHead className="bg-gray-50/50 font-medium text-center">
                Purchased
              </TableHead>
              <TableHead className="bg-gray-50/50 font-medium text-right w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <FiList className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      No items found
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your filters or add new items
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className={`group hover:bg-gray-50/50 transition-colors border-gray-100 ${
                    item.isPurchased ? "bg-green-50/30" : ""
                  }`}
                >
                  <TableCell>
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
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                      {item.isPurchased && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal mt-1 w-fit bg-green-100 text-green-800 border-green-200"
                        >
                          Purchased
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="font-normal bg-gray-100 text-gray-700 border-0"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <span className="text-gray-500 ml-1">{item.unit}</span>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {formatCurrency(item.estimatedCost)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.isAutoGenerated ? "secondary" : "outline"}
                      className={
                        item.isAutoGenerated
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }
                    >
                      {item.isAutoGenerated
                        ? "Auto (Inventory)"
                        : "Manual (User)"}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                            {item.isPurchased
                              ? "Item purchased"
                              : "Mark as purchased"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveItem(item.id)}
                              className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove item</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
