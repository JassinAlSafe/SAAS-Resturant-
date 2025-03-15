"use client";

import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { cn } from "@/lib/utils";
import Card from "./Card";

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
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  variant = "default",
  footer,
}: StatCardProps) {
  // Define variant-specific styles
  const variantStyles = {
    primary: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      trendUp: "text-primary",
      trendDown: "text-red-600",
    },
    success: {
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      trendUp: "text-green-600",
      trendDown: "text-red-600",
    },
    warning: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      trendUp: "text-green-600",
      trendDown: "text-amber-600",
    },
    info: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trendUp: "text-green-600",
      trendDown: "text-red-600",
    },
    default: {
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
      trendUp: "text-green-600",
      trendDown: "text-red-600",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className="shadow-xs hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              styles.iconBg
            )}
          >
            <div className={styles.iconColor}>{icon}</div>
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center text-sm font-medium",
                trend.isPositive ? styles.trendUp : styles.trendDown
              )}
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
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {footer && <div className="mt-4 text-xs">{footer}</div>}
      </div>
    </Card>
  );
}
