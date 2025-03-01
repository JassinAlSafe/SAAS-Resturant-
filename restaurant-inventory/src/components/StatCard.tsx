import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  className = "",
}: StatCardProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden h-full border border-border/40 shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>

            {trend && (
              <div className="flex items-center mt-2">
                <div
                  className={cn(
                    "flex items-center justify-center p-1.5 rounded-full",
                    trend.isPositive
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  )}
                >
                  {trend.isPositive ? (
                    <FiArrowUp
                      className={cn(
                        "h-3 w-3",
                        trend.isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    />
                  ) : (
                    <FiArrowDown
                      className={cn(
                        "h-3 w-3",
                        trend.isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium ml-1.5",
                    trend.isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1.5">
                  from last week
                </span>
              </div>
            )}
          </div>

          <div className="bg-primary/10 p-3.5 rounded-full flex items-center justify-center shadow-sm">
            {icon}
          </div>
        </div>
      </CardContent>
      {trend && trend.isPositive && (
        <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-500 w-full" />
      )}
      {trend && !trend.isPositive && (
        <div className="h-1.5 bg-gradient-to-r from-red-400 to-red-500 w-full" />
      )}
      {!trend && (
        <div className="h-1.5 bg-gradient-to-r from-primary/20 to-primary/40 w-full" />
      )}
    </Card>
  );
};

export default StatCard;
