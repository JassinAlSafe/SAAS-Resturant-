import { useState } from "react";
import { InventoryItem } from "@/lib/types";
import { exportToExcel, formatInventoryForExport } from "@/lib/utils/export";
import { useNotificationHelpers } from "@/lib/notification-context";
import { inventoryService } from "@/lib/services/inventory-service";

export function useInventoryExport(items: InventoryItem[]) {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error: showError } = useNotificationHelpers();

  const handleExportInventory = async () => {
    try {
      setIsExporting(true);

      // If no items are available, fetch all items for export
      let dataToExport = [...items];

      if (dataToExport.length === 0) {
        // If still no items, fetch fresh from API
        const freshItems = await inventoryService.getItems();
        dataToExport = freshItems;
      }

      // Format and export
      const formattedData = formatInventoryForExport(dataToExport);
      exportToExcel(formattedData, "Inventory", "Inventory Items");

      // Show success notification
      success("Export Complete", "Inventory data has been exported to Excel.");
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
