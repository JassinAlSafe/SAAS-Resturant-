"use client";

import React from "react";
import { History, Eye, Trash } from "lucide-react";

interface SalesActionsProps {
  onViewHistory?: () => void;
  onShowInventory?: () => void;
  onClearAll?: () => void;
}

const SalesActions: React.FC<SalesActionsProps> = ({
  onViewHistory,
  onShowInventory,
  onClearAll,
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onShowInventory}
        className="text-sm font-medium text-neutral-600 hover:text-orange-600 transition-colors flex items-center gap-1.5"
      >
        <Eye className="h-4 w-4" />
        <span>Show Inventory</span>
      </button>

      <button
        onClick={onClearAll}
        className="text-sm font-medium text-neutral-600 hover:text-orange-600 transition-colors flex items-center gap-1.5"
      >
        <Trash className="h-4 w-4" />
        <span>Clear All</span>
      </button>

      <button
        onClick={onViewHistory}
        className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1.5"
      >
        <History className="h-4 w-4" />
        <span>View Analytics</span>
      </button>
    </div>
  );
};

export default SalesActions;
