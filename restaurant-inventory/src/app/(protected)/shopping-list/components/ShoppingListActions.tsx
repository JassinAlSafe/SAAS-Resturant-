"use client";

import { Plus, RefreshCw, Download, Loader2 } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={onExportClick} className="btn btn-outline btn-sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>

      <button
        onClick={onGenerateClick}
        disabled={isGenerating}
        className="btn btn-outline btn-sm btn-secondary"
      >
        {isGenerating ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate List
          </>
        )}
      </button>

      <button onClick={onAddClick} className="btn btn-primary btn-sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </button>
    </div>
  );
}
