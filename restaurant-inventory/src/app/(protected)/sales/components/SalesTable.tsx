"use client";

import { Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiMessageSquare } from "react-icons/fi";
import { format } from "date-fns";

interface SalesTableProps {
  sales: Sale[];
  onViewNotes?: (sale: Sale) => void;
}

export default function SalesTable({ sales, onViewNotes }: SalesTableProps) {
  // Get currency formatter
  const { formatCurrency } = useCurrency();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Dish</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No sales found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{format(new Date(sale.date), "PP")}</TableCell>
                <TableCell className="font-medium">{sale.dishName}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                <TableCell className="text-right">
                  {onViewNotes && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewNotes(sale)}
                      title="Add notes"
                    >
                      <FiMessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
