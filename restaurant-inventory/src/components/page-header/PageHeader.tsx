"use client";

import * as React from "react";
import { FiCalendar, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  date?: Date;
  showDate?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  date = new Date(),
  showDate = true,
  onRefresh,
  isLoading = false,
  className,
  actions,
  children,
}: PageHeaderProps) {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={cn(
        "bg-card/50 border border-border/40 rounded-lg p-4 sm:p-6 mb-6 shadow-xs",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {showDate && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <FiCalendar className="h-3.5 w-3.5" />
              {formattedDate}
            </p>
          )}
          {children}
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-1.5 h-8 px-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-1" />
              ) : (
                <FiRefreshCw className="h-3.5 w-3.5" />
              )}
              <span className="text-xs">
                {isLoading ? "Loading..." : "Refresh"}
              </span>
            </Button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}

// Loading spinner component
interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  };

  return (
    <svg
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
