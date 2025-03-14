"use client";

import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";
import { InventoryItemDetail } from "../types";

export const InventoryRow = ({ item }: { item: InventoryItemDetail }) => {
  // Calculate depletion status
  const depleted = item.daysUntilDepletion <= 3;
  const warning = item.daysUntilDepletion > 3 && item.daysUntilDepletion <= 7;
  const depletionText =
    item.daysUntilDepletion === 999 ? "N/A" : `${item.daysUntilDepletion} days`;

  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{`${item.currentStock} ${item.unit}`}</TableCell>
      <TableCell>{`${item.usage.toFixed(1)} ${item.unit}`}</TableCell>
      <TableCell>
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            depleted
              ? "bg-destructive/10 text-destructive"
              : warning
              ? "bg-warning/10 text-warning"
              : "bg-success/10 text-success"
          )}
        >
          {depletionText}
        </span>
      </TableCell>
    </TableRow>
  );
};
