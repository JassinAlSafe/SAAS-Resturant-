"use client";

import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 sm:mt-0">
      <Button
        variant="outline"
        onClick={onExportClick}
        className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-xs h-11"
      >
        <FiDownload className="mr-2 h-4 w-4" />
        <span>Export</span>
      </Button>
      <Button
        onClick={onAddClick}
        className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md h-11 transition-all duration-200"
      >
        <FiPlus className="mr-2 h-4 w-4" />
        <span>Add Supplier</span>
      </Button>
    </div>
  );
}
