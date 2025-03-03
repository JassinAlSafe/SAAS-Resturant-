"use client";

import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import { FiPlus } from "react-icons/fi";

interface SupplierActionsProps {
  onAddClick: () => void;
  onExportClick: () => void;
}

export default function SupplierActions({
  onAddClick,
  onExportClick,
}: SupplierActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ExportButton
        onExport={onExportClick}
        label="Export Excel"
        tooltipText="Download suppliers as Excel file"
        variant="outline"
      />
      <Button size="sm" onClick={onAddClick}>
        <FiPlus className="mr-2" />
        Add Supplier
      </Button>
    </div>
  );
}
