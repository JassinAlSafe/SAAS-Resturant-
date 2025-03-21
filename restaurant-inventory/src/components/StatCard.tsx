"use client";

import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

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
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      trendUp: "text-emerald-600",
      trendDown: "text-rose-600",
      accentColor: "bg-primary",
      titleColor: "text-slate-600",
      valueColor: "text-primary-700",
    },
    success: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trendUp: "text-emerald-600",
      trendDown: "text-rose-600",
      accentColor: "bg-emerald-500",
      titleColor: "text-slate-600",
      valueColor: "text-emerald-700",
    },
    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      trendUp: "text-emerald-600",
      trendDown: "text-amber-600",
      accentColor: "bg-amber-500",
      titleColor: "text-slate-600",
      valueColor: "text-amber-700",
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trendUp: "text-emerald-600",
      trendDown: "text-rose-600",
      accentColor: "bg-blue-500",
      titleColor: "text-slate-600",
      valueColor: "text-blue-700",
    },
    default: {
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      trendUp: "text-emerald-600",
      trendDown: "text-rose-600",
      accentColor: "bg-slate-500",
      titleColor: "text-slate-600",
      valueColor: "text-slate-900",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.accentColor}`}></div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className={`${styles.iconBg} ${styles.iconColor} p-3 rounded-full transition-transform group-hover:scale-110 duration-300`}>
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
          <p className={`text-2xl font-bold ${styles.valueColor} group-hover:scale-105 transition-transform duration-300`}>
            {value}
          </p>
        </div>
        {footer && <div className="mt-4 pt-3 border-t border-slate-200">{footer}</div>}
        
        {/* Hover effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-30 transition-opacity"></div>
          <div className="absolute inset-[-100%] top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
  );
}
