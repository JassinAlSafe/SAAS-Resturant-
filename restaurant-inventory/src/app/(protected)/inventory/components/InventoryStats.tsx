"use client";

import { Card } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency";
import {
  FiPackage,
  FiAlertTriangle,
  FiAlertCircle,
  FiDollarSign,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
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
}

function StatCard({
  title,
  value,
  icon,
  description,
  color,
  showAlert = false,
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-800/30",
      ring: "group-hover:ring-blue-200 dark:group-hover:ring-blue-800/30",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-100 dark:border-green-800/30",
      ring: "group-hover:ring-green-200 dark:group-hover:ring-green-800/30",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-100 dark:border-yellow-800/30",
      ring: "group-hover:ring-yellow-200 dark:group-hover:ring-yellow-800/30",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-100 dark:border-red-800/30",
      ring: "group-hover:ring-red-200 dark:group-hover:ring-red-800/30",
    },
  };

  return (
    <Card
      className={cn(
        "p-5 border transition-all duration-200 group hover:shadow-md",
        showAlert && `border-l-4 ${colorClasses[color].border}`,
        "hover:ring-2 hover:ring-offset-1 dark:hover:ring-offset-gray-950",
        colorClasses[color].ring
      )}
    >
      <div className="flex items-center">
        <div
          className={cn(
            "p-3 rounded-full",
            colorClasses[color].bg,
            colorClasses[color].text
          )}
        >
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      {showAlert && (
        <div
          className={cn(
            "mt-3 h-1 rounded-full overflow-hidden",
            colorClasses[color].bg
          )}
        >
          <motion.div
            className={cn("h-full", colorClasses[color].text, "bg-current")}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      )}
    </Card>
  );
}
