"use client";

import { useCurrency } from "@/lib/currency-context";
import { ShoppingListItem } from "@/lib/services/shopping-list-service";
import { Progress } from "@/components/ui/progress";
import { FiShoppingBag, FiTrendingUp } from "react-icons/fi";
import { LuCoins } from "react-icons/lu";

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
    <div>
      <h3 className="text-lg font-medium mb-4">Shopping List Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary/5 border border-primary/10 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <LuCoins className="h-4 w-4" />
            <p className="text-sm font-medium">Total Cost (SEK)</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
        </div>

        <div className="bg-blue-50/50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2 text-blue-700">
            <FiShoppingBag className="h-4 w-4" />
            <p className="text-sm font-medium">Items Remaining</p>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold">{activeItems}</p>
            <span className="text-sm text-muted-foreground ml-1">
              of {totalItems} total
            </span>
          </div>
        </div>

        <div className="bg-green-50/50 border border-green-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2 text-green-700">
            <FiTrendingUp className="h-4 w-4" />
            <p className="text-sm font-medium">Purchase Progress</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {purchasedItems} items purchased
              </span>
              <span className="text-sm font-bold">{percentComplete}%</span>
            </div>
            <Progress value={percentComplete} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
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
