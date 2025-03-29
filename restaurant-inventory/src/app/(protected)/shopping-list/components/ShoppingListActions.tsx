"use client";

import { Plus, RefreshCw, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShoppingListActionsProps {
  onAddClick: () => void;
  onGenerateClick: () => void;
  onExportClick: () => void;
  isGenerating?: boolean;
}

export default function ShoppingListActions({
  onAddClick,
  onGenerateClick,
  onExportClick,
  isGenerating = false,
}: ShoppingListActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onExportClick}
        className="flex items-center justify-center gap-2 h-10 px-4 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
      >
        <Download className="h-5 w-5" />
        <span>Export</span>
      </button>

      <button
        onClick={onGenerateClick}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 h-10 px-4 border border-blue-200 rounded-lg text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-70"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-5 w-5" />
            <span>Generate List</span>
          </>
        )}
      </button>

      <button
        onClick={onAddClick}
        className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-white bg-orange-500 hover:bg-orange-600"
      >
        <Plus className="h-5 w-5" />
        <span>Add Item</span>
      </button>
    </div>
  );
}
