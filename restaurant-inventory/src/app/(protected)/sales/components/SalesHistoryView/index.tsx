"use client";

import { useState, useCallback, useEffect } from "react";
import { format, subDays, startOfMonth } from "date-fns";
import { Filter, Calendar, ArrowRight } from "lucide-react";
import { salesService } from "@/lib/services/sales-service";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { SalesChart } from "@/app/(protected)/sales/components/SalesChart";
import { SalesAnalysisTabs } from "@/app/(protected)/sales/components/SalesHistoryView/SalesAnalysisTabs";
import type {
  SaleData,
  SummaryData,
  DailyTotal,
} from "@/app/(protected)/sales/components/SalesHistoryView/types";

// Predefined date ranges for quick selection
const DATE_RANGES = [
  {
    label: "Last 7 days",
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  },
  {
    label: "Last 30 days",
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  },
  {
    label: "This month",
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
  },
];

export default function SalesHistoryView() {
  const { formatCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(DATE_RANGES[0].startDate);
  const [endDate, setEndDate] = useState<Date>(DATE_RANGES[0].endDate);
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalSales: 0,
    totalOrders: 0,
    categoryTotals: {},
    dailyTotals: [],
  });

  // Fetch sales data based on date range
  const fetchSalesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDateString = format(startDate, "yyyy-MM-dd");
      const endDateString = format(endDate, "yyyy-MM-dd");

      const result = await salesService.exportSalesToExcel(
        startDateString,
        endDateString
      );

      if (result.success && result.data) {
        const filteredData = result.data.filter(
          (sale) => sale.items && sale.items.length > 0
        );

        setSalesData(filteredData);
        calculateSummaryData(filteredData);
      } else {
        toast.error("Failed to fetch sales data");
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast.error("Error loading sales analytics");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Calculate summary data from sales data
  const calculateSummaryData = (data: SaleData[]) => {
    if (data.length === 0) {
      setSummaryData({
        totalSales: 0,
        totalOrders: 0,
        categoryTotals: {},
        dailyTotals: [],
      });
      return;
    }

    const allItems = data.flatMap((sale) => sale.items);
    const categoryTotals = allItems.reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = { sales: 0, items: 0 };
      }
      acc[category].sales += item.total;
      acc[category].items += item.quantity;
      return acc;
    }, {} as Record<string, { sales: number; items: number }>);

    const dailyMap: Record<string, { sales: number; items: number }> = {};
    data.forEach((sale) => {
      const dateKey = format(new Date(sale.date), "MMM dd");
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { sales: 0, items: 0 };
      }
      dailyMap[dateKey].sales += sale.total;
      dailyMap[dateKey].items += sale.items.reduce(
        (sum: number, item: SaleData["items"][0]) => sum + item.quantity,
        0
      );
    });

    const dailyTotals = Object.entries(dailyMap)
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        items: data.items,
      }))
      .sort((a, b) => {
        const currentYear = new Date().getFullYear();
        return (
          new Date(`${a.name} ${currentYear}`).getTime() -
          new Date(`${b.name} ${currentYear}`).getTime()
        );
      });

    setSummaryData({
      totalSales: data.reduce((sum, sale) => sum + sale.total, 0),
      totalOrders: data.length,
      categoryTotals,
      dailyTotals,
    });
  };

  // Initial data fetch
  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  return (
    <div className="space-y-8 p-6">
      {/* Modern Date Range Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-5">
            {DATE_RANGES.map((range, index) => (
              <button
                key={index}
                onClick={() => {
                  setStartDate(range.startDate);
                  setEndDate(range.endDate);
                  fetchSalesData();
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  format(startDate, "yyyy-MM-dd") ===
                    format(range.startDate, "yyyy-MM-dd") &&
                  format(endDate, "yyyy-MM-dd") ===
                    format(range.endDate, "yyyy-MM-dd")
                    ? "bg-orange-100 text-orange-700"
                    : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {range.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 ring-orange-200 focus:border-orange-300 outline-none transition-all w-40"
                  />
                </div>
                <ArrowRight className="mx-2 h-4 w-4 text-neutral-400" />
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    value={format(endDate, "yyyy-MM-dd")}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 ring-orange-200 focus:border-orange-300 outline-none transition-all w-40"
                  />
                </div>
              </div>

              <button
                onClick={fetchSalesData}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                <Filter className="h-4 w-4" />
                Filter
                {isLoading && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-sm border border-orange-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-orange-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-40"></div>
          <h3 className="text-lg font-medium text-neutral-500">Total Sales</h3>
          {isLoading ? (
            <span className="loading loading-spinner loading-md text-orange-600 mt-2"></span>
          ) : (
            <div className="text-3xl font-bold text-neutral-800 mt-2">
              {formatCurrency(summaryData.totalSales)}
            </div>
          )}
          <p className="text-sm text-neutral-500 mt-2">
            From {format(startDate, "MMM d, yyyy")} to{" "}
            {format(endDate, "MMM d, yyyy")}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 className="text-lg font-medium text-neutral-500">Total Orders</h3>
          {isLoading ? (
            <span className="loading loading-spinner loading-md text-orange-600 mt-2"></span>
          ) : (
            <div className="text-3xl font-bold text-neutral-800 mt-2">
              {summaryData.totalOrders.toLocaleString()}
            </div>
          )}
          <p className="text-sm text-neutral-500 mt-2">
            Average{" "}
            {summaryData.totalOrders > 0
              ? formatCurrency(summaryData.totalSales / summaryData.totalOrders)
              : formatCurrency(0)}{" "}
            per order
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 className="text-lg font-medium text-neutral-500">Items Sold</h3>
          {isLoading ? (
            <span className="loading loading-spinner loading-md text-orange-600 mt-2"></span>
          ) : (
            <div className="text-3xl font-bold text-neutral-800 mt-2">
              {summaryData.dailyTotals
                .reduce((acc, day) => acc + day.items, 0)
                .toLocaleString()}
            </div>
          )}
          <p className="text-sm text-neutral-500 mt-2">
            Across {Object.keys(summaryData.categoryTotals).length} categories
          </p>
        </div>
      </div>

      {/* Improved Sales Overview Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-50">
          <h2 className="text-xl font-semibold text-neutral-800">
            Sales Overview
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {isLoading
              ? "Loading sales data..."
              : `Sales trend from ${format(
                  startDate,
                  "MMM d, yyyy"
                )} to ${format(endDate, "MMM d, yyyy")}`}
          </p>
        </div>
        <div className="p-4">
          <div className="h-[350px] relative" style={{ outline: "none" }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <span className="loading loading-spinner loading-lg text-orange-600"></span>
              </div>
            ) : summaryData.dailyTotals.length > 0 ? (
              <SalesChart
                data={summaryData.dailyTotals.map((day: DailyTotal) => ({
                  date: day.name,
                  total: day.sales,
                }))}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                  <Filter className="h-6 w-6 text-neutral-400" />
                </div>
                <p className="text-neutral-600 font-medium">
                  No sales data available
                </p>
                <p className="text-sm text-neutral-400 mt-1">
                  Try selecting a different date range
                </p>
              </div>
            )}
          </div>

          {!isLoading && summaryData.dailyTotals.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between text-sm border-t border-neutral-100 mt-2">
              <span className="text-neutral-500">
                {summaryData.dailyTotals
                  .reduce((acc, day) => acc + day.items, 0)
                  .toLocaleString()}{" "}
                items sold over {summaryData.dailyTotals.length} days
              </span>
              <span className="font-medium text-orange-600">
                {formatCurrency(summaryData.totalSales)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Sales Analysis Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <SalesAnalysisTabs
          isLoading={isLoading}
          salesData={salesData}
          summaryData={summaryData}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
}
