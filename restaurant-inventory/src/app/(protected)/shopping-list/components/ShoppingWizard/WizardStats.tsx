"use client";

import { ShoppingListItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { AlertTriangle, BellRing, BarChart3, Wallet } from "lucide-react";

interface WizardStatsProps {
  shoppingList: ShoppingListItem[];
  totalEstimatedCost: number;
  currentStep: string;
}

export default function WizardStats({
  shoppingList,
  totalEstimatedCost,
  currentStep,
}: WizardStatsProps) {
  const { formatCurrency } = useCurrency();

  // Calculate stats
  const pendingItems = shoppingList.filter((item) => !item.isPurchased);
  const purchasedItems = shoppingList.filter((item) => item.isPurchased);
  const urgentCount = shoppingList.filter((item) => item.isUrgent).length;
  const completionPercentage =
    shoppingList.length > 0
      ? Math.round((purchasedItems.length / shoppingList.length) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2 mb-6">
      <div className="stat bg-base-100 rounded-box shadow-sm">
        <div className="stat-figure text-primary">
          <BarChart3 className="h-8 w-8" />
        </div>
        <div className="stat-title text-xs">Progress</div>
        <div className="stat-value text-lg">{completionPercentage}%</div>
        <div className="stat-desc text-xs">
          {purchasedItems.length} of {shoppingList.length} items
        </div>
      </div>

      <div className="stat bg-base-100 rounded-box shadow-sm">
        <div className="stat-figure text-warning">
          <BellRing className="h-8 w-8" />
        </div>
        <div className="stat-title text-xs">Urgent Items</div>
        <div className="stat-value text-lg">{urgentCount}</div>
        <div className="stat-desc text-xs">
          {urgentCount > 0 ? "Prioritize these items" : "No urgent items"}
        </div>
      </div>

      <div className="stat bg-base-100 rounded-box shadow-sm">
        <div className="stat-figure text-info">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="stat-title text-xs">Remaining</div>
        <div className="stat-value text-lg">{pendingItems.length}</div>
        <div className="stat-desc text-xs">
          {pendingItems.length > 0
            ? "Items still to purchase"
            : "All items purchased"}
        </div>
      </div>

      <div className="stat bg-base-100 rounded-box shadow-sm">
        <div className="stat-figure text-success">
          <Wallet className="h-8 w-8" />
        </div>
        <div className="stat-title text-xs">Estimated Cost</div>
        <div className="stat-value text-lg">
          {formatCurrency(totalEstimatedCost)}
        </div>
        <div className="stat-desc text-xs">
          {currentStep === "complete" ? "Final cost" : "Approximate total"}
        </div>
      </div>
    </div>
  );
}
