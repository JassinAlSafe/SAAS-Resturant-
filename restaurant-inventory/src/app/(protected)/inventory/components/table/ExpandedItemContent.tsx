"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GanttChartSquare, BarChart3, History } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/types/inventory";

interface ExpandedItemContentProps {
  item: InventoryItem;
  formatCurrency: (value: number) => string;
}

export function ExpandedItemContent({
  item,
  formatCurrency,
}: ExpandedItemContentProps) {
  const getStockStatusColor = (
    currentStock: number,
    reorderPoint: number,
    targetStock: number
  ) => {
    if (currentStock <= 0) return "bg-red-600";
    if (currentStock <= reorderPoint) return "bg-amber-500";
    if (currentStock >= targetStock) return "bg-green-600";
    return "bg-blue-600";
  };

  const getStockStatusPercentage = (
    currentStock: number,
    targetStock: number
  ) => {
    if (targetStock <= 0) return 0;
    return Math.min(Math.round((currentStock / targetStock) * 100), 100);
  };

  const mockUsageData = [
    { date: "Oct 1", amount: 3 },
    { date: "Oct 2", amount: 5 },
    { date: "Oct 3", amount: 2 },
    { date: "Oct 4", amount: 7 },
    { date: "Oct 5", amount: 1 },
    { date: "Oct 6", amount: 4 },
    { date: "Oct 7", amount: 6 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-4 px-6 bg-slate-50 dark:bg-slate-900/30 border-b dark:border-b-slate-800"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Basic info with image */}
        <Card className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-48 w-48 relative rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 mx-auto md:mx-0">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Item ID
                </div>
                <div className="font-medium">{item.id}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Category
                </div>
                <div className="font-medium">{item.category}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Supplier
                </div>
                <div className="font-medium">
                  {item.supplier || "Not specified"}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Location
                </div>
                <div className="font-medium">
                  {item.storageLocation || "Not specified"}
                </div>
              </div>

              <div className="pt-2">
                <Badge
                  variant={item.isActive ? "default" : "outline"}
                  className="text-xs"
                >
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Middle column - Stock & pricing data */}
        <Card className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center">
                <GanttChartSquare size={16} className="mr-2 text-blue-600" />
                Stock Status
              </h3>
              <Badge
                variant={item.currentStock > 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {item.currentStock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-medium">
                  {item.currentStock} {item.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Reorder Point:</span>
                <span className="font-medium">
                  {item.reorderPoint} {item.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Target Stock:</span>
                <span className="font-medium">
                  {item.targetStock} {item.unit}
                </span>
              </div>

              <div className="pt-2">
                <div className="text-xs text-slate-500 mb-1 flex justify-between">
                  <span>Stock Level</span>
                  <span>
                    {getStockStatusPercentage(
                      item.currentStock,
                      item.targetStock
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={getStockStatusPercentage(
                    item.currentStock,
                    item.targetStock
                  )}
                  className="h-2"
                  indicatorClassName={getStockStatusColor(
                    item.currentStock,
                    item.reorderPoint,
                    item.targetStock
                  )}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Unit Cost:</span>
                  <span className="font-medium">
                    {formatCurrency(item.unitCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Value:</span>
                  <span className="font-medium">
                    {formatCurrency(item.unitCost * item.currentStock)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right column - Usage & ordering */}
        <Card className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center">
                <BarChart3 size={16} className="mr-2 text-indigo-600" />
                Usage History
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <History size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View full history</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="h-[100px] flex items-end justify-between gap-1">
              {mockUsageData.map((day, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center flex-1 space-y-1"
                >
                  <div
                    className="w-full bg-blue-500/80 rounded-t"
                    style={{
                      height: `${Math.max((day.amount / 7) * 100, 10)}%`,
                    }}
                  />
                  <span className="text-xs text-slate-500">{day.date}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-3 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Average Usage:</span>
                  <span className="font-medium">
                    {(
                      mockUsageData.reduce((acc, day) => acc + day.amount, 0) /
                      mockUsageData.length
                    ).toFixed(1)}{" "}
                    {item.unit}/day
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Estimated Days Left:</span>
                  <span className="font-medium">
                    {Math.round(
                      item.currentStock /
                        (mockUsageData.reduce(
                          (acc, day) => acc + day.amount,
                          0
                        ) /
                          mockUsageData.length)
                    )}{" "}
                    days
                  </span>
                </div>

                <div className="pt-2">
                  <Button size="sm" className="w-full mt-2">
                    {item.currentStock <= item.reorderPoint
                      ? "Order Now"
                      : "Create Order"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
