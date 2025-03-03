"use client";

import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import { CurrencySelector } from "@/components/currency-selector";
import { FiPlus, FiRefreshCw } from "react-icons/fi";

interface ShoppingListActionsProps {
  onAddClick: () => void;
  onRefreshClick: () => void;
  onExportClick: () => void;
}

export default function ShoppingListActions({
  onAddClick,
  onRefreshClick,
  onExportClick,
}: ShoppingListActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CurrencySelector />

      <ExportButton
        onExport={onExportClick}
        label="Export Excel"
        tooltipText="Download shopping list as Excel file"
        variant="outline"
      />

      <Button variant="outline" size="sm" onClick={onRefreshClick}>
        <FiRefreshCw className="mr-2 h-4 w-4" />
        Refresh List
      </Button>

      <Button size="sm" onClick={onAddClick}>
        <FiPlus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
}
