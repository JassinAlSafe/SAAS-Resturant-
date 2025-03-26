"use client";

import { Sale } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { salesService } from "@/lib/services/sales-service";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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
      <div className="text-center py-16">
        <p className="text-neutral-500">
          No sales found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100">
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider text-neutral-500 font-medium bg-white">
              Date
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider text-neutral-500 font-medium bg-white">
              Dish
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider text-neutral-500 font-medium bg-white">
              Quantity
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider text-neutral-500 font-medium bg-white">
              Total
            </th>
            {canEdit && (
              <th className="py-4 px-6 text-right text-xs uppercase tracking-wider text-neutral-500 font-medium bg-white">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, index) => (
            <tr
              key={sale.id}
              className={`hover:bg-orange-50/20 cursor-pointer transition-colors ${
                index !== sales.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              <td className="py-4 px-6 text-neutral-700">
                {format(new Date(sale.date), "PP")}
              </td>
              <td className="py-4 px-6 font-medium text-neutral-900">
                {sale.dishName || "Unknown Dish"}
              </td>
              <td className="py-4 px-6 text-neutral-700">{sale.quantity}</td>
              <td className="py-4 px-6 font-medium text-orange-600">
                {formatCurrency(sale.totalAmount)}
              </td>
              {canEdit && (
                <td className="py-4 px-6 text-right">
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
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
