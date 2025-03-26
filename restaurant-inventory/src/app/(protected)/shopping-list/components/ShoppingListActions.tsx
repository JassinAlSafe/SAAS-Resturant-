"use client";

import { Plus, RefreshCw, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onExportClick}
        className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGenerateClick}
        disabled={isGenerating}
        className="px-3 py-2 text-sm rounded-md border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
      >
        {isGenerating ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4"
            >
              <Loader2 className="h-4 w-4" />
            </motion.span>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span>Generate List</span>
          </>
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddClick}
        className="px-3 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        <span>Add Item</span>
      </motion.button>
    </div>
  );
}
