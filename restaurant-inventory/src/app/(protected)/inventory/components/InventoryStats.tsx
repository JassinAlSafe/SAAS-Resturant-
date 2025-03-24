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
        className="h-full"
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
        className="h-full"
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
        className="h-full"
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
        className="h-full"
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
  // Map color to variant styles using DaisyUI classes
  const colorVariants = {
    blue: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      trendUp: "text-success",
      trendDown: "text-error",
      accentColor: "bg-primary",
      titleColor: "text-base-content/60",
      valueColor: "text-primary",
      alertBg: "bg-primary/10",
    },
    green: {
      iconBg: "bg-success/10",
      iconColor: "text-success",
      trendUp: "text-success",
      trendDown: "text-error",
      accentColor: "bg-success",
      titleColor: "text-base-content/60",
      valueColor: "text-success",
      alertBg: "bg-success/10",
    },
    yellow: {
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      trendUp: "text-success",
      trendDown: "text-warning",
      accentColor: "bg-warning",
      titleColor: "text-base-content/60",
      valueColor: "text-warning",
      alertBg: "bg-warning/10",
    },
    red: {
      iconBg: "bg-error/10",
      iconColor: "text-error",
      trendUp: "text-success",
      trendDown: "text-error",
      accentColor: "bg-error",
      titleColor: "text-base-content/60",
      valueColor: "text-error",
      alertBg: "bg-error/10",
    },
  };

  const styles = colorVariants[color];

  return (
    <div className="relative h-full overflow-hidden rounded-xl bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 group">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.accentColor}`}></div>
      
      <div className="p-5 h-full flex flex-col">
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
        <div className="space-y-1 flex-1">
          <p className={`text-sm font-medium ${styles.titleColor}`}>{title}</p>
          <p className={`text-2xl font-bold ${styles.valueColor} group-hover:scale-105 transition-transform duration-300`}>
            {value}
          </p>
          <p className="text-xs text-base-content/40 mt-1">{description}</p>
        </div>
        
        {showAlert && (
          <div className="mt-4 pt-3 border-t border-base-300">
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
          <div className="absolute inset-0 bg-base-200 opacity-0 group-hover:opacity-30 transition-opacity"></div>
          <div className="absolute inset-[-100%] top-0 bg-gradient-to-r from-transparent via-base-100/50 to-transparent transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
  );
}
