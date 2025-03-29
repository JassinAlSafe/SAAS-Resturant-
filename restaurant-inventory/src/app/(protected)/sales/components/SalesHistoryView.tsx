"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfMonth } from "date-fns";
import { FileSpreadsheet } from "lucide-react";
import { salesService } from "@/lib/services/sales-service";
import { generateSalesExcel } from "@/lib/utils/excel-utils";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { SalesChart } from "@/app/(protected)/sales/components/SalesChart";
import { DateRangeSelector } from "@/app/(protected)/sales/components/SalesHistoryView/DateRangeSelector";
import { SummaryCards } from "@/app/(protected)/sales/components/SalesHistoryView/SummaryCards";
import { SalesAnalysisTabs } from "@/app/(protected)/sales/components/SalesHistoryView/SalesAnalysisTabs";
import type {
  SaleData,
  SummaryData,
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
      toast.error("Error loading sales history");
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

  // Handle Excel export
  const handleExportExcel = useCallback(() => {
    try {
      if (salesData.length === 0) {
        toast.error("No data to export");
        return;
      }

      const filename = `sales-history-${format(
        startDate,
        "yyyyMMdd"
      )}-to-${format(endDate, "yyyyMMdd")}`;
      generateSalesExcel(salesData, filename);
      toast.success("Sales data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export sales data");
    }
  }, [salesData, startDate, endDate]);

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sales History
          </h1>
          <p className="text-sm text-muted-foreground">
            View and analyze your historical sales data
          </p>
        </div>
        <Button
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-full"
          onClick={handleExportExcel}
          disabled={isLoading || salesData.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {/* Date Range Selection */}
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onDateRangeSelect={({ startDate, endDate }) => {
          setStartDate(startDate);
          setEndDate(endDate);
        }}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilter={fetchSalesData}
        isLoading={isLoading}
      />

      {/* Sales Overview Chart */}
      <div className="bg-white border-none shadow-sm rounded-xl">
        <div className="p-6">
          <h2 className="text-lg font-medium">Sales Overview</h2>
          <p className="text-sm text-muted-foreground">
            Sales performance over the selected period
          </p>
        </div>
        <div className="h-[350px] p-6 pt-0">
          <SalesChart
            data={summaryData.dailyTotals.map((day) => ({
              date: day.name,
              total: day.sales,
            }))}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        isLoading={isLoading}
        totalSales={summaryData.totalSales}
        totalOrders={summaryData.totalOrders}
        formatCurrency={formatCurrency}
      />

      {/* Sales Analysis Tabs */}
      <SalesAnalysisTabs
        isLoading={isLoading}
        salesData={salesData}
        summaryData={summaryData}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
