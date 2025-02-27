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
    return (
      <div key={i} className="w-full flex items-end justify-center">
        <div
          className="w-10 bg-blue-400 rounded-t-sm"
          style={{ height: `${heightPercentage}%` }}
        ></div>
      </div>
    );
  });

  return (
    <Card className={cn("overflow-hidden bg-white shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <div>
          <CardTitle className="text-xl font-bold text-slate-800">
            {title}
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">January - June 2024</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Revenue
              </p>
              <p className="text-4xl font-bold text-slate-800 mt-1">
                {formatCurrency(totalRevenue)}
                <span className="ml-2 text-sm font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  +{growthPercent}%
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <p className="text-sm font-medium text-slate-500 w-36">
                  Average Monthly
                </p>
                <div className="h-1 bg-blue-100 flex-grow mx-4"></div>
                <p className="text-sm font-medium text-slate-800">
                  {formatCurrency(averageMonthly)}
                </p>
              </div>

              <div className="flex items-center">
                <p className="text-sm font-medium text-slate-500 w-36">
                  Highest Month
                </p>
                <div className="h-1 bg-blue-100 flex-grow mx-4"></div>
                <p className="text-sm font-medium text-slate-800">
                  {formatCurrency(highestMonth)}
                </p>
              </div>

              <div className="flex items-center">
                <p className="text-sm font-medium text-slate-500 w-36">
                  Lowest Month
                </p>
                <div className="h-1 bg-blue-100 flex-grow mx-4"></div>
                <p className="text-sm font-medium text-slate-800">
                  {formatCurrency(lowestMonth)}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500">
                  {percentComplete}% of quarterly target reached
                </p>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end">
            <div className="w-full h-full flex">
              <div className="w-full h-full flex flex-col">
                <div className="flex-grow flex space-x-2">{chartBars}</div>
                <div className="h-6 flex space-x-2">
                  {salesData.map((item, i) => (
                    <div key={i} className="w-full flex justify-center">
                      <span className="text-xs text-slate-500">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesGrowthCard;
