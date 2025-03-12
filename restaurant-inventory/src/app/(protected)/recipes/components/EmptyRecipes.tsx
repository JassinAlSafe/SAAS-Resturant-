"use client";

import { Button } from "@/components/ui/button";
import { FiPlus, FiBook, FiChevronsRight, FiUpload } from "react-icons/fi";
import { motion } from "framer-motion";

interface EmptyRecipesProps {
  onAddClick: () => void;
  onImportClick?: () => void;
}

export default function EmptyRecipes({
  onAddClick,
  onImportClick,
}: EmptyRecipesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center border border-gray-100 dark:border-gray-800 shadow-sm rounded-lg bg-white dark:bg-slate-950"
    >
      <motion.div
        className="bg-indigo-50 dark:bg-indigo-950/30 p-8 rounded-full mb-8 shadow-inner relative overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-100/0 via-indigo-100/50 to-indigo-100/0 dark:from-indigo-900/0 dark:via-indigo-900/20 dark:to-indigo-900/0"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 3,
            ease: "linear",
          }}
        />
        <FiBook className="h-14 w-14 text-indigo-600 dark:text-indigo-400" />
      </motion.div>

      <motion.h2
        className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Your Recipe Book is Empty
      </motion.h2>

      <motion.p
        className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-base leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Start by adding your restaurant's recipes. You'll be able to track
        ingredients, calculate costs, and manage your menu more efficiently.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={onAddClick}
          size="lg"
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Create Your First Recipe
        </Button>

        {onImportClick && (
          <Button
            onClick={onImportClick}
            size="lg"
            variant="outline"
            className="px-6 py-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-medium rounded-md shadow-sm"
          >
            <FiUpload className="mr-2 h-5 w-5" />
            Import Recipes
          </Button>
        )}
      </motion.div>

      <motion.div
        className="mt-8 flex items-center gap-2 text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ x: 5 }}
      >
        <span>Learn how to efficiently manage your recipes</span>
        <FiChevronsRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </motion.div>

      <motion.p
        className="mt-6 text-sm text-gray-400 dark:text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        You can also import recipes from a spreadsheet or other systems.
      </motion.p>
    </motion.div>
  );
}
