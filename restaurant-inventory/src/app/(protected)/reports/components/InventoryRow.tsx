"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { InventoryRowProps } from "../types";

export const InventoryRow = ({
  name,
  stock,
  usage,
  depletion,
  depleted,
  warning = false,
}: InventoryRowProps) => (
  <TableRow>
    <TableCell className="font-medium text-xs md:text-sm py-2 md:py-4">
      {name}
    </TableCell>
    <TableCell className="text-xs md:text-sm py-2 md:py-4">{stock}</TableCell>
    <TableCell className="text-xs md:text-sm py-2 md:py-4">{usage}</TableCell>
    <TableCell
      className={`font-medium text-xs md:text-sm py-2 md:py-4 ${
        depleted
          ? "text-red-600"
          : warning
          ? "text-orange-600"
          : "text-green-600"
      }`}
    >
      {depletion}
    </TableCell>
  </TableRow>
);
