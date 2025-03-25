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
          color="orange"
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
  color: "blue" | "green" | "yellow" | "red" | "orange";
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
  // Map color to variant styles using modern color palette
  const colorVariants = {
    orange: {
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trendUp: "text-green-600",
      trendDown: "text-red-600",
      accentColor: "bg-gradient-to-r from-orange-500 to-orange-600",
      titleColor: "text-gray-500",
      valueColor: "text-orange-600",
      alertBg: "bg-orange-50",
    },
    blue: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trendUp: "text-green-600",
      trendDown: "text-red-600",
      accentColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      titleColor: "text-gray-500",
      valueColor: "text-blue-600",
      alertBg: "bg-blue-50",
    },
    green: {
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trendUp: "text-green-600",
      trendDown: "text-red-600",
      accentColor: "bg-gradient-to-r from-green-500 to-green-600",
      titleColor: "text-gray-500",
      valueColor: "text-green-600",
      alertBg: "bg-green-50",
    },
    yellow: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      trendUp: "text-green-600",
      trendDown: "text-amber-600",
      accentColor: "bg-gradient-to-r from-amber-500 to-amber-600",
      titleColor: "text-gray-500",
      valueColor: "text-amber-600",
      alertBg: "bg-amber-50",
    },
    red: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      trendUp: "text-green-600",
      trendDown: "text-red-600",
      accentColor: "bg-gradient-to-r from-red-500 to-red-600",
      titleColor: "text-gray-500",
      valueColor: "text-red-600",
      alertBg: "bg-red-50",
    },
  };

  const styles = colorVariants[color];

  return (
    <div className="relative h-full overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.accentColor}`}></div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-sm font-medium ${styles.titleColor} mb-1`}>{title}</h3>
            <p className={`text-2xl font-bold ${styles.valueColor}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${styles.iconBg} shadow-sm`}>
            <div className={styles.iconColor}>{icon}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{description}</p>
          
          {trend && (
            <div className="flex items-center">
              <span className={`text-xs font-medium ${
                trend.isPositive ? styles.trendUp : styles.trendDown
              }`}>
                {trend.value > 0 ? `${trend.value}%` : ''}
              </span>
              {trend.value > 0 && (
                trend.isPositive ? (
                  <FiTrendingUp className={`ml-1 h-3 w-3 ${styles.trendUp}`} />
                ) : (
                  <FiTrendingDown className={`ml-1 h-3 w-3 ${styles.trendDown}`} />
                )
              )}
            </div>
          )}
        </div>

        {/* Alert indicator */}
        {showAlert && (
          <div className={`mt-3 py-1.5 px-2.5 rounded-md ${styles.alertBg} flex items-center text-xs border border-${color}-200`}>
            <FiAlertTriangle className={`h-3.5 w-3.5 mr-1.5 ${styles.iconColor}`} />
            <span className={`${styles.iconColor} font-medium`}>Requires attention</span>
          </div>
        )}
      </div>
    </div>
  );
}
