"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, Star, Building, ShoppingCart, UserCheck } from "lucide-react";
import { Supplier } from "@/lib/types";

interface SupplierStatsProps {
  stats: {
    totalSuppliers: number;
    activeSuppliers: number;
    inactiveSuppliers: number;
    preferredSuppliers: number;
    categoriesCount: number;
    lastOrderDays: number;
  };
  isLoading?: boolean;
}

export function SupplierStatsDashboard({
  stats,
  isLoading = false,
}: SupplierStatsProps) {
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

  // If we're still loading data, show skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, index) => (
          <Card
            key={index}
            className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-pulse"
          >
            <div className="w-10 h-10 rounded-md bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex-1">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    >
      {/* Total Suppliers Card */}
      <motion.div
        variants={item}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="flex items-center gap-4 p-4 min-h-[100px] w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md transition-all duration-200">
          <div className="p-2 rounded-md bg-blue-50 text-blue-600">
            <Users size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-500 truncate">
              Total Suppliers
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold">
                {stats.totalSuppliers}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {stats.categoriesCount} categories
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Preferred Suppliers Card */}
      <motion.div
        variants={item}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="flex items-center gap-4 p-4 min-h-[100px] w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md transition-all duration-200">
          <div className="p-2 rounded-md bg-yellow-50 text-yellow-600">
            <Star size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-500 truncate">
              Preferred Suppliers
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold">
                {stats.preferredSuppliers}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {stats.totalSuppliers > 0
                  ? Math.round(
                      (stats.preferredSuppliers / stats.totalSuppliers) * 100
                    )
                  : 0}
                % preferred
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Active Suppliers Card */}
      <motion.div
        variants={item}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="flex items-center gap-4 p-4 min-h-[100px] w-full border border-slate-200 border-l-4 border-l-green-500 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md hover:border-l-green-600 transition-all duration-200">
          <div className="p-2 rounded-md bg-green-50 text-green-600">
            <UserCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-500 truncate">
              Active Suppliers
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-green-600">
                {stats.activeSuppliers}
              </div>
              <div className="text-xs text-green-500 truncate">
                {stats.totalSuppliers > 0
                  ? Math.round(
                      (stats.activeSuppliers / stats.totalSuppliers) * 100
                    )
                  : 0}
                % active
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Inactive Suppliers Card */}
      <motion.div
        variants={item}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="flex items-center gap-4 p-4 min-h-[100px] w-full border border-slate-200 border-l-4 border-l-amber-500 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md hover:border-l-amber-600 transition-all duration-200">
          <div className="p-2 rounded-md bg-amber-50 text-amber-600">
            <Building size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-500 truncate">
              Inactive Suppliers
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-amber-600">
                {stats.inactiveSuppliers}
              </div>
              <div className="text-xs text-amber-500 truncate">
                {stats.totalSuppliers > 0
                  ? Math.round(
                      (stats.inactiveSuppliers / stats.totalSuppliers) * 100
                    )
                  : 0}
                % inactive
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Last Order Card */}
      <motion.div
        variants={item}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="flex items-center gap-4 p-4 min-h-[100px] w-full border border-slate-200 border-l-4 border-l-purple-500 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md hover:border-l-purple-600 transition-all duration-200">
          <div className="p-2 rounded-md bg-purple-50 text-purple-600">
            <ShoppingCart size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-500 truncate">
              Average Order Time
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-purple-600">
                {stats.lastOrderDays || "N/A"}
              </div>
              <div className="text-xs text-purple-500 truncate">
                {stats.lastOrderDays ? "days ago" : "No data"}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
