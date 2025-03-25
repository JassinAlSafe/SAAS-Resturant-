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
import { InventoryItem } from "@/lib/types";

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
      className="py-4 px-6 bg-orange-50 border-b border-gray-200"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Basic info with image */}
        <Card className="p-4 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-48 w-48 relative rounded-md overflow-hidden border border-gray-200 shrink-0 mx-auto md:mx-0">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <div className="text-sm text-gray-500 font-medium">
                  Item ID
                </div>
                <div className="font-medium text-gray-700">{item.id}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 font-medium">
                  Category
                </div>
                <div className="font-medium text-gray-700">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {item.category}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 font-medium">
                  Supplier
                </div>
                <div className="font-medium text-gray-700">
                  {item.supplier_id ? `Supplier #${item.supplier_id}` : "Not specified"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 font-medium">
                  Location
                </div>
                <div className="font-medium text-gray-700">
                  {item.location || "Not specified"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Middle column - Stock info */}
        <Card className="p-4 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <GanttChartSquare className="h-5 w-5 text-orange-600" />
            Stock Information
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Current Stock</span>
                <span className="text-sm font-bold text-gray-800">
                  {item.quantity} {item.unit}
                </span>
              </div>
              <Progress
                value={getStockStatusPercentage(
                  item.quantity,
                  item.max_stock || 100
                )}
                className="h-2 bg-gray-200"
                indicatorClassName={getStockStatusColor(
                  item.quantity,
                  item.reorder_point || 0,
                  item.max_stock || 100
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <div className="text-xs text-gray-500 mb-1">Reorder Level</div>
                <div className="font-semibold text-orange-700">
                  {item.reorder_point || 0} {item.unit}
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="text-xs text-gray-500 mb-1">Max Stock</div>
                <div className="font-semibold text-green-700">
                  {item.max_stock || "Not set"} {item.max_stock ? item.unit : ""}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Cost per Unit</span>
                <span className="text-sm font-bold text-gray-800">
                  {formatCurrency(item.cost_per_unit || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Total Value</span>
                <span className="text-sm font-bold text-orange-600">
                  {formatCurrency((item.cost_per_unit || 0) * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right column - Usage history */}
        <Card className="p-4 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            Usage History
          </h3>

          <div className="h-40 flex items-end justify-between gap-1 mb-1 px-2">
            {mockUsageData.map((day, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center group"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="w-8 bg-orange-500 hover:bg-orange-600 rounded-t transition-all duration-200"
                        style={{
                          height: `${(day.amount / 7) * 100}%`,
                          minHeight: "10%",
                        }}
                      ></div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-gray-200 shadow-md text-gray-800">
                      <div className="text-xs font-medium">{day.date}</div>
                      <div className="text-sm font-bold">
                        {day.amount} {item.unit} used
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 mt-1">
            {mockUsageData.map((day, i) => (
              <div key={i} className="text-xs text-gray-500 w-8 text-center">
                {day.date.split(" ")[1]}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 flex items-center justify-center gap-2"
            >
              <History className="h-4 w-4" />
              View Full History
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
