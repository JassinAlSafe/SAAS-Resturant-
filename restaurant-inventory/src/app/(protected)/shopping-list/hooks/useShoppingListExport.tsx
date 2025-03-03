"use client";

import { useState } from "react";
import { ShoppingListItem } from "@/lib/services/shopping-list-service";
import { exportToExcel, formatShoppingListForExport } from "@/lib/utils/export";
import { useNotificationHelpers } from "@/lib/notification-context";

export function useShoppingListExport(shoppingList: ShoppingListItem[]) {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error } = useNotificationHelpers();

  const handleExportShoppingList = async (
    filteredItems: ShoppingListItem[] = shoppingList
  ) => {
    if (isExporting) return;

    try {
      setIsExporting(true);

      // Check if we have items to export
      if (!filteredItems || filteredItems.length === 0) {
        error("Nothing to Export", "Your shopping list is empty.");
        return;
      }

      // Format and export
      const formattedData = formatShoppingListForExport(filteredItems);
      exportToExcel(formattedData, "ShoppingList", "Shopping List");

      // Show success message
      success(
        "Export Complete",
        "Shopping list data has been exported to Excel."
      );
    } catch (err) {
      console.error("Error exporting shopping list:", err);
      error(
        "Export Failed",
        "There was an error exporting your shopping list."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExportShoppingList,
  };
}
