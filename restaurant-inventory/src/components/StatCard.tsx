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
    <Card className={cn("overflow-hidden h-full", className)}>
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>

            {trend && (
              <div className="flex items-center mt-2">
                <div
                  className={`flex items-center justify-center p-1 rounded-full ${
                    trend.isPositive ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {trend.isPositive ? (
                    <FiArrowUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <FiArrowDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ml-1 ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  from last week
                </span>
              </div>
            )}
          </div>

          <div className="bg-primary/10 p-3 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
      {trend && trend.isPositive && <div className="h-1 bg-green-500 w-full" />}
      {trend && !trend.isPositive && <div className="h-1 bg-red-500 w-full" />}
      {!trend && <div className="h-1 bg-primary/30 w-full" />}
    </Card>
  );
};

export default StatCard;
