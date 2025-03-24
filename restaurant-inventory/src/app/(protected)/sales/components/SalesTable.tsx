"use client";

import { Sale } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { salesService } from "@/lib/services/sales-service";
import { format } from "date-fns";
import { toast } from "sonner";
import { DataTable, Column } from "@/components/ui/data-table";

interface SalesTableProps {
  sales: Sale[];
  onViewNotes?: (sale: Sale) => void;
  onRefresh?: () => void;
  canEdit?: boolean;
}

export default function SalesTable({
  sales,
  onRefresh,
  canEdit = true,
}: SalesTableProps) {
  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // Handle delete
  const handleDelete = async (sale: Sale) => {
    try {
      const success = await salesService.deleteSale(sale.id);

      if (success) {
        toast.success("Sale deleted successfully");
        // Refresh the sales list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error("Failed to delete sale");
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("An error occurred while deleting sale");
    }
  };

  // Define columns for DataTable
  const columns: Column<Sale>[] = [
    {
      id: "date",
      header: "Date",
      cell: (sale) => format(new Date(sale.date), "PP"),
    },
    {
      id: "dishName",
      header: "Dish",
      accessorKey: "dishName",
      cell: (sale) => (
        <span className="font-medium">{sale.dishName || "Unknown Dish"}</span>
      ),
    },
    {
      id: "quantity",
      header: "Quantity",
      cell: (sale) => sale.quantity,
    },
    {
      id: "totalAmount",
      header: "Total",
      cell: (sale) => formatCurrency(sale.totalAmount),
    },
  ];

  return (
    <DataTable
      data={sales}
      columns={columns}
      keyField="id"
      emptyMessage="No sales found matching your filters."
      className="overflow-x-auto"
      onDelete={canEdit ? handleDelete : undefined}
    />
  );
}
