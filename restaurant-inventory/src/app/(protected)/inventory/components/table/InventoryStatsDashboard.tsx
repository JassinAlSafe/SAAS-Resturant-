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
        <Card className="flex items-center gap-4 p-4 border border-base-300 bg-base-100 shadow-sm">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Package size={20} />
          </div>
          <div>
            <div className="text-sm text-base-content/60">Total Items</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-base-content">{stats.totalItems}</div>
              <div className="text-xs text-base-content/40">
                {stats.categories} categories
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Inventory Value Card */}
      <motion.div variants={item}>
        <Card className="flex items-center gap-4 p-4 border border-base-300 bg-base-100 shadow-sm">
          <div className="p-2 rounded-md bg-success/10 text-success">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-sm text-base-content/60">Inventory Value</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-base-content">
                {formatCurrency(stats.totalValue)}
              </div>
              <div className="text-xs text-base-content/40">Total cost</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* In Stock Card */}
      <motion.div variants={item}>
        <Card className="flex items-center gap-4 p-4 border border-base-300 border-l-4 border-l-success bg-base-100 shadow-sm">
          <div className="p-2 rounded-md bg-success/10 text-success">
            <Check size={20} />
          </div>
          <div>
            <div className="text-sm text-base-content/60">In Stock</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-success">
                {stats.inStockItems}
              </div>
              <div className="text-xs text-success/70">
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
        <Card className="flex items-center gap-4 p-4 border border-base-300 border-l-4 border-l-warning bg-base-100 shadow-sm">
          <div className="p-2 rounded-md bg-warning/10 text-warning">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-sm text-base-content/60">Low Stock</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-warning">
                {stats.lowStockItems}
              </div>
              <div className="text-xs text-warning/70">
                {stats.totalItems > 0
                  ? Math.round((stats.lowStockItems / stats.totalItems) * 100)
                  : 0}
                % of inventory
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Out of Stock Card */}
      <motion.div variants={item}>
        <Card className="flex items-center gap-4 p-4 border border-base-300 border-l-4 border-l-error bg-base-100 shadow-sm">
          <div className="p-2 rounded-md bg-error/10 text-error">
            <Ban size={20} />
          </div>
          <div>
            <div className="text-sm text-base-content/60">Out of Stock</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-error">
                {stats.outOfStockItems}
              </div>
              <div className="text-xs text-error/70">
                {stats.totalItems > 0
                  ? Math.round((stats.outOfStockItems / stats.totalItems) * 100)
                  : 0}
                % of inventory
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
