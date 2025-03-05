"use client";

import { Button } from "@/components/ui/button";
import { FiPlus, FiRefreshCw, FiDownload } from "react-icons/fi";

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
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onExportClick}
        className="border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        <FiDownload className="mr-2 h-4 w-4" />
        Export Excel
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefreshClick}
        className="border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        <FiRefreshCw className="mr-2 h-4 w-4" />
        Refresh Items
      </Button>

      <Button
        size="sm"
        onClick={onAddClick}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <FiPlus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
}
