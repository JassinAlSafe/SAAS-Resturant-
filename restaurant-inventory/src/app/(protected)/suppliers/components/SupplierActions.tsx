"use client";

import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import { FiPlus, FiDownload } from "react-icons/fi";

interface SupplierActionsProps {
  onAddClick: () => void;
  onExportClick: () => void;
}

export default function SupplierActions({
  onAddClick,
  onExportClick,
}: SupplierActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        size="sm"
        variant="outline"
        onClick={onExportClick}
        className="border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        <FiDownload className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button
        size="sm"
        onClick={onAddClick}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <FiPlus className="mr-2 h-4 w-4" />
        Add Supplier
      </Button>
    </div>
  );
}
