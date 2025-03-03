import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Define card variants with cleaner styling
const statCardVariants = cva(
  "rounded-lg border p-5 sm:p-6 shadow-sm bg-card overflow-hidden transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card",
        primary: "bg-primary/5 border-primary/20 hover:bg-primary/10",
        success:
          "bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-950/30",
        warning:
          "bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-900/50 hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
        danger:
          "bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30",
        info: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Define icon variants with improved visual hierarchy
const iconVariants = cva("rounded-md p-2.5 flex items-center justify-center", {
  variants: {
    variant: {
      default: "bg-primary/10 text-primary",
      primary: "bg-primary/15 text-primary dark:text-primary-foreground",
      success:
        "bg-green-100/70 dark:bg-green-900/40 text-green-600 dark:text-green-400",
      warning:
        "bg-yellow-100/70 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
      danger: "bg-red-100/70 dark:bg-red-900/40 text-red-600 dark:text-red-400",
      info: "bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number | { value: number; isPositive?: boolean };
  trendLabel?: string;
  isLoading?: boolean;
  footer?: React.ReactNode;
  iconClassName?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  variant = "default",
  className,
  isLoading = false,
  footer,
  iconClassName,
  ...props
}: StatCardProps) {
  // Format trend with a plus sign for positive values
  let formattedTrend;
  let trendValue = typeof trend === "number" ? trend : trend?.value;
  let isPositive =
    typeof trend === "object" ? trend.isPositive !== false : trendValue > 0;

  if (trendValue !== undefined) {
    formattedTrend = isPositive ? `+${trendValue}%` : `${trendValue}%`;
  }

  // Determine trend color
  const trendColor =
    trendValue !== undefined
      ? isPositive
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400"
      : "";

  return (
    <div className={cn(statCardVariants({ variant }), className)} {...props}>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center min-h-[100px]">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-row items-start justify-between space-x-4">
            {icon && (
              <div className={cn(iconVariants({ variant }), iconClassName)}>
                {icon}
              </div>
            )}
            <div className="text-right flex-grow">
              <h3 className="truncate text-sm font-medium text-muted-foreground mb-1.5">
                {title}
              </h3>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {value}
              </div>

              {trend !== undefined && (
                <div className="mt-2 flex items-center justify-end gap-1.5">
                  <span className={cn("text-sm font-medium", trendColor)}>
                    {formattedTrend}
                  </span>
                  {trendLabel && (
                    <span className="text-xs text-muted-foreground/70">
                      {trendLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {footer && (
            <div className="mt-4 pt-3 border-t border-border/30">{footer}</div>
          )}
        </>
      )}
    </div>
  );
}
