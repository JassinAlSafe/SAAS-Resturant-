"use client";

import React from "react";
import { motion } from "framer-motion";

interface InventoryLevelIndicatorProps {
  currentStock: number;
  minStock: number;
  maxStock: number;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export function InventoryLevelIndicator({
  currentStock,
  minStock,
  maxStock,
  size = "md",
  showLabels = false,
}: InventoryLevelIndicatorProps) {
  // Calculate the percentage of stock
  const range = maxStock - minStock;
  const adjustedCurrent = Math.max(minStock, Math.min(maxStock, currentStock));
  const percentage = range > 0 ? ((adjustedCurrent - minStock) / range) * 100 : 0;

  // Determine the color based on the percentage
  let color = "";
  if (percentage < 25) {
    color = "bg-error";
  } else if (percentage < 50) {
    color = "bg-warning";
  } else {
    color = "bg-success";
  }

  // Size classes
  const sizeClasses = {
    sm: {
      height: "h-1.5",
      text: "text-xs",
      padding: "py-0",
    },
    md: {
      height: "h-2",
      text: "text-sm",
      padding: "py-1",
    },
    lg: {
      height: "h-3",
      text: "text-base",
      padding: "py-2",
    },
  };

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between mb-1">
          <span className={`${sizeClasses[size].text} text-base-content/60`}>
            Min: {minStock}
          </span>
          <span className={`${sizeClasses[size].text} font-medium text-base-content`}>
            Current: {currentStock}
          </span>
          <span className={`${sizeClasses[size].text} text-base-content/60`}>
            Max: {maxStock}
          </span>
        </div>
      )}
      <div className={`w-full bg-base-300 rounded-full overflow-hidden ${sizeClasses[size].height}`}>
        <motion.div
          className={`${color} rounded-full ${sizeClasses[size].height}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {!showLabels && (
        <div className="flex justify-end mt-1">
          <span className={`${sizeClasses[size].text} text-base-content/60`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
