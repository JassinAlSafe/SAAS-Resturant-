"use client";

import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "primary" | "success" | "warning" | "info" | "default";
  footer?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  variant = "default",
  footer,
  className,
}: StatCardProps) {
  // Define variant-specific styles
  const variantStyles = {
    primary: {
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      trendUp: "text-green-500",
      trendDown: "text-red-500",
      titleColor: "text-gray-600",
      valueColor: "text-black",
    },
    success: {
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
      trendUp: "text-green-500",
      trendDown: "text-red-500",
      titleColor: "text-gray-600",
      valueColor: "text-black",
    },
    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      trendUp: "text-green-500",
      trendDown: "text-red-500",
      titleColor: "text-gray-600",
      valueColor: "text-black",
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      trendUp: "text-green-500",
      trendDown: "text-red-500",
      titleColor: "text-gray-600",
      valueColor: "text-black",
    },
    default: {
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      trendUp: "text-green-500",
      trendDown: "text-red-500",
      titleColor: "text-gray-600",
      valueColor: "text-black",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "bg-white rounded-lg p-5 transition-all duration-300",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div
          className={`${styles.iconBg} ${styles.iconColor} p-2 rounded-md`}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend.isPositive ? styles.trendUp : styles.trendDown
            }`}
          >
            {trend.isPositive ? (
              <FiTrendingUp className="mr-1 h-4 w-4" />
            ) : (
              <FiTrendingDown className="mr-1 h-4 w-4" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className={`text-sm ${styles.titleColor}`}>{title}</h3>
        <p className={`text-2xl font-bold ${styles.valueColor}`}>{value}</p>
      </div>
      
      {footer && <div className="mt-4 pt-4 border-t border-gray-100">{footer}</div>}
    </div>
  );
}
