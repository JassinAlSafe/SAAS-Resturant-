"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { InventoryItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency-context";

interface InventoryTableProps {
  items: InventoryItem[];
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
}

export default function InventoryTable({
  items,
  onEditClick,
  onDeleteClick,
}: InventoryTableProps) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No items found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              // Calculate stock status
              const isLowStock = item.quantity <= item.reorderLevel;
              const isOutOfStock = item.quantity === 0;

              return (
                <TableRow
                  key={item.id}
                  className={isOutOfStock ? "bg-red-50 dark:bg-red-950/20" : ""}
                >
                  <TableCell className="font-medium">
                    {item.name}
                    {isOutOfStock && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Out of stock
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell
                    className={isLowStock ? "text-red-600 font-medium" : ""}
                  >
                    {item.quantity} {item.unit}
                    {isLowStock && !isOutOfStock && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Low stock
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.reorderLevel} {item.unit}
                  </TableCell>
                  <TableCell>{formatCurrency(item.cost)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => onEditClick(item)}
                        title="Edit item"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => onDeleteClick(item)}
                        title="Delete item"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
