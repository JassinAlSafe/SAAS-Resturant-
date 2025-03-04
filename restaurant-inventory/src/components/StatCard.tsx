import React from "react";
import { cn } from "@/lib/utils";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { cva } from "class-variance-authority";

const cardVariants = cva(
  "bg-card border rounded-xl transition-all duration-300 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "border-border",
        primary: "border-primary/20 bg-primary/5 hover:bg-primary/10",
        success: "border-green-200 bg-green-50 hover:bg-green-100/50",
        warning: "border-amber-200 bg-amber-50 hover:bg-amber-100/50",
        danger: "border-red-200 bg-red-50 hover:bg-red-100/50",
        info: "border-blue-200 bg-blue-50 hover:bg-blue-100/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconContainerVariants = cva(
  "h-11 w-11 rounded-lg flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/20 text-primary",
        success: "bg-green-100 text-green-700",
        warning: "bg-amber-100 text-amber-700",
        danger: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
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
        positive: "bg-green-100 text-green-700",
        negative: "bg-red-100 text-red-700",
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
      <CardContent className="p-6">
        <div className="flex flex-col space-y-5">
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

          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">
              {title}
            </h3>
            <p className="text-2xl font-bold">{value}</p>
            {trendLabel && (
              <p className="text-xs text-muted-foreground">{trendLabel}</p>
            )}
          </div>

          {footer && (
            <div className="border-t border-border/50 pt-4 mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
