"use client";

import { Sale } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { salesService } from "@/lib/services/sales-service";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2, FileText } from "lucide-react";

interface SalesTableProps {
  sales: Sale[];
  onViewNotes?: (sale: Sale) => void;
  onRefresh?: () => void;
  canEdit?: boolean;
}

export default function SalesTable({
  sales,
  onViewNotes,
  onRefresh,
  canEdit = true,
}: SalesTableProps) {
  const { formatCurrency } = useCurrency();

  const handleDelete = async (sale: Sale) => {
    try {
      const success = await salesService.deleteSale(sale.id);

      if (success) {
        toast.success("Sale deleted successfully");
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

  if (sales.length === 0) {
    return (
      <div className="bg-orange-50/30 rounded-xl p-10 text-center">
        <p className="text-neutral-600">
          No sales found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-orange-50">
              <th className="py-4 px-6 text-left text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Date
              </th>
              <th className="py-4 px-6 text-left text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Dish
              </th>
              <th className="py-4 px-6 text-left text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Quantity
              </th>
              <th className="py-4 px-6 text-left text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Total
              </th>
              {(canEdit || onViewNotes) && (
                <th className="py-4 px-6 text-right text-xs uppercase tracking-wider text-neutral-500 font-medium">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <tr
                key={sale.id}
                className={`hover:bg-orange-50/30 transition-colors ${
                  index !== sales.length - 1
                    ? "border-b border-orange-50/50"
                    : ""
                }`}
                onClick={() => onViewNotes && onViewNotes(sale)}
                style={{ cursor: onViewNotes ? "pointer" : "default" }}
              >
                <td className="py-4 px-6 text-neutral-700">
                  {format(new Date(sale.date), "PP")}
                </td>
                <td className="py-4 px-6 font-medium text-neutral-900">
                  {sale.dishName || "Unknown Dish"}
                </td>
                <td className="py-4 px-6 text-neutral-700">
                  <span className="inline-flex items-center justify-center bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-sm">
                    {sale.quantity}
                  </span>
                </td>
                <td className="py-4 px-6 font-medium text-orange-600">
                  {formatCurrency(sale.totalAmount)}
                </td>
                {(canEdit || onViewNotes) && (
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {onViewNotes && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewNotes(sale);
                          }}
                          className="p-2 text-neutral-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                          title="View Notes"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(sale);
                          }}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
