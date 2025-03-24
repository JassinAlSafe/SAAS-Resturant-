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
  // Define variant-specific styles with DaisyUI classes
  const variantStyles = {
    primary: {
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      trendUp: "text-success",
      trendDown: "text-error",
      cardClass: "border-t-4 border-t-primary",
      titleColor: "text-base-content/70",
      valueColor: "text-primary",
    },
    success: {
      iconBg: "bg-success/15",
      iconColor: "text-success",
      trendUp: "text-success",
      trendDown: "text-error",
      cardClass: "border-t-4 border-t-success",
      titleColor: "text-base-content/70",
      valueColor: "text-success",
    },
    warning: {
      iconBg: "bg-warning/15",
      iconColor: "text-warning",
      trendUp: "text-success",
      trendDown: "text-warning",
      cardClass: "border-t-4 border-t-warning",
      titleColor: "text-base-content/70",
      valueColor: "text-warning",
    },
    info: {
      iconBg: "bg-info/15",
      iconColor: "text-info",
      trendUp: "text-success",
      trendDown: "text-error",
      cardClass: "border-t-4 border-t-info",
      titleColor: "text-base-content/70",
      valueColor: "text-info",
    },
    default: {
      iconBg: "bg-base-200",
      iconColor: "text-base-content",
      trendUp: "text-success",
      trendDown: "text-error",
      cardClass: "border-t-4 border-t-neutral",
      titleColor: "text-base-content/70",
      valueColor: "text-base-content",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300",
        styles.cardClass,
        className
      )}
    >
      <div className="card-body p-5">
        <div className="flex justify-between items-start mb-3">
          <div
            className={`${styles.iconBg} ${styles.iconColor} p-3 rounded-full transition-transform hover:scale-110 duration-300`}
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
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className={`text-sm font-medium ${styles.titleColor}`}>{title}</p>
          <p
            className={`text-2xl font-bold ${styles.valueColor} hover:scale-105 transition-transform duration-300`}
          >
            {value}
          </p>
        </div>
        {footer && (
          <div className="mt-4 pt-3 border-t border-base-200">{footer}</div>
        )}
      </div>
    </div>
  );
}
