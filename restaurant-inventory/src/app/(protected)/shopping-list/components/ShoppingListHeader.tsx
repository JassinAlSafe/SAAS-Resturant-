"use client";

import { FiShoppingCart, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ShoppingListHeaderProps {
  error?: string;
  retry?: () => void;
  totalItems?: number;
}

export default function ShoppingListHeader({
  error,
  retry,
  totalItems,
}: ShoppingListHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div className="relative">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-100 dark:shadow-blue-900/20">
          <FiShoppingCart className="h-7 w-7 text-white" />
        </div>
        {totalItems !== undefined && (
          <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-semibold h-6 min-w-6 px-1.5 rounded-full border border-blue-100 dark:border-slate-700 shadow-sm flex items-center justify-center">
            {totalItems > 99 ? "99+" : totalItems}
          </div>
        )}
      </div>

      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Shopping List
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track items to purchase for your restaurant
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 sm:mt-0 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-sm"
        >
          <FiAlertCircle className="h-4 w-4" />
          <span>{error}</span>
          {retry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={retry}
              className="h-8 p-0 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <FiRefreshCw className="h-3.5 w-3.5 mr-1" />
              Retry
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
