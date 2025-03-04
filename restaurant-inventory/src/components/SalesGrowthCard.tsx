import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Define bar chart styling variants
const barVariants = cva(
  "rounded-t-md relative group transition-all duration-300",
  {
    variants: {
      active: {
        true: "bg-blue-500 hover:bg-blue-600",
        false: "bg-blue-400 hover:bg-blue-500",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface SalesGrowthCardProps {
  className?: string;
  totalRevenue?: number;
  averageMonthly?: number;
  highestMonth?: number;
  lowestMonth?: number;
  percentComplete?: number;
  growthPercent?: number;
  salesData?: { month: string; sales: number }[];
  title?: string;
  viewAllLink?: string;
  data?: { month: string; sales: number }[];
}

const SalesGrowthCard = ({
  className,
  totalRevenue,
  averageMonthly,
  highestMonth,
  lowestMonth,
  percentComplete = 75,
  growthPercent = 15.5,
  salesData,
  data,
  title = "Sales Growth Summary",
  viewAllLink,
}: SalesGrowthCardProps) => {
  // Use data prop if provided, otherwise use salesData
  const chartData = data ||
    salesData || [
      { month: "Jan", sales: 12400 },
      { month: "Feb", sales: 13800 },
      { month: "Mar", sales: 15200 },
      { month: "Apr", sales: 14900 },
      { month: "May", sales: 16300 },
      { month: "Jun", sales: 17500 },
    ];

  // Calculate derived values if not provided
  const calculatedTotalRevenue =
    totalRevenue || chartData.reduce((sum, item) => sum + item.sales, 0);
  const calculatedAvgMonthly =
    averageMonthly || calculatedTotalRevenue / chartData.length;
  const calculatedHighestMonth =
    highestMonth || Math.max(...chartData.map((item) => item.sales));
  const calculatedLowestMonth =
    lowestMonth || Math.min(...chartData.map((item) => item.sales));

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
  const maxSales = Math.max(...chartData.map((item) => item.sales));

  // Calculate which month has the highest sales
  const highestMonthIndex = chartData.findIndex(
    (item) => item.sales === maxSales
  );

  return (
    <Card
      className={cn(
        "overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300 h-full",
        className
      )}
    >
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 pt-6 px-6">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {title}
            <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {growthPercent}%
            </span>
          </CardTitle>
          <CardDescription className="mt-1">
            Monthly sales performance analysis
          </CardDescription>
        </div>
        <div className="flex items-center px-3 py-1.5 bg-muted/50 rounded-md text-muted-foreground text-sm border border-border/50">
          <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70" />
          <span>January - June 2024</span>
          <ChevronDown className="h-4 w-4 ml-1.5 text-muted-foreground/70" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <DollarSign className="h-3.5 w-3.5 mr-1 text-blue-500" />
                <span>Total Revenue</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl sm:text-4xl font-bold">
                  {formatCurrency(calculatedTotalRevenue)}
                </div>
                <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm font-medium">
                  <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  {growthPercent}%
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Average Monthly</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(calculatedAvgMonthly)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Highest Month</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(calculatedHighestMonth)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Lowest Month</p>
                <p className="text-sm font-semibold text-amber-600">
                  {formatCurrency(calculatedLowestMonth)}
                </p>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Quarterly Target
                </p>
                <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {percentComplete}% completed
                </p>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-in-out"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="h-[260px] flex flex-col">
            <div className="text-sm font-medium text-muted-foreground mb-3">
              Monthly Sales
            </div>
            <div className="flex-grow flex flex-col">
              <div className="flex-grow flex items-end">
                <div className="w-full h-full flex gap-2">
                  {chartData.map((item, i) => {
                    // Calculate height as a percentage of the maximum value (max height is 90%)
                    const heightPercentage = (item.sales / maxSales) * 90;
                    const isHighest = i === highestMonthIndex;

                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end group relative"
                      >
                        {/* Tooltip that appears on hover */}
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-card-foreground p-1 rounded text-xs whitespace-nowrap">
                          {formatCurrency(item.sales)}
                        </div>
                        <div
                          className={cn(barVariants({ active: isHighest }))}
                          style={{
                            height: `${heightPercentage}%`,
                            width: "80%",
                          }}
                        >
                          {/* Highlight circle on top of the highest bar */}
                          {isHighest && (
                            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 h-3 w-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="h-8 flex gap-2 mt-1">
                {chartData.map((item, i) => (
                  <div key={i} className="flex-1 flex justify-center">
                    <span className="text-xs text-muted-foreground">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
              {/* Y axis label */}
              <div className="h-4 flex justify-end pr-1">
                <span className="text-[10px] text-muted-foreground/70 italic">
                  in USD
                </span>
              </div>
            </div>
          </div>
        </div>

        {viewAllLink && (
          <div className="pt-4 mt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm flex items-center justify-center text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={viewAllLink}>
                View detailed sales reports
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesGrowthCard;
