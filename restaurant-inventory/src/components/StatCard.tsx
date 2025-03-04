import React from "react";
import { cn } from "@/lib/utils";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { cva } from "class-variance-authority";

const cardVariants = cva("transition-all duration-300", {
  variants: {
    variant: {
      default: "border-border bg-card hover:shadow-sm",
      primary: "border-primary/20 bg-primary/5 hover:bg-primary/10",
      success:
        "border-green-200 bg-green-50 hover:bg-green-100/50 dark:border-green-800 dark:bg-green-950/50",
      warning:
        "border-amber-200 bg-amber-50 hover:bg-amber-100/50 dark:border-amber-800 dark:bg-amber-950/50",
      danger:
        "border-red-200 bg-red-50 hover:bg-red-100/50 dark:border-red-800 dark:bg-red-950/50",
      info: "border-blue-200 bg-blue-50 hover:bg-blue-100/50 dark:border-blue-800 dark:bg-blue-950/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const iconContainerVariants = cva(
  "h-11 w-11 rounded-lg flex items-center justify-center shrink-0",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/20 text-primary",
        success:
          "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
        warning:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
        info: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const trendBadgeVariants = cva(
  "flex items-center justify-center gap-1 font-medium rounded-md text-xs px-1.5 py-0.5",
  {
    variants: {
      trend: {
        positive:
          "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
        negative:
          "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
);

interface StatCardProps {
  className?: string;
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  trendLabel?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  footer?: React.ReactNode;
}

const StatCard = ({
  className,
  title,
  value,
  icon,
  trend,
  trendLabel,
  variant = "default",
  footer,
}: StatCardProps) => {
  return (
    <Card className={cn(cardVariants({ variant }), className)}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className={cn(iconContainerVariants({ variant }))}>{icon}</div>

          {trend && (
            <div
              className={cn(
                trendBadgeVariants({
                  trend: trend.isPositive ? "positive" : "negative",
                })
              )}
            >
              {trend.isPositive ? (
                <FiTrendingUp className="h-3 w-3" />
              ) : (
                <FiTrendingDown className="h-3 w-3" />
              )}
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </div>
          )}
        </div>

        <div className="mt-5">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {value}
          </CardTitle>
          <CardDescription className="mt-1.5">{title}</CardDescription>
          {trendLabel && (
            <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>
          )}
        </div>

        {footer && (
          <CardFooter className="px-0 pt-4 mt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
            {footer}
          </CardFooter>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
