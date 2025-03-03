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
    isLoading,
    salesData,
    topDishesData,
    inventoryUsageData,
    formatCurrency,
    handleExportReport,
  } = useReports();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleExportReport={handleExportReport}
      />

      <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {/* Sales Analytics Content */}
          {activeTab === "sales" && (
            <SalesAnalyticsView
              salesData={salesData}
              topDishesData={topDishesData}
              formatCurrency={formatCurrency}
            />
          )}

          {/* Inventory Usage Content */}
          {activeTab === "inventory" && (
            <InventoryUsageView inventoryUsageData={inventoryUsageData} />
          )}
        </>
      )}
    </div>
  );
}
