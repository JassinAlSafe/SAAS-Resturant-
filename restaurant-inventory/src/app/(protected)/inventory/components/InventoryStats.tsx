"use client";

import { useCurrency } from "@/lib/currency";
import {
  FiPackage,
  FiAlertTriangle,
  FiAlertCircle,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface InventoryStatsProps {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
}

export function InventoryStats({
  totalItems,
  lowStockItems,
  outOfStockItems,
  totalValue,
}: InventoryStatsProps) {
  const { formatCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  // Handle hydration issues by using client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate percentages safely to avoid NaN
  const lowStockPercentage =
    totalItems > 0 ? Math.round((lowStockItems / totalItems) * 100) : 0;

  const outOfStockPercentage =
    totalItems > 0 ? Math.round((outOfStockItems / totalItems) * 100) : 0;

  // Format the total value on the client side only
  const formattedTotalValue = mounted ? formatCurrency(totalValue) : "...";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <StatCard
          title="Total Items"
          value={totalItems.toString()}
          icon={<FiPackage className="h-5 w-5" />}
          description="Items in inventory"
          color="blue"
          trend={{
            value: 0,
            isPositive: true
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <StatCard
          title="Low Stock"
          value={lowStockItems.toString()}
          icon={<FiAlertTriangle className="h-5 w-5" />}
          description={`${lowStockPercentage}% of inventory`}
          color="yellow"
          showAlert={lowStockItems > 0}
          trend={{
            value: lowStockPercentage,
            isPositive: false
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <StatCard
          title="Out of Stock"
          value={outOfStockItems.toString()}
          icon={<FiAlertCircle className="h-5 w-5" />}
          description={`${outOfStockPercentage}% of inventory`}
          color="red"
          showAlert={outOfStockItems > 0}
          trend={{
            value: outOfStockPercentage,
            isPositive: false
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <StatCard
          title="Total Value"
          value={formattedTotalValue}
          icon={<FiDollarSign className="h-5 w-5" />}
          description="Inventory value"
          color="green"
          trend={{
            value: 0,
            isPositive: true
          }}
        />
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "yellow" | "red";
  showAlert?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({
  title,
  value,
  icon,
  description,
  color,
  showAlert = false,
  trend,
}: StatCardProps) {
  // Map color to variant styles similar to the dashboard StatCard
  const colorVariants = {
    blue: {
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      trendUp: "text-emerald-600 dark:text-emerald-400",
      trendDown: "text-rose-600 dark:text-rose-400",
      accentColor: "bg-blue-500 dark:bg-blue-600",
      titleColor: "text-slate-600 dark:text-slate-400",
      valueColor: "text-blue-700 dark:text-blue-300",
      alertBg: "bg-blue-50 dark:bg-blue-900/20",
    },
    green: {
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      trendUp: "text-emerald-600 dark:text-emerald-400",
      trendDown: "text-rose-600 dark:text-rose-400",
      accentColor: "bg-emerald-500 dark:bg-emerald-600",
      titleColor: "text-slate-600 dark:text-slate-400",
      valueColor: "text-emerald-700 dark:text-emerald-300",
      alertBg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    yellow: {
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      trendUp: "text-emerald-600 dark:text-emerald-400",
      trendDown: "text-amber-600 dark:text-amber-400",
      accentColor: "bg-amber-500 dark:bg-amber-600",
      titleColor: "text-slate-600 dark:text-slate-400",
      valueColor: "text-amber-700 dark:text-amber-300",
      alertBg: "bg-amber-50 dark:bg-amber-900/20",
    },
    red: {
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      trendUp: "text-emerald-600 dark:text-emerald-400",
      trendDown: "text-red-600 dark:text-red-400",
      accentColor: "bg-red-500 dark:bg-red-600",
      titleColor: "text-slate-600 dark:text-slate-400",
      valueColor: "text-red-700 dark:text-red-300",
      alertBg: "bg-red-50 dark:bg-red-900/20",
    },
  };

  const styles = colorVariants[color];

  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-950 shadow-md hover:shadow-lg transition-all duration-300 group">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.accentColor}`}></div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className={`${styles.iconBg} ${styles.iconColor} p-3 rounded-full transition-transform group-hover:scale-110 duration-300`}>
            {icon}
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm font-medium ${
                trend.isPositive ? styles.trendUp : styles.trendDown
              }`}
            >
              {trend.isPositive ? (
                <FiTrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <FiTrendingDown className="mr-1 h-4 w-4" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className={`text-sm font-medium ${styles.titleColor}`}>{title}</p>
          <p className={`text-2xl font-bold ${styles.valueColor} group-hover:scale-105 transition-transform duration-300`}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        
        {showAlert && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className={`mt-1 h-1.5 rounded-full overflow-hidden ${styles.alertBg}`}>
              <motion.div
                className={`h-full ${styles.accentColor}`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
        
        {/* Hover effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 opacity-0 group-hover:opacity-30 transition-opacity"></div>
          <div className="absolute inset-[-100%] top-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
  );
}
