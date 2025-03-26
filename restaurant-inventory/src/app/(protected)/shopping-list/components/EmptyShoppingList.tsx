"use client";

import { Plus, RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyShoppingListProps {
  onAddClick: () => void;
  onRefreshClick: () => void;
}

export default function EmptyShoppingList({
  onAddClick,
  onRefreshClick,
}: EmptyShoppingListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <div className="items-center text-center py-12 md:py-16 px-6">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative mb-8"
        >
          <div className="mb-2">
            <div className="bg-orange-50 text-orange-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <ShoppingBag className="h-12 w-12" />
            </div>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
            className="absolute -bottom-4 -right-4 bg-white shadow-md p-2 rounded-full"
          >
            <Plus className="h-5 w-5 text-orange-500" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold mb-3 text-black"
        >
          Your Shopping List is Empty
        </motion.h2>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed"
        >
          Keep track of everything you need to purchase for your inventory. Add
          items manually or automatically generate from low stock inventory.
        </motion.p>

        <div className="flex justify-center flex-wrap gap-4">
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddClick}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Item Manually
            <ArrowRight className="h-4 w-4" />
          </motion.button>

          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefreshClick}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Generate from Inventory
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-10 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center max-w-md mx-auto"
        >
          <span className="text-orange-500 font-medium">Pro Tip:</span>
          <span className="ml-2">
            Use the keyboard shortcut
            <span className="mx-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono">
              Alt
            </span>
            +
            <span className="mx-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono">
              N
            </span>
            to quickly add a new item
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
