"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { DollarSign, Package, AlertTriangle, Ban, Check } from "lucide-react";

interface InventoryStatsProps {
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    inStockItems: number;
    categories: number;
    selectedItemsCount: number;
    selectedItemsValue: number;
  };
  formatCurrency: (value: number) => string;
}

export function InventoryStatsDashboard({
  stats,
  formatCurrency,
}: InventoryStatsProps) {
  // Animation variants for staggered card animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    >
      {/* Total Items Card */}
      <motion.div variants={item}>
        <Card className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="p-2 rounded-md bg-blue-50 text-blue-600">
            <Package size={20} />
          </div>
          <div>
            <div className="text-sm text-slate-500">Total Items</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold">{stats.totalItems}</div>
              <div className="text-xs text-slate-400">
                {stats.categories} categories
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Inventory Value Card */}
      <motion.div variants={item}>
        <Card className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="p-2 rounded-md bg-green-50 text-green-600">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-sm text-slate-500">Inventory Value</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold">
                {formatCurrency(stats.totalValue)}
              </div>
              <div className="text-xs text-slate-400">Total cost</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* In Stock Card */}
      <motion.div variants={item}>
        <Card className="flex items-center gap-4 p-4 border border-slate-200 border-l-4 border-l-green-500 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="p-2 rounded-md bg-green-50 text-green-600">
            <Check size={20} />
          </div>
          <div>
            <div className="text-sm text-slate-500">In Stock</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-green-600">
                {stats.inStockItems}
              </div>
              <div className="text-xs text-green-500">
                {stats.totalItems > 0
                  ? Math.round((stats.inStockItems / stats.totalItems) * 100)
                  : 0}
                % of inventory
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Low Stock Card */}
      <motion.div variants={item}>
        <Card className="flex items-center gap-4 p-4 border border-slate-200 border-l-4 border-l-amber-500 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="p-2 rounded-md bg-amber-50 text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-sm text-slate-500">Low Stock</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-amber-600">
                {stats.lowStockItems}
              </div>
              <div className="text-xs text-amber-500">
                {stats.totalItems > 0
                  ? Math.round((stats.lowStockItems / stats.totalItems) * 100)
                  : 0}
                % needs reordering
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Out of Stock Card */}
      <motion.div variants={item}>
        <Card className="flex items-center gap-4 p-4 border border-slate-200 border-l-4 border-l-red-500 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="p-2 rounded-md bg-red-50 text-red-600">
            <Ban size={20} />
          </div>
          <div>
            <div className="text-sm text-slate-500">Out of Stock</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-red-600">
                {stats.outOfStockItems}
              </div>
              <div className="text-xs text-red-500">
                {stats.totalItems > 0
                  ? Math.round((stats.outOfStockItems / stats.totalItems) * 100)
                  : 0}
                % depleted
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
