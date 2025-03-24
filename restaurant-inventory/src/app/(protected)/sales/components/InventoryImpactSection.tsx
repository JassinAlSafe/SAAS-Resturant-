"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ShoppingCart,
  CircleOff,
  PackageX,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { InventoryImpactItem } from "../types";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 p-8 text-center">
          <CircleOff className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h4 className="font-medium text-lg text-foreground mb-1">
            No Inventory Impact
          </h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Add quantities to dishes to see how your sales will affect your
            inventory levels
          </p>
        </Card>
      </motion.div>
    );
  }

  // Count items by status
  const statusCounts = {
    outOfStock: 0,
    lowStock: 0,
    inStock: 0,
  };

  // Type-safe access to inventory levels
  Object.values(groupedImpacts).forEach((impact: InventoryImpactItem) => {
    const inventory = inventoryLevels[impact.ingredientId] as
      | InventoryItem
      | undefined;
    if (inventory) {
      const currentStock = inventory.current_stock;
      const minimumStock = inventory.minimum_stock;
      const remainingStock = Math.max(0, currentStock - impact.quantityUsed);

      if (remainingStock <= 0) {
        statusCounts.outOfStock++;
      } else if (remainingStock < minimumStock) {
        statusCounts.lowStock++;
      } else {
        statusCounts.inStock++;
      }
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
              <ShoppingCart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium">Inventory Impact</h4>
              <p className="text-xs text-muted-foreground">
                Effect on your inventory after sales
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={showLowStock ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLowStock(!showLowStock)}
              className="text-xs h-8 px-3 flex items-center gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {showLowStock ? "Hide" : "Show"} Low Stock
            </Button>
          </div>
        </div>

        {/* Status Summary Card */}
        {!isLoadingInventory && !error && (
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
              <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-md">
                <PackageX className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
                <p className="font-medium">{statusCounts.outOfStock}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
              <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="font-medium">{statusCounts.lowStock}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
              <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-md">
                <PackageCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">In Stock</p>
                <p className="font-medium">{statusCounts.inStock}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-3 text-sm">
            {error}
          </div>
        )}

        {isLoadingInventory ? (
          <div className="p-8 text-center">
            <div className="h-2 w-24 bg-muted animate-pulse rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">
              Loading inventory levels...
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto border-t border-gray-200 dark:border-gray-800">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">
                    Ingredient
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    Quantity Used
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    Stock After
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <AnimatePresence>
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
                        <motion.tr
                          key={`${impact.ingredientId}-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`border-b hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
                            isOutOfStock
                              ? "bg-red-50/80 dark:bg-red-900/10"
                              : isLowStock
                              ? "bg-amber-50/80 dark:bg-amber-900/10"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-3 font-medium">
                            {impact.name}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {impact.quantityUsed.toFixed(2)} {impact.unit}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={
                                  isOutOfStock
                                    ? "text-red-600 dark:text-red-400 font-medium"
                                    : ""
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
                                        ? "bg-red-200 dark:bg-red-900/30"
                                        : isLowStock
                                        ? "bg-amber-200 dark:bg-amber-900/30"
                                        : "bg-muted"
                                    }`}
                                    indicatorClassName={
                                      isOutOfStock
                                        ? "bg-red-600 dark:bg-red-500"
                                        : isLowStock
                                        ? "bg-amber-600 dark:bg-amber-500"
                                        : "bg-primary"
                                    }
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
                                className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30"
                              >
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
                              >
                                In Stock
                              </Badge>
                            )}
                          </td>
                        </motion.tr>
                      );
                    }
                    return null;
                  })}
                </AnimatePresence>

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
                      className="py-8 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <AlertTriangle className="h-5 w-5 text-muted-foreground/50 mb-1" />
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
      </Card>
    </motion.div>
  );
};

export default InventoryImpactSection;
