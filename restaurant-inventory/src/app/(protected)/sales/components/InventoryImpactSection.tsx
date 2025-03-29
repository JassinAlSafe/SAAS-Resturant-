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
        <Card className="bg-white p-8 text-center rounded-lg shadow-sm">
          <CircleOff className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
          <h4 className="font-medium text-lg text-neutral-800 mb-2">
            No Inventory Impact
          </h4>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
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
      className="mb-8"
    >
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-orange-50 rounded-md">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-lg text-neutral-900">
                Inventory Impact
              </h4>
              <p className="text-sm text-neutral-500 mt-1">
                Effect on your inventory after sales
              </p>
            </div>
          </div>

          <div>
            <Button
              type="button"
              variant={showLowStock ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLowStock(!showLowStock)}
              className={`text-sm h-9 px-4 rounded-lg flex items-center gap-2 ${
                showLowStock
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-white text-neutral-700"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              {showLowStock ? "Hide" : "Show"} Low Stock
            </Button>
          </div>
        </div>

        {/* Status Summary Card */}
        {!isLoadingInventory && !error && (
          <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-50">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
              <div className="p-2 bg-red-50 rounded-md">
                <PackageX className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  Out of Stock
                </p>
                <p className="font-medium text-lg mt-1">
                  {statusCounts.outOfStock}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
              <div className="p-2 bg-amber-50 rounded-md">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  Low Stock
                </p>
                <p className="font-medium text-lg mt-1">
                  {statusCounts.lowStock}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
              <div className="p-2 bg-green-50 rounded-md">
                <PackageCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  In Stock
                </p>
                <p className="font-medium text-lg mt-1">
                  {statusCounts.inStock}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 text-sm">{error}</div>
        )}

        {isLoadingInventory ? (
          <div className="p-8 text-center">
            <div className="h-2 w-24 bg-neutral-200 animate-pulse rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-neutral-500">
              Loading inventory levels...
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="py-3 px-6 text-left font-medium text-neutral-500 uppercase tracking-wider">
                    Ingredient
                  </th>
                  <th className="py-3 px-6 text-right font-medium text-neutral-500 uppercase tracking-wider">
                    Quantity Used
                  </th>
                  <th className="py-3 px-6 text-right font-medium text-neutral-500 uppercase tracking-wider">
                    Stock After
                  </th>
                  <th className="py-3 px-6 text-right font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
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
                          className={`hover:bg-neutral-50 ${
                            isOutOfStock
                              ? "bg-red-50"
                              : isLowStock
                              ? "bg-amber-50"
                              : ""
                          }`}
                        >
                          <td className="py-4 px-6 font-medium text-neutral-800">
                            {impact.name}
                          </td>
                          <td className="py-4 px-6 text-right text-neutral-700">
                            {impact.quantityUsed.toFixed(2)} {impact.unit}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={
                                  isOutOfStock
                                    ? "text-red-600 font-medium"
                                    : "text-neutral-700"
                                }
                              >
                                {remainingStock.toFixed(2)} {impact.unit}
                              </span>
                              {inventory && (
                                <div className="w-24">
                                  <Progress
                                    value={stockPercentage}
                                    className={`h-2 ${
                                      isOutOfStock
                                        ? "bg-red-200"
                                        : isLowStock
                                        ? "bg-amber-200"
                                        : "bg-neutral-200"
                                    }`}
                                    indicatorClassName={
                                      isOutOfStock
                                        ? "bg-red-600"
                                        : isLowStock
                                        ? "bg-amber-600"
                                        : "bg-neutral-600"
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {isOutOfStock ? (
                              <Badge className="bg-red-100 text-red-800 rounded-full font-normal px-3 py-1">
                                Out of Stock
                              </Badge>
                            ) : isLowStock ? (
                              <Badge className="bg-amber-100 text-amber-800 rounded-full font-normal px-3 py-1">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 rounded-full font-normal px-3 py-1">
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
                      className="py-10 text-center text-neutral-500"
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
