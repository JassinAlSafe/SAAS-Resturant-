"use client";

import { useMutation } from "@tanstack/react-query";
import { Supplier } from "@/lib/types";
import { exportToExcel, formatSuppliersForExport } from "@/lib/utils/export";
import { useNotificationHelpers } from "@/lib/notification-context";

export function useSupplierExport(suppliers: Supplier[]) {
  const { success, error } = useNotificationHelpers();

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!suppliers || suppliers.length === 0) {
        throw new Error("No suppliers to export");
      }

      const formattedData = formatSuppliersForExport(suppliers);
      return exportToExcel(formattedData, "Suppliers", "Supplier List");
    },
    onSuccess: () => {
      success("Export Complete", "Suppliers have been exported to Excel.");
    },
    onError: (err: Error) => {
      console.error("Error exporting suppliers:", err);
      error("Export Failed", err.message);
    },
  });

  return {
    handleExportSuppliers: exportMutation.mutate,
    isExporting: exportMutation.isPending,
  };
}
