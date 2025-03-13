"use client";

import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";
import { InventoryItem } from "../types";

export const InventoryRow = ({
  name,
  stock,
  usage,
  depletion,
  depleted,
  warning,
}: InventoryItem) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>{stock}</TableCell>
      <TableCell>{usage}</TableCell>
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
          {depletion}
        </span>
      </TableCell>
    </TableRow>
  );
};
