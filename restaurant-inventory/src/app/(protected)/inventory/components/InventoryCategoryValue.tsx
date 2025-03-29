import React, { useState } from "react";
import { ChevronDown, ChevronRight, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency";
import { useInventoryQuery } from "@/hooks/useInventoryQuery";

export function InventoryCategoryValue() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { formatCurrency } = useCurrency();
  const { items, isLoading } = useInventoryQuery();

  // Group items by category and calculate total value per category
  const categoryValues = React.useMemo(() => {
    const categoryMap: Record<
      string,
      { totalValue: number; itemCount: number }
    > = {};

    items.forEach((item) => {
      const category = item.category || "Uncategorized";
      const itemValue = item.quantity * (item.cost_per_unit || 0);

      if (!categoryMap[category]) {
        categoryMap[category] = { totalValue: 0, itemCount: 0 };
      }

      categoryMap[category].totalValue += itemValue;
      categoryMap[category].itemCount += 1;
    });

    // Convert to array and sort by value (descending)
    return Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        ...data,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [items]);

  // Calculate total inventory value
  const totalInventoryValue = React.useMemo(() => {
    return categoryValues.reduce(
      (total, category) => total + category.totalValue,
      0
    );
  }, [categoryValues]);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Inventory Value by Category
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Loading inventory values...
          </p>
        </CardHeader>
      </Card>
    );
  }

  if (categoryValues.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Inventory Value by Category
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Total inventory value: {formatCurrency(totalInventoryValue)}
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-2">
            {categoryValues.map(({ category, totalValue, itemCount }) => (
              <div
                key={category}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <span className="font-medium">{category}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({itemCount} item{itemCount !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(totalValue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((totalValue / totalInventoryValue) * 100)}% of
                    total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
