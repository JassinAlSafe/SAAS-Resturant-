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
  salesData?: { month: string; sales: number }[];
  data?: { month: string; sales: number }[];
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

  // Calculate derived values if not provided
  const calculatedTotalRevenue =
    totalRevenue || chartData.reduce((sum, item) => sum + item.sales, 0);
  const calculatedAvgMonthly =
    averageMonthly || (calculatedTotalRevenue / (chartData.length || 1));
  const calculatedHighestMonth =
    highestMonth || Math.max(...chartData.map((item) => item.sales), 0);
  const calculatedLowestMonth =
    lowestMonth || Math.min(...chartData.map((item) => item.sales), 0);

  // Calculate growth percentage (comparing last two months)
  const lastMonthSales = chartData[chartData.length - 1]?.sales || 0;
  const previousMonthSales = chartData[chartData.length - 2]?.sales || 0;
  const growthPercentCalculated = previousMonthSales === 0 
    ? 100 
    : Math.round(((lastMonthSales - previousMonthSales) / previousMonthSales) * 100);
  const growthPercentUsed = growthPercent !== undefined ? growthPercent : growthPercentCalculated;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200">
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
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full mr-3 transition-transform group-hover:scale-110 duration-300">
                <FiTrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500">Monthly sales performance analysis</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 text-xs">
            <FiCalendar className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            <span>{dateRange}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-emerald-700 group-hover:scale-105 transition-transform duration-300">
              {growthPercentUsed >= 0 ? "+" : ""}{growthPercentUsed}%
            </p>
            <span className="ml-2 text-xs text-slate-500">vs last period</span>
          </div>
          
          <div className="bg-emerald-50 px-3 py-1.5 rounded-full flex items-center">
            <span className="text-xs font-medium text-emerald-600">
              {formatCurrency(calculatedTotalRevenue)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-2">
                <span className="flex-1">Top Sales Channels</span>
                <span className="text-right">Revenue</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-sm font-medium text-slate-700">Online Store</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{formatCurrency(8400)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm font-medium text-slate-700">In-Store</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{formatCurrency(6200)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm font-medium text-slate-700">Wholesale</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{formatCurrency(4800)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-2">
                <span className="flex-1">Top Products</span>
                <span className="text-right">Units Sold</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-sm font-medium text-slate-700">Product A</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">245</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mr-2"></div>
                    <span className="text-sm font-medium text-slate-700">Product B</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">187</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                    <span className="text-sm font-medium text-slate-700">Product C</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">143</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 0,
                  left: -20,
                  bottom: 0,
                }}
                barSize={36}
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
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickFormatter={(value) => `${currencySymbol}${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="sales"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#10b981" : "#34d399"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {viewAllLink && (
          <div className="mt-4 text-right">
            <Link href={viewAllLink} passHref>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                View Detailed Report
                <FiArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
        
        {/* Hover effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-30 transition-opacity"></div>
          <div className="absolute inset-[-100%] top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-2">
                <span className="flex-1">Total Revenue</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-slate-100 p-2 rounded-full mr-2">
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-bold text-slate-900">
                      {formatCurrency(calculatedTotalRevenue)}
                    </div>
                    {growthPercentUsed !== 0 && (
                      <div className={`flex items-center px-2 py-1 rounded-md text-sm font-medium ${
                        growthPercentUsed >= 0 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {Math.abs(growthPercentUsed)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Average Monthly</p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(calculatedAvgMonthly)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Highest Month</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(calculatedHighestMonth)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Lowest Month</p>
                <p className="text-sm font-semibold text-amber-600">
                  {formatCurrency(calculatedLowestMonth)}
                </p>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Target Completion
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {percentComplete}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-700 ease-in-out"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesGrowthCard;
