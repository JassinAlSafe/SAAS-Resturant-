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
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Hooks
import { useReports } from "./hooks/useReports";

// Register ChartJS components once
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

// Loading component for the Suspense fallback
function ReportsLoadingState() {
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl px-4">
      <div className="flex flex-col gap-4 text-center">
        <Skeleton className="h-10 w-1/3 mx-auto" />
        <Skeleton className="h-5 w-2/3 mx-auto" />
      </div>

      <Card className="border-none shadow-sm rounded-xl">
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 text-center">
                <Skeleton className="h-4 w-20 mb-2 mx-auto" />
                <div className="flex justify-center">
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Skeleton className="h-12 w-full max-w-2xl rounded-full bg-orange-100/30" />
      </div>

      <Card className="border-none shadow-sm rounded-xl">
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// Error display component
function ErrorDisplay({ error, onRetry }) {
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
            onClick={onRetry}
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </ReportsWrapper>
    </div>
  );
}

// Stat card component
function StatCard({ title, value, subtext, link, linkText }) {
  return (
    <ReportsWrapper>
      <div className="p-5 flex flex-col">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <span className="text-2xl font-bold mt-1">{value}</span>
        <div className="flex items-center mt-1.5">
          {subtext ? (
            <span className={subtext.className}>{subtext.text}</span>
          ) : null}
          {link ? (
            <a href={link} className="text-blue-500 text-sm">
              {linkText}
            </a>
          ) : null}
        </div>
      </div>
    </ReportsWrapper>
  );
}

function ReportsContent() {
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [filters, setFilters] = useState<ReportFilters>({
    searchTerm: "",
    category: "all",
    minAmount: undefined,
    maxAmount: undefined,
  });

  // Time update effect
  useEffect(() => {
    const updateTime = () => setCurrentTime(format(new Date(), "HH:mm:ss"));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Report data hook
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

  // Memoized handlers
  const handleFilterChange = useCallback((newFilters: ReportFilters) => {
    setFilters(newFilters);
    console.log("Filters changed:", newFilters);
  }, []);

  const handleRemoveFilter = useCallback((key: keyof ReportFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (key === "category") {
        newFilters.category = "all";
      } else if (key === "searchTerm") {
        newFilters.searchTerm = "";
      } else {
        newFilters[key] = undefined;
      }
      return newFilters;
    });
  }, []);

  const handleExportReport = useCallback(() => {
    toast.success("Report exported successfully");
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm ||
      filters.category !== "all" ||
      filters.minAmount ||
      filters.maxAmount
    );
  }, [filters]);

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetchData} />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl px-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Sales"
            value={formatCurrency(executiveSummary.currentSales)}
            subtext={{
              className: `text-sm ${
                executiveSummary.salesGrowth >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`,
              text: `${
                executiveSummary.salesGrowth >= 0 ? "+" : ""
              }${executiveSummary.salesGrowth.toFixed(1)}%`,
            }}
          />

          <StatCard
            title="Low Stock Items"
            value={executiveSummary.lowStockCount}
            link="/inventory?filter=low-stock"
            linkText="View items"
          />

          <StatCard
            title="Out of Stock Items"
            value={executiveSummary.outOfStockCount}
            link="/shopping-list"
            linkText="Go to Shopping List"
          />
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-6">
          <ActiveFilterPills
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            activeTab={activeTab}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center">
        <ReportsTabs activeTab={activeTab} onTabChange={setActiveTabState} />
      </div>

      {/* Tab Content */}
      <ReportsWrapper
        isLoading={!executiveSummary && activeTab === "executive"}
      >
        {activeTab === "executive" && executiveSummary && (
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
        )}

        {activeTab === "sales" && (
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
        )}

        {activeTab === "inventory" && (
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
        )}
      </ReportsWrapper>
    </div>
  );
}

export default function Reports() {
  return (
    <Suspense fallback={<ReportsLoadingState />}>
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
    </Suspense>
  );
}
