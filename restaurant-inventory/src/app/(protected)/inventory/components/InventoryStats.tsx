"use client";

import { Card } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency-context";
import {
  FiPackage,
  FiAlertTriangle,
  FiAlertCircle,
  FiDollarSign,
} from "react-icons/fi";

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Items"
        value={totalItems.toString()}
        icon={<FiPackage className="h-5 w-5" />}
        description="Items in inventory"
        color="blue"
      />

      <StatCard
        title="Low Stock"
        value={lowStockItems.toString()}
        icon={<FiAlertTriangle className="h-5 w-5" />}
        description={`${Math.round(
          (lowStockItems / totalItems) * 100
        )}% of inventory`}
        color="yellow"
      />

      <StatCard
        title="Out of Stock"
        value={outOfStockItems.toString()}
        icon={<FiAlertCircle className="h-5 w-5" />}
        description={`${Math.round(
          (outOfStockItems / totalItems) * 100
        )}% of inventory`}
        color="red"
      />

      <StatCard
        title="Total Value"
        value={formatCurrency(totalValue)}
        icon={<FiDollarSign className="h-5 w-5" />}
        description="Inventory value"
        color="green"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "yellow" | "red";
}

function StatCard({ title, value, icon, description, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    yellow:
      "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </Card>
  );
}
