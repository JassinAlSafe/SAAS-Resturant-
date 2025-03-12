"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangleIcon,
  InfoIcon,
  ShoppingCartIcon,
  ArrowDownIcon,
  CircleOffIcon,
} from "lucide-react";
import { InventoryImpactItem } from "../types";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";

interface InventoryImpactSectionProps {
  salesEntries: { [key: string]: number };
  calculateInventoryImpact: (
    dishId: string,
    quantity: number
  ) => InventoryImpactItem[];
}

interface InventoryItem {
  id: string;
  name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

const InventoryImpactSection: React.FC<InventoryImpactSectionProps> = ({
  salesEntries,
  calculateInventoryImpact,
}) => {
  const [showLowStock, setShowLowStock] = useState(true);
  const [inventoryLevels, setInventoryLevels] = useState<
    Record<string, InventoryItem>
  >({});
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate all impacts
  const impacts = Object.entries(salesEntries)
    .filter(([, quantity]) => quantity > 0)
    .flatMap(([dishId, quantity]) =>
      calculateInventoryImpact(dishId, quantity)
    );

  // Group by ingredient ID and sum quantities
  const groupedImpacts = impacts.reduce<Record<string, InventoryImpactItem>>(
    (acc, impact) => {
      const { ingredientId } = impact;
      if (!acc[ingredientId]) {
        acc[ingredientId] = { ...impact };
      } else {
        acc[ingredientId].quantityUsed += impact.quantityUsed;
      }
      return acc;
    },
    {}
  );

  // Fetch inventory levels
  useEffect(() => {
    const ingredientIds = Object.keys(groupedImpacts);

    if (ingredientIds.length === 0) return;

    const fetchInventoryLevels = async () => {
      setIsLoadingInventory(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("User not authenticated");
          return;
        }

        const { data, error } = await supabase
          .from("ingredients")
          .select("id, name, current_stock, minimum_stock, unit")
          .in("id", ingredientIds)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching inventory levels:", error);
          setError("Failed to fetch inventory levels");
          return;
        }

        // Create a map for easier access
        const inventoryMap = data.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {});

        setInventoryLevels(inventoryMap);
      } catch (err) {
        console.error("Exception in fetchInventoryLevels:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoadingInventory(false);
      }
    };

    fetchInventoryLevels();
  }, [Object.keys(groupedImpacts).join(",")]);

  // No impacts to show
  if (Object.keys(groupedImpacts).length === 0) {
    return (
      <div className="mb-6 p-6 border rounded-md bg-muted/10 text-center">
        <CircleOffIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <h4 className="font-medium text-muted-foreground">
          No Inventory Impact
        </h4>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Add quantities to dishes to see inventory impact
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 border rounded-md bg-muted/10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">Inventory Impact</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md p-4">
                <p>
                  This shows how your sales will affect your inventory levels.
                  Ingredients that will fall below your minimum stock levels are
                  highlighted.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={showLowStock ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLowStock(!showLowStock)}
            className="text-xs h-8 px-3 flex items-center gap-1.5"
          >
            <AlertTriangleIcon className="h-3.5 w-3.5" />
            {showLowStock ? "Hide" : "Show"} Low Stock
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-2 mb-3 rounded text-sm">
          {error}
        </div>
      )}

      {isLoadingInventory ? (
        <div className="p-4 text-center">
          <div className="h-2 w-24 bg-muted animate-pulse rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">
            Loading inventory levels...
          </p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto border rounded-md bg-card">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/10">
                <th className="py-2 px-3 text-left font-medium">Ingredient</th>
                <th className="py-2 px-3 text-right font-medium">
                  Quantity Used
                </th>
                <th className="py-2 px-3 text-right font-medium">
                  Stock After
                </th>
                <th className="py-2 px-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(groupedImpacts).map((impact, index) => {
                const inventory = inventoryLevels[impact.ingredientId];

                // Calculate remaining stock and determine status
                const currentStock = inventory?.current_stock ?? 0;
                const minimumStock = inventory?.minimum_stock ?? 0;
                const remainingStock = Math.max(
                  0,
                  currentStock - impact.quantityUsed
                );
                const stockPercentage =
                  minimumStock > 0
                    ? Math.min(100, (remainingStock / minimumStock) * 100)
                    : 100;

                // Determine status
                const isLowStock = remainingStock < minimumStock;
                const isOutOfStock = remainingStock <= 0;

                // Only show low stock items if filter is enabled
                if (showLowStock || !isLowStock) {
                  return (
                    <tr
                      key={`${impact.ingredientId}-${index}`}
                      className={`border-b hover:bg-muted/5 ${
                        isOutOfStock
                          ? "bg-destructive/10"
                          : isLowStock
                          ? "bg-amber-50/80"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-medium">{impact.name}</td>
                      <td className="py-3 px-3 text-right">
                        {impact.quantityUsed.toFixed(2)} {impact.unit}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={
                              isOutOfStock ? "text-destructive font-medium" : ""
                            }
                          >
                            {remainingStock.toFixed(2)} {impact.unit}
                          </span>
                          {inventory && (
                            <div className="w-24">
                              <Progress
                                value={stockPercentage}
                                className={`h-1.5 ${
                                  isOutOfStock
                                    ? "bg-destructive/30"
                                    : isLowStock
                                    ? "bg-amber-200"
                                    : "bg-muted"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="ml-auto">
                            Out of Stock
                          </Badge>
                        ) : isLowStock ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                          >
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            In Stock
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                }
                return null;
              })}

              {/* If all items are filtered out, show a message */}
              {Object.values(groupedImpacts).every((impact) => {
                const inventory = inventoryLevels[impact.ingredientId];
                const currentStock = inventory?.current_stock ?? 0;
                const minimumStock = inventory?.minimum_stock ?? 0;
                const remainingStock = Math.max(
                  0,
                  currentStock - impact.quantityUsed
                );
                const isLowStock = remainingStock < minimumStock;
                return showLowStock && !isLowStock;
              }) && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <AlertTriangleIcon className="h-5 w-5 text-muted-foreground/50 mb-1" />
                      <p>No low stock items to display</p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowLowStock(false)}
                        className="text-xs"
                      >
                        Show all items
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryImpactSection;
