"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/lib/types";
import { FiEdit2, FiTrash2, FiPackage, FiImage } from "react-icons/fi";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

// Extended InventoryItem type to include possible image_url
interface ExtendedInventoryItem extends InventoryItem {
  image_url?: string;
}

interface InventoryCardsProps {
  items: InventoryItem[];
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
}

export function InventoryCards({
  items,
  onEditClick,
  onDeleteClick,
}: InventoryCardsProps) {
  const { formatCurrency } = useCurrency();

  // Get stock status letter
  const getStockStatusLetter = (item: InventoryItem): string => {
    if (item.quantity === 0) return "C";
    if (item.quantity <= (item.reorder_point || item.minimum_stock_level || 5))
      return "B";
    return "A";
  };

  // Get stock status color
  const getStockStatusColor = (item: InventoryItem): string => {
    const status = getStockStatusLetter(item);
    if (status === "C")
      return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30";
    if (status === "B")
      return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30";
    return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30";
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-muted"
      >
        <FiPackage className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-6 text-xl font-medium">No items found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          No inventory items match your current filters. Try adjusting your
          search criteria or category selection.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => {
        const stockStatus = getStockStatusLetter(item);
        const stockStatusColor = getStockStatusColor(item);
        const extendedItem = item as ExtendedInventoryItem;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="overflow-hidden h-full flex flex-col bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-200">
              <div className="relative">
                <div className="absolute top-3 right-3 z-10">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm",
                      stockStatusColor
                    )}
                  >
                    {stockStatus}
                  </div>
                </div>
                <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
                  {extendedItem.image_url ? (
                    <Image
                      src={extendedItem.image_url}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                  ) : (
                    <FiImage className="h-16 w-16 text-muted-foreground/30" />
                  )}
                </div>
              </div>

              <div className="p-4 flex-grow flex flex-col">
                <div className="mb-2">
                  <Badge variant="outline" className="mb-2 font-normal">
                    {item.category}
                  </Badge>
                  <h3 className="font-medium text-lg leading-tight line-clamp-2">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">SKU:</span>
                    <span className="font-mono text-xs">
                      {item.id.substring(0, 8)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Stock:
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        stockStatus === "C" && "text-red-600 dark:text-red-400",
                        stockStatus === "B" &&
                          "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Price:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.cost_per_unit)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditClick(item)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <FiEdit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClick(item)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <FiTrash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
