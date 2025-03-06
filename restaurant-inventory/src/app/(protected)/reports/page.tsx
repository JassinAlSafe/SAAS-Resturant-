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
// Remove the react-error-boundary import
import { ErrorBoundary } from "@/components/error-boundary";

// Components
import {
  PageHeader,
  SalesAnalyticsView,
  InventoryUsageView,
  LoadingIndicator,
} from "./components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Use our custom hook to manage state and data
  const {
    activeTab,
    setActiveTab,
    dateRange,
    setDateRange,
    customDateRange,
    setCustomDateRange,
    isLoading,
    salesData,
    topDishesData,
    inventoryUsageData,
    formatCurrency,
    handleExportReport,
    metrics,
    previousPeriodData,
    getPercentageChange,
    error,
    refetchData,
  } = useReports();

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || "Failed to load report data"}
        </AlertDescription>
        <Button
          variant="outline"
          onClick={refetchData}
          className="mt-4 flex items-center gap-2"
        >
          <RefreshCw size={14} />
          Try again
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleExportReport={handleExportReport}
        dateRange={dateRange}
        setDateRange={setDateRange}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
      />

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <div className="bg-card rounded-lg shadow-sm p-4 md:p-6">
          {/* Sales Analytics Content */}
          {activeTab === "sales" && (
            <SalesAnalyticsView
              salesData={salesData || { labels: [], datasets: [] }}
              topDishesData={topDishesData || { labels: [], datasets: [] }}
              formatCurrency={formatCurrency}
              previousPeriodData={previousPeriodData}
            />
          )}

          {/* Inventory Usage Content */}
          {activeTab === "inventory" && (
            <InventoryUsageView
              inventoryUsageData={
                inventoryUsageData || {
                  labels: [],
                  datasets: [],
                }
              }
            />
          )}
        </div>
      )}
    </>
  );
}

export default function Reports() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-background min-h-[calc(100vh-4rem)]">
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Something went wrong
            </h2>
            <p className="mb-4 text-muted-foreground">
              We encountered an error while loading the reports
            </p>
            <Button onClick={reset}>Try again</Button>
          </div>
        )}
      >
        <ReportsContent />
      </ErrorBoundary>
    </div>
  );
}
