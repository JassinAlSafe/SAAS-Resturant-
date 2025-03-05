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

// Components
import {
  PageHeader,
  DateRangeSelector,
  SalesAnalyticsView,
  InventoryUsageView,
  LoadingIndicator,
} from "./components";

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

export default function Reports() {
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
  } = useReports();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-background">
      <PageHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleExportReport={handleExportReport}
      />

      <DateRangeSelector
        dateRange={dateRange}
        setDateRange={setDateRange}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
      />

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <div className="bg-card rounded-lg shadow-sm p-6">
          {/* Sales Analytics Content */}
          {activeTab === "sales" && (
            <SalesAnalyticsView
              salesData={salesData}
              topDishesData={topDishesData}
              formatCurrency={formatCurrency}
              previousPeriodData={previousPeriodData}
            />
          )}

          {/* Inventory Usage Content */}
          {activeTab === "inventory" && (
            <InventoryUsageView inventoryUsageData={inventoryUsageData} />
          )}
        </div>
      )}
    </div>
  );
}
