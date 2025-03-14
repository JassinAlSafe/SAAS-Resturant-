"use client";

import { ShoppingListItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Loader2, Trash } from "lucide-react";

interface ShoppingListTableProps {
  items: ShoppingListItem[];
  onEditItem: (item: ShoppingListItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onTogglePurchased: (id: string, isPurchased: boolean) => Promise<void>;
  isDeleting: boolean;
  isUpdating: boolean;
}

export default function ShoppingListTable({
  items,
  onEditItem,
  onDeleteItem,
  onTogglePurchased,
  isDeleting,
  isUpdating,
}: ShoppingListTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          No items in your shopping list
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Est. Cost</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={item.is_purchased}
                  onCheckedChange={(checked) =>
                    onTogglePurchased(item.id, checked as boolean)
                  }
                  disabled={isUpdating}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div>
                  <span
                    className={
                      item.is_purchased
                        ? "text-muted-foreground line-through"
                        : ""
                    }
                  >
                    {item.name}
                  </span>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">
                      {item.notes}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {item.quantity} {item.unit}
              </TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="text-right">
                ${item.estimated_cost.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditItem(item)}
                    disabled={isDeleting || isUpdating}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteItem(item.id)}
                    disabled={isDeleting || isUpdating}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
