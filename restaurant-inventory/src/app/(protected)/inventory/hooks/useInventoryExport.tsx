import { useState } from "react";
import { InventoryItem } from "@/lib/types";
import { exportToExcel, formatInventoryForExport } from "@/lib/utils/export";
import { useNotificationHelpers } from "@/lib/notification-context";
import { inventoryService } from "@/lib/services/inventory-service";

export function useInventoryExport(items: InventoryItem[]) {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error: showError } = useNotificationHelpers();

  const handleExportInventory = async (
    format: "csv" | "excel" | "pdf",
    selectedItems?: InventoryItem[]
  ) => {
    try {
      setIsExporting(true);

      // Use selected items if provided, otherwise use all items
      let dataToExport = selectedItems || [...items];

      if (dataToExport.length === 0) {
        // If still no items, fetch fresh from API
        const freshItems = await inventoryService.getItems();
        dataToExport = freshItems;
      }

      // Format data for export
      const formattedData = formatInventoryForExport(dataToExport);

      // Export based on format
      switch (format) {
        case "excel":
          await exportToExcel(formattedData, "Inventory", "Inventory Items");
          success(
            "Export Complete",
            "Inventory data has been exported to Excel."
          );
          break;

        case "csv":
          // Convert to CSV and trigger download
          const csvContent = formattedData
            .map((row) => Object.values(row).join(","))
            .join("\n");
          const csvBlob = new Blob([csvContent], { type: "text/csv" });
          const csvUrl = window.URL.createObjectURL(csvBlob);
          const link = document.createElement("a");
          link.href = csvUrl;
          link.setAttribute("download", "inventory.csv");
          document.body.appendChild(link);
          link.click();
          link.remove();
          success(
            "Export Complete",
            "Inventory data has been exported to CSV."
          );
          break;

        case "pdf":
          // You would implement PDF generation here
          // This is a placeholder for PDF export functionality
          showError(
            "PDF Export",
            "PDF export is not yet implemented. Please use Excel or CSV format."
          );
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error("Error exporting inventory:", error);
      showError(
        "Export Failed",
        "There was an error exporting your inventory data."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return {
    handleExportInventory,
    isExporting,
  };
}
