import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SalesGrowthCardProps {
  className?: string;
  totalRevenue: number;
  averageMonthly: number;
  highestMonth: number;
  lowestMonth: number;
  percentComplete: number;
  growthPercent: number;
  salesData?: { month: string; sales: number }[];
  title?: string;
}

const SalesGrowthCard = ({
  className,
  totalRevenue,
  averageMonthly,
  highestMonth,
  lowestMonth,
  percentComplete,
  growthPercent,
  salesData = [
    { month: "Jan", sales: 12400 },
    { month: "Feb", sales: 13800 },
    { month: "Mar", sales: 15200 },
    { month: "Apr", sales: 14900 },
    { month: "May", sales: 16300 },
    { month: "Jun", sales: 17500 },
  ],
  title = "Sales Growth Summary",
}: SalesGrowthCardProps) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate the max sales value for normalization
  const maxSales = Math.max(...salesData.map((item) => item.sales));

  // Generate chart bars based on actual sales data
  const chartBars = salesData.map((item, i) => {
    // Calculate height as a percentage of the maximum value
    const heightPercentage = (item.sales / maxSales) * 100;

    // Determine if this is the highest month
    const isHighest = item.sales === highestMonth;

    return (
      <div
        key={i}
        className="w-full flex flex-col items-center justify-end group"
      >
        <div className="text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mb-1">
          {formatCurrency(item.sales)}
        </div>
        <div
          className={cn(
            "w-10 rounded-t-md transition-all duration-300 group-hover:opacity-90",
            isHighest
              ? "bg-gradient-to-t from-primary/80 to-primary"
              : "bg-gradient-to-t from-blue-400/70 to-blue-400"
          )}
          style={{ height: `${heightPercentage}%` }}
        ></div>
        <div className="h-6 flex justify-center items-center mt-2">
          <span className="text-xs font-medium text-muted-foreground">
            {item.month}
          </span>
        </div>
      </div>
    );
  });

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
          <span className="text-sm text-muted-foreground">
            January - June 2024
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-4xl font-bold mt-1">
                {formatCurrency(totalRevenue)}
                <span className="ml-2 text-sm font-medium px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  +{growthPercent}%
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <p className="text-sm font-medium text-muted-foreground w-36">
                  Average Monthly
                </p>
                <div className="h-1 bg-muted flex-grow mx-4 rounded-full"></div>
                <p className="text-sm font-medium">
                  {formatCurrency(averageMonthly)}
                </p>
              </div>

              <div className="flex items-center">
                <p className="text-sm font-medium text-muted-foreground w-36">
                  Highest Month
                </p>
                <div className="h-1 bg-muted flex-grow mx-4 rounded-full"></div>
                <p className="text-sm font-medium text-primary">
                  {formatCurrency(highestMonth)}
                </p>
              </div>

              <div className="flex items-center">
                <p className="text-sm font-medium text-muted-foreground w-36">
                  Lowest Month
                </p>
                <div className="h-1 bg-muted flex-grow mx-4 rounded-full"></div>
                <p className="text-sm font-medium">
                  {formatCurrency(lowestMonth)}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {percentComplete}% of quarterly target reached
                </p>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full transition-all duration-500"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end">
            <div className="w-full h-full flex">
              <div className="w-full h-full flex space-x-2">{chartBars}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesGrowthCard;
