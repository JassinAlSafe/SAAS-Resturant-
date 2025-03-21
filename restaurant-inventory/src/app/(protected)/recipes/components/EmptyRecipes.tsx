"use client";

import { Button } from "@/components/ui/button";
import { FiPlus, FiBook, FiUpload } from "react-icons/fi";
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
      className="flex flex-col items-center justify-center py-16 px-6 text-center border border-slate-200 dark:border-slate-800 shadow-sm rounded-lg bg-white dark:bg-slate-950"
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
        className="text-2xl font-semibold mb-3 text-slate-800 dark:text-slate-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Your Recipe Book is Empty
      </motion.h2>

      <motion.p
        className="text-slate-500 dark:text-slate-400 mb-8 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Start creating your restaurant&apos;s menu by adding recipes. Track ingredients, costs, and pricing to optimize your menu profitability.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          size="lg"
          onClick={onAddClick}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Create First Recipe
        </Button>
        {onImportClick && (
          <Button
            variant="outline"
            size="lg"
            onClick={onImportClick}
            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FiUpload className="mr-2 h-5 w-5" />
            Import Recipes
          </Button>
        )}
      </motion.div>

      <motion.div
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex flex-col items-center p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Track Ingredients</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Manage ingredients and their costs for accurate food cost calculations
          </p>
        </div>

        <div className="flex flex-col items-center p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Optimize Pricing</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Set optimal prices based on food costs to maximize profitability
          </p>
        </div>

        <div className="flex flex-col items-center p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-600 dark:text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Manage Menu</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Organize recipes by categories and track allergen information
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
