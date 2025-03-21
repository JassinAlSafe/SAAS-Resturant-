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
  percentComplete?: number;
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
  averageMonthly,
  highestMonth,
  lowestMonth,
  percentComplete = 75,
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
    totalRevenue || (hasData ? chartData.reduce((sum, item) => sum + item.sales, 0) : 0);
  const calculatedAvgMonthly =
    averageMonthly || (hasData ? (calculatedTotalRevenue / (chartData.length || 1)) : 0);
  const calculatedHighestMonth =
    highestMonth || (hasData ? Math.max(...chartData.map((item) => item.sales), 0) : 0);
  const calculatedLowestMonth =
    lowestMonth || (hasData ? Math.min(...chartData.map((item) => item.sales), 0) : 0);

  // Calculate growth percentage (comparing last two months)
  const lastMonthSales = hasData && chartData.length >= 1 ? chartData[chartData.length - 1]?.sales || 0 : 0;
  const previousMonthSales = hasData && chartData.length >= 2 ? chartData[chartData.length - 2]?.sales || 0 : 0;
  const growthPercentCalculated = previousMonthSales === 0 
    ? 100 
    : Math.round(((lastMonthSales - previousMonthSales) / previousMonthSales) * 100);
  const growthPercentUsed = growthPercent !== undefined ? growthPercent : growthPercentCalculated;

  // Custom tooltip with proper typing
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200" role="tooltip">
          <p className="text-sm font-medium text-slate-700">{payload[0].payload.month}</p>
          <p className="text-sm font-bold text-emerald-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 group h-full",
      className
    )}>
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full mr-2 transition-transform group-hover:scale-110 duration-300">
                <FiTrendingUp className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500">Monthly sales performance analysis</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center px-2 py-1 bg-slate-100 rounded-full text-slate-600 text-xs">
            <FiCalendar className="h-3 w-3 mr-1 text-slate-500" aria-hidden="true" />
            <span>{dateRange}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline">
            <p className="text-xl font-bold text-emerald-700 group-hover:scale-105 transition-transform duration-300">
              {growthPercentUsed >= 0 ? "+" : ""}{growthPercentUsed}%
            </p>
            <span className="ml-2 text-xs text-slate-500">vs last period</span>
          </div>
          
          <div className="bg-emerald-50 px-2 py-1 rounded-full flex items-center">
            <span className="text-xs font-medium text-emerald-600">
              {formatCurrency(calculatedTotalRevenue)}
            </span>
          </div>
        </div>

        {!hasData ? (
          <div className="text-center p-4 bg-slate-50 rounded-lg my-4">
            <p className="text-sm text-slate-500">No sales data available for this period</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-2">Top Sales Channels</div>
              <div className="space-y-2">
                {channelsToShow.map((channel, index) => (
                  <div key={`channel-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: channel.color }}
                        aria-hidden="true"
                      ></div>
                      <span className="text-xs font-medium text-slate-700">{channel.name}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-700">{formatCurrency(channel.value)}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-slate-500 mt-4 mb-2">Top Products</div>
              <div className="space-y-2">
                {productsToShow.map((product, index) => (
                  <div key={`product-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: product.color }}
                        aria-hidden="true"
                      ></div>
                      <span className="text-xs font-medium text-slate-700">{product.name}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-700">{product.unitsSold}</span>
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
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickFormatter={(value) => `${currencySymbol}${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar
                    dataKey="sales"
                    radius={[4, 4, 0, 0]}
                    name="Sales"
                    role="graphics-symbol"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#10b981" : "#34d399"}
                        aria-label={`${entry.month}: ${formatCurrency(entry.sales)}`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {viewAllLink && (
          <div className="mt-3 text-right">
            <Link href={viewAllLink} passHref>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs py-1 h-auto"
                aria-label={`View detailed ${title} report`}
              >
                View Detailed Report
                <FiArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        )}
        
        {/* Hover effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-30 transition-opacity"></div>
          <div className="absolute inset-[-100%] top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
        
        <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-slate-700">Total Revenue</p>
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(calculatedTotalRevenue)}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs font-medium text-slate-500">Avg Monthly</p>
                <p className="text-xs font-semibold text-slate-900">
                  {formatCurrency(calculatedAvgMonthly)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Highest</p>
                <p className="text-xs font-semibold text-emerald-600">
                  {formatCurrency(calculatedHighestMonth)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Lowest</p>
                <p className="text-xs font-semibold text-amber-600">
                  {formatCurrency(calculatedLowestMonth)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-700">
                Target Completion
              </span>
              <span className="text-xs font-medium text-slate-900">
                {percentComplete}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden" role="progressbar" aria-valuenow={percentComplete} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesGrowthCard;
