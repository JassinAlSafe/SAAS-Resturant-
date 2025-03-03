"use client";

import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";
import { ExportButton } from "@/components/ui/export-button";
import { CurrencySelector } from "@/components/currency-selector";

interface InventoryActionsProps {
  onAddClick: () => void;
  onExportClick: () => void;
}

export default function InventoryActions({
  onAddClick,
  onExportClick,
}: InventoryActionsProps) {
  return (
    <div className="flex items-center gap-2 mt-4 md:mt-0">
      <CurrencySelector />

      <ExportButton
        onExport={onExportClick}
        label="Export Excel"
        tooltipText="Download inventory as Excel file"
        variant="outline"
      />

      <Button className="mt-0" size="sm" onClick={onAddClick}>
        <FiPlus className="mr-2" />
        Add Item
      </Button>
    </div>
  );
}
