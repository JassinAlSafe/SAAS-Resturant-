"use client";

import { useCurrency } from "@/lib/currency-context";
import { ShoppingListItem } from "@/lib/services/shopping-list-service";
import Card from "@/components/Card";

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
    <Card className="mb-6">
      <div className="p-4">
        <h3 className="font-medium text-lg mb-4">Shopping List Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Items Remaining</p>
            <p className="text-2xl font-bold">
              {activeItems}{" "}
              <span className="text-sm font-normal">of {totalItems}</span>
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Progress</p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
              <span className="text-sm font-medium">{percentComplete}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
