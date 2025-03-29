"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/lib/types";
import { FiEdit2, FiTrash2, FiPackage, FiImage } from "react-icons/fi";
import { useCurrency } from "@/lib/currency";
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
      return "text-error border-error/30 bg-error/10";
    if (status === "B")
      return "text-warning border-warning/30 bg-warning/10";
    return "text-success border-success/30 bg-success/10";
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 bg-base-200/20 rounded-lg border border-dashed border-base-300"
      >
        <FiPackage className="mx-auto h-16 w-16 text-base-content/30" />
        <h3 className="mt-6 text-xl font-medium">No items found</h3>
        <p className="mt-2 text-sm text-base-content/60 max-w-md mx-auto">
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
            <Card className="overflow-hidden h-full flex flex-col bg-base-100 border-base-200 hover:shadow-md transition-all duration-200">
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
                <div className="h-48 bg-base-200 flex items-center justify-center overflow-hidden relative">
                  {extendedItem.image_url ? (
                    <Image
                      src={extendedItem.image_url}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                  ) : (
                    <FiImage className="h-16 w-16 text-base-content/20" />
                  )}
                </div>
              </div>

              <div className="p-4 grow flex flex-col">
                <div className="mb-2">
                  <Badge variant="outline" className="mb-2 font-normal">
                    {item.category}
                  </Badge>
                  <h3 className="font-medium text-lg leading-tight line-clamp-2">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-base-content/60">SKU:</span>
                    <span className="font-mono text-xs">
                      {item.id.substring(0, 8)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-base-content/60">
                      Stock:
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        stockStatus === "C" && "text-error",
                        stockStatus === "B" && "text-warning"
                      )}
                    >
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-base-content/60">
                      Price:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.cost_per_unit || 0)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-base-200 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditClick(item)}
                    className="text-primary hover:bg-primary/10"
                  >
                    <FiEdit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClick(item)}
                    className="text-error hover:bg-error/10"
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
