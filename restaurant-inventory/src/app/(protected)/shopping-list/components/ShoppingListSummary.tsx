// ShoppingListSummary.tsx
"use client";

import { useCurrency } from "@/lib/currency";
import { ShoppingListItem } from "@/lib/types";
import { motion } from "framer-motion";
import { ShoppingCart, DollarSign, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShoppingListSummaryProps {
  items: ShoppingListItem[];
}

export default function ShoppingListSummary({
  items,
}: ShoppingListSummaryProps) {
  const { formatCurrency, currencySymbol } = useCurrency();

  const totalItems = items.length;
  const purchasedItems = items.filter((item) => item.purchased).length;
  const urgentItems = items.filter((item) => item.isUrgent).length;
  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

  const purchaseProgress =
    totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

  const summaryItems = [
    {
      title: "Total Items",
      value: totalItems.toString(),
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Purchased",
      value: purchasedItems.toString(),
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Urgent Items",
      value: urgentItems.toString(),
      icon: Clock,
      color: "text-error",
      bgColor: "bg-error/10",
    },
    {
      title: "Estimated Cost",
      value: formatCurrency(totalCost),
      icon: DollarSign,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="card-title">Shopping List Summary</h3>

      <div className="stats stats-vertical shadow w-full">
        {summaryItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="stat"
            >
              <div className="stat-figure">
                <div className={cn("p-2 rounded-full", item.bgColor)}>
                  <Icon className={cn("h-5 w-5", item.color)} />
                </div>
              </div>
              <div className="stat-title">{item.title}</div>
              <div className={cn("stat-value text-xl", item.color)}>
                {item.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-70">Purchase Progress</span>
          <span className="text-sm font-medium">
            {Math.round(purchaseProgress)}%
          </span>
        </div>
        <progress
          className={cn(
            "progress w-full",
            purchaseProgress === 100 ? "progress-success" : "progress-primary"
          )}
          value={purchaseProgress}
          max="100"
        ></progress>
      </div>

      {totalItems > 0 && (
        <div className="pt-4 border-t">
          <div className="text-sm opacity-70">
            <p>
              {purchasedItems} of {totalItems} items purchased
            </p>
            <p className="mt-1">
              {totalItems - purchasedItems > 0
                ? `${totalItems - purchasedItems} items remaining`
                : "All items purchased!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
