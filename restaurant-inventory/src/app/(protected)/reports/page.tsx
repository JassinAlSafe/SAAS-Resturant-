"use client";

// Core imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { ErrorBoundary } from "@/components/error-boundary";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState, useEffect, Suspense } from "react";

// Components
import {
  SalesAnalyticsView,
  InventoryUsageView,
  ExecutiveDashboard,
  ReportsTabs,
  ReportsWrapper,
  ReportsHeader,
} from "./components";
import { ReportFilters } from "./components/ReportsFilter";
import { ActiveFilterPills } from "./components/ActiveFilterPills";

// Hooks
import { useReports } from "./hooks/useReports";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function ReportsContent() {
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [filters, setFilters] = useState<ReportFilters>({
    searchTerm: "",
    category: "all",
    minAmount: undefined,
    maxAmount: undefined,
  });

  useEffect(() => {
    // Set initial time
    setCurrentTime(format(new Date(), "HH:mm:ss"));

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), "HH:mm:ss"));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Use our custom hook to manage state and data
  const {
    activeTab,
    setActiveTab: setActiveTabState,
    dateRange,
    setDateRange,
    customDateRange,
    setCustomDateRange,
    salesData,
    topDishesData,
    inventoryUsageData,
    executiveSummary,
    formatCurrency,
    previousPeriodData,
    error,
    refetchData,
    getPercentageChange,
  } = useReports();

  const handleFilterChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
    // Here you would typically filter your data based on the filters
    console.log("Filters changed:", newFilters);
  };

  const handleRemoveFilter = (key: keyof ReportFilters) => {
    const newFilters = { ...filters };

    if (key === "category") {
      newFilters.category = "all";
    } else if (key === "searchTerm") {
      newFilters.searchTerm = "";
    } else {
      newFilters[key] = undefined;
    }

    setFilters(newFilters);
    handleFilterChange(newFilters);
  };

  const handleExportReport = () => {
    toast.success("Report exported successfully");
  };

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ReportsWrapper
          title="Error Loading Reports"
          description="We encountered an issue while loading your report data."
        >
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-gray-700 mb-4">
              {typeof error === "object" && error !== null && "message" in error
                ? (error as { message: string }).message
                : "Failed to load report data"}
            </p>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 transition-colors"
              onClick={refetchData}
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        </ReportsWrapper>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Page header */}
        <ReportsHeader
          currentTime={currentTime}
          dateRange={dateRange}
          setDateRange={setDateRange}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
          onExport={handleExportReport}
          onFilterChange={handleFilterChange}
          activeTab={activeTab}
        />

        {/* Stats Overview Cards */}
        {executiveSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ReportsWrapper>
              <div className="p-5 flex flex-col">
                <span className="text-gray-500 text-sm font-medium">
                  Total Sales
                </span>
                <span className="text-2xl font-bold mt-1">
                  {formatCurrency(executiveSummary.currentSales)}
                </span>
                <div className="flex items-center mt-1.5">
                  <span
                    className={`text-sm ${
                      executiveSummary.salesGrowth >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {executiveSummary.salesGrowth >= 0 ? "+" : ""}
                    {executiveSummary.salesGrowth.toFixed(1)}%
                  </span>
                  <span className="text-gray-500 text-sm ml-1.5">
                    vs. previous period
                  </span>
                </div>
              </div>
            </ReportsWrapper>

            <ReportsWrapper>
              <div className="p-5 flex flex-col">
                <span className="text-gray-500 text-sm font-medium">
                  Low Stock Items
                </span>
                <span className="text-2xl font-bold mt-1">
                  {executiveSummary.lowStockCount}
                </span>
                <div className="flex items-center mt-1.5">
                  <a
                    href="/inventory?filter=low-stock"
                    className="text-blue-500 text-sm"
                  >
                    View items
                  </a>
                </div>
              </div>
            </ReportsWrapper>

            <ReportsWrapper>
              <div className="p-5 flex flex-col">
                <span className="text-gray-500 text-sm font-medium">
                  Out of Stock Items
                </span>
                <span className="text-2xl font-bold mt-1">
                  {executiveSummary.outOfStockCount}
                </span>
                <div className="flex items-center mt-1.5">
                  <a href="/shopping-list" className="text-blue-500 text-sm">
                    Go to Shopping List
                  </a>
                </div>
              </div>
            </ReportsWrapper>
          </div>
        )}

        {/* Active Filters */}
        {(filters.searchTerm ||
          filters.category !== "all" ||
          filters.minAmount ||
          filters.maxAmount) && (
          <div className="mb-6">
            <ActiveFilterPills
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              activeTab={activeTab}
            />
          </div>
        )}

        {/* Tabs */}
        <ReportsTabs activeTab={activeTab} onTabChange={setActiveTabState} />

        {/* Tab Content */}
        <Suspense
          fallback={
            <ReportsWrapper isLoading={true}>
              <div></div>
            </ReportsWrapper>
          }
        >
          <div className={activeTab === "executive" ? "block" : "hidden"}>
            {executiveSummary ? (
              <ReportsWrapper>
                <ExecutiveDashboard
                  salesData={{
                    currentSales: executiveSummary.currentSales,
                    previousSales: executiveSummary.previousSales,
                    salesGrowth: executiveSummary.salesGrowth,
                    profitMargin: executiveSummary.profitMargin,
                  }}
                  inventoryData={{
                    lowStockCount: executiveSummary.lowStockCount,
                    outOfStockCount: executiveSummary.outOfStockCount,
                    criticalItems: executiveSummary.criticalItems,
                  }}
                  topDishes={executiveSummary.topDishes as string[]}
                  formatCurrency={formatCurrency}
                />
              </ReportsWrapper>
            ) : (
              <ReportsWrapper isLoading={true}>
                <div></div>
              </ReportsWrapper>
            )}
          </div>

          <div className={activeTab === "sales" ? "block" : "hidden"}>
            <ReportsWrapper>
              {/* 
                There's a type incompatibility between Chart.js types and our custom types.
                This should be fixed in a future refactoring by aligning our ChartData type with Chart.js types.
              */}
              <SalesAnalyticsView
                salesData={(salesData as any) || { labels: [], datasets: [] }}
                topDishesData={
                  (topDishesData as any) || { labels: [], datasets: [] }
                }
                formatCurrency={formatCurrency}
                previousPeriodData={previousPeriodData || undefined}
                getPercentageChange={getPercentageChange}
                dateRange={String(dateRange || "7d")}
              />
            </ReportsWrapper>
          </div>

          <div className={activeTab === "inventory" ? "block" : "hidden"}>
            <ReportsWrapper>
              {/* 
                There's a type incompatibility between Chart.js types and our custom types.
                This should be fixed in a future refactoring by aligning our InventoryUsageData type with Chart.js types.
              */}
              <InventoryUsageView
                inventoryUsageData={
                  (inventoryUsageData as any) || {
                    labels: [],
                    datasets: [],
                    inventory: [],
                  }
                }
                onRefresh={refetchData}
              />
            </ReportsWrapper>
          </div>
        </Suspense>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="container mx-auto py-8 px-4">
          <ReportsWrapper
            title="Something went wrong"
            description={
              error.message ||
              "An unexpected error occurred in the Reports page"
            }
          >
            <div className="flex justify-center my-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 transition-colors"
                onClick={reset}
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          </ReportsWrapper>
        </div>
      )}
    >
      <ReportsContent />
    </ErrorBoundary>
  );
}
