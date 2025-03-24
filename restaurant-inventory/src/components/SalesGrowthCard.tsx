"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { FiTrendingUp, FiCalendar, FiArrowRight } from "react-icons/fi";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SalesChannel {
  name: string;
  value: number;
  color: string;
}

interface Product {
  name: string;
  unitsSold: number;
  color: string;
}

interface ChartData {
  month: string;
  sales: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartData;
  }>;
  label?: string;
}

interface SalesGrowthCardProps {
  title?: string;
  dateRange?: string;
  viewAllLink?: string;
  className?: string;
  totalRevenue?: number;
  averageMonthly?: number;
  highestMonth?: number;
  lowestMonth?: number;
  growthPercent?: number;
  salesData?: ChartData[];
  data?: ChartData[];
  salesChannels?: SalesChannel[];
  topProducts?: Product[];
  ariaLabel?: string;
}

export const SalesGrowthCard = ({
  title = "Sales Growth",
  dateRange = "Last 30 days",
  viewAllLink,
  className,
  totalRevenue,
  growthPercent = 0,
  salesData,
  data,
  salesChannels,
  topProducts,
  ariaLabel = "Sales growth chart showing monthly performance",
}: SalesGrowthCardProps) => {
  const { formatCurrency, currencySymbol } = useCurrency();

  // Use data prop if provided, otherwise use salesData
  const chartData = data ||
    salesData || [
      { month: "Jan", sales: 0 },
      { month: "Feb", sales: 0 },
      { month: "Mar", sales: 0 },
      { month: "Apr", sales: 0 },
      { month: "May", sales: 0 },
      { month: "Jun", sales: 0 },
    ];

  // Default sales channels if not provided
  const defaultSalesChannels: SalesChannel[] = [
    { name: "Online Store", value: 8400, color: "#10b981" },
    { name: "In-Store", value: 6200, color: "#3b82f6" },
    { name: "Wholesale", value: 4800, color: "#8b5cf6" },
  ];

  // Default top products if not provided
  const defaultTopProducts: Product[] = [
    { name: "Product A", unitsSold: 245, color: "#f59e0b" },
    { name: "Product B", unitsSold: 187, color: "#f43f5e" },
    { name: "Product C", unitsSold: 143, color: "#6366f1" },
  ];

  // Use provided data or defaults
  const channelsToShow = salesChannels || defaultSalesChannels;
  const productsToShow = topProducts || defaultTopProducts;

  // Error handling for empty data
  const hasData = chartData && chartData.length > 0;

  // Calculate derived values if not provided
  const calculatedTotalRevenue =
    totalRevenue ||
    (hasData ? chartData.reduce((sum, item) => sum + item.sales, 0) : 0);

  // Calculate growth percentage (comparing last two months)
  const lastMonthSales =
    hasData && chartData.length >= 1
      ? chartData[chartData.length - 1]?.sales || 0
      : 0;
  const previousMonthSales =
    hasData && chartData.length >= 2
      ? chartData[chartData.length - 2]?.sales || 0
      : 0;
  const growthPercentCalculated =
    previousMonthSales === 0
      ? 100
      : Math.round(
          ((lastMonthSales - previousMonthSales) / previousMonthSales) * 100
        );
  const growthPercentUsed =
    growthPercent !== undefined ? growthPercent : growthPercentCalculated;

  // Custom tooltip with proper typing
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="card card-compact bg-base-100 shadow-md p-3"
          role="tooltip"
        >
          <p className="text-sm font-medium text-base-content">
            {payload[0].payload.month}
          </p>
          <p className="text-sm font-bold text-success">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        "card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-success",
        className
      )}
    >
      <div className="card-body p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="bg-success/15 text-success p-2 rounded-full mr-2 transition-transform hover:scale-110 duration-300">
                <FiTrendingUp className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-semibold">{title}</p>
                <p className="text-xs text-base-content/60">
                  Monthly sales performance analysis
                </p>
              </div>
            </div>
          </div>

          <div className="badge badge-ghost gap-1">
            <FiCalendar className="h-3 w-3" aria-hidden="true" />
            <span>{dateRange}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline">
            <p
              className={`text-xl font-bold ${
                growthPercentUsed >= 0 ? "text-success" : "text-error"
              } hover:scale-105 transition-transform duration-300`}
            >
              {growthPercentUsed >= 0 ? "+" : ""}
              {growthPercentUsed}%
            </p>
            <span className="ml-2 text-xs text-base-content/60">
              vs last period
            </span>
          </div>

          <div className="badge badge-success badge-outline gap-1">
            <span className="text-xs font-medium">
              {formatCurrency(calculatedTotalRevenue)}
            </span>
          </div>
        </div>

        {!hasData ? (
          <div className="alert alert-info my-4">
            <p className="text-sm">No sales data available for this period</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-base-content/60 mb-2">
                Top Sales Channels
              </div>
              <div className="space-y-2">
                {channelsToShow.map((channel, index) => (
                  <div
                    key={`channel-${index}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: channel.color }}
                        aria-hidden="true"
                      ></div>
                      <span className="text-xs font-medium">
                        {channel.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium">
                      {formatCurrency(channel.value)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-base-content/60 mt-4 mb-2">
                Top Products
              </div>
              <div className="space-y-2">
                {productsToShow.map((product, index) => (
                  <div
                    key={`product-${index}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: product.color }}
                        aria-hidden="true"
                      ></div>
                      <span className="text-xs font-medium">
                        {product.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium">
                      {product.unitsSold}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 0,
                    left: -25,
                    bottom: 0,
                  }}
                  barSize={24}
                  aria-label={ariaLabel}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--base-300))"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--base-content))" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--base-content))" }}
                    tickFormatter={(value) => {
                      if (value >= 1000) {
                        return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
                      }
                      return `${currencySymbol}${value}`;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === chartData.length - 1
                            ? "hsl(var(--success))"
                            : "hsl(var(--primary))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewAllLink && (
          <div className="card-actions justify-end mt-4 pt-4 border-t border-base-200">
            <Button asChild variant="ghost" className="text-primary">
              <Link href={viewAllLink} className="flex items-center">
                View detailed report
                <FiArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesGrowthCard;
