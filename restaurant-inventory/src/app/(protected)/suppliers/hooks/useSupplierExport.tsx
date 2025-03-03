"use client";

import { useState } from "react";
import { Supplier } from "@/lib/types";
import { supplierService } from "@/lib/services/supplier-service";
import { exportToExcel, formatSuppliersForExport } from "@/lib/utils/export";
import { useNotificationHelpers } from "@/lib/notification-context";

export function useSupplierExport(suppliers: Supplier[]) {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error } = useNotificationHelpers();

  const handleExportSuppliers = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      // If we have suppliers in state, use those
      let dataToExport = suppliers;

      // If there are no suppliers or we need fresh data, fetch them
      if (!dataToExport || dataToExport.length === 0) {
        const freshData = await supplierService.getSuppliers();
        dataToExport = freshData;
      }

      if (dataToExport.length === 0) {
        error("Nothing to Export", "You don't have any suppliers to export.");
        return;
      }

      // Format and export the data
      const formattedData = formatSuppliersForExport(dataToExport);
      exportToExcel(formattedData, "Suppliers", "Supplier List");

      // Show success notification
      success("Export Complete", "Suppliers have been exported to Excel.");
    } catch (err) {
      console.error("Error exporting suppliers:", err);
      error("Export Failed", "There was an error exporting your suppliers.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExportSuppliers,
  };
}
