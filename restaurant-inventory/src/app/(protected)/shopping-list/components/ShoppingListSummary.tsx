"use client";

import { useCurrency } from "@/lib/currency-context";
import { ShoppingListItem } from "@/lib/services/shopping-list-service";

interface ShoppingListSummaryProps {
  items: ShoppingListItem[];
}

export default function ShoppingListSummary({
  items,
}: ShoppingListSummaryProps) {
  const { formatCurrency } = useCurrency();

  // Calculate total cost
  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

  // Count active items (not purchased)
  const activeItems = items.filter((item) => !item.isPurchased).length;

  // Count purchased items
  const purchasedItems = items.filter((item) => item.isPurchased).length;

  // Calculate percentage complete
  const totalItems = items.length;
  const percentComplete =
    totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
      <h3 className="font-medium text-lg text-gray-900 mb-4">
        Shopping List Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalCost)}
          </p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Items Remaining</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">{activeItems}</p>
            <span className="text-sm text-gray-500 ml-1">
              of {totalItems} total
            </span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Purchase Progress</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {purchasedItems} items purchased
              </span>
              <span className="text-sm font-bold text-gray-900">
                {percentComplete}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
