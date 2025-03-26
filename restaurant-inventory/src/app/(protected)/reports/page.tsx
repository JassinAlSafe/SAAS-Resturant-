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
import {
  AlertCircle,
  RefreshCw,
  Calendar,
  Download,
  FileBarChart2,
  Filter,
  MoreHorizontal,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState, useEffect, Suspense } from "react";

// Components
import {
  SalesAnalyticsView,
  InventoryUsageView,
  DateRangeSelector,
  ExecutiveDashboard,
} from "./components";
import { ReportsFilter, ReportFilters } from "./components/ReportsFilter";
import { ActiveFilterPills } from "./components/ActiveFilterPills";

// Hooks
import { useReports } from "./hooks/useReports";

// Add a direct import for TabType to ensure it's recognized
import { TabType } from "./types";

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

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl">
        <div className="alert alert-error my-8">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h3 className="font-bold">Error</h3>
            <div className="text-xs">
              {typeof error === "object" && "message" in error
                ? (error as { message: string }).message
                : "Failed to load report data"}
            </div>
            <button
              className="btn btn-outline btn-sm mt-4 flex items-center gap-2"
              onClick={refetchData}
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen pb-10">
      {/* Breadcrumb and page header */}
      <div className="bg-base-100 border-b border-base-300/70 mb-6">
        <div className="container mx-auto max-w-6xl py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm text-base-content text-opacity-60 mb-6">
            <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
            <span>Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5 mx-1.5" />
            <span className="text-base-content font-medium">
              Reports & Analytics
            </span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                <FileBarChart2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Reports & Analytics
                </h1>
                <p className="text-base-content text-opacity-60 mt-1">
                  View unified sales, inventory, and business analytics
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div
                className="tooltip"
                data-tip="Data is refreshed every 5 minutes"
              >
                <div className="flex items-center gap-2 px-3 py-1 bg-base-200/50 rounded-md text-sm text-base-content text-opacity-60">
                  <Calendar className="h-4 w-4" />
                  <span>{currentTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DateRangeSelector
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  customDateRange={customDateRange}
                  setCustomDateRange={setCustomDateRange}
                />

                <ReportsFilter
                  activeTab={activeTab}
                  onFilterChange={handleFilterChange}
                />

                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-outline btn-sm h-9 w-9 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li className="menu-title">Actions</li>
                    <li onClick={refetchData}>
                      <a className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh data</span>
                      </a>
                    </li>
                    <li
                      onClick={() => {
                        toast.info("Coming soon", {
                          description:
                            "Export functionality will be available in the next update.",
                        });
                      }}
                    >
                      <a className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>Export report</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Active filters display */}
        <ActiveFilterPills
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          activeTab={activeTab}
        />

        {/* Quick Stats Section with improved design */}
        {executiveSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-base-100 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary" />
              <div className="card-body pb-2 pt-4 px-4">
                <div className="flex items-center text-base-content text-opacity-60">
                  <span className="text-sm font-medium">Total Sales</span>
                </div>
                <h2 className="card-title text-2xl font-bold">
                  {formatCurrency(executiveSummary.currentSales)}
                </h2>
                <div className="card-actions pt-0">
                  <div
                    className={`badge ${
                      executiveSummary.salesGrowth >= 0
                        ? "bg-success bg-opacity-10 text-success"
                        : "badge-error"
                    } font-normal`}
                  >
                    {executiveSummary.salesGrowth >= 0 ? "+" : ""}
                    {executiveSummary.salesGrowth.toFixed(1)}% vs last period
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success/80 to-success" />
              <div className="card-body pb-2 pt-4 px-4">
                <div className="flex items-center text-base-content text-opacity-60">
                  <span className="text-sm font-medium">Profit Margin</span>
                </div>
                <h2 className="card-title text-2xl font-bold">
                  {executiveSummary.profitMargin.toFixed(1)}%
                </h2>
                <div className="card-actions pt-0">
                  <p className="text-xs text-base-content text-opacity-60">
                    Based on cost and revenue analysis
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning/80 to-warning" />
              <div className="card-body pb-2 pt-4 px-4">
                <div className="flex items-center text-base-content text-opacity-60">
                  <span className="text-sm font-medium">Low Stock Items</span>
                </div>
                <h2 className="card-title text-2xl font-bold">
                  {executiveSummary.lowStockCount}
                </h2>
                <div className="card-actions pt-0">
                  <a
                    href="/inventory?filter=low-stock"
                    className="link link-hover text-warning font-normal"
                  >
                    View items →
                  </a>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error/80 to-error" />
              <div className="card-body pb-2 pt-4 px-4">
                <div className="flex items-center text-base-content text-opacity-60">
                  <span className="text-sm font-medium">
                    Out of Stock Items
                  </span>
                </div>
                <h2 className="card-title text-2xl font-bold">
                  {executiveSummary.outOfStockCount}
                </h2>
                <div className="card-actions pt-0">
                  <a
                    href="/shopping-list"
                    className="link link-hover text-error font-normal"
                  >
                    Go to Shopping List →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="divider"></div>

        {/* Improved Tabs UI */}
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="tabs tabs-boxed bg-base-200 p-1 w-full max-w-md grid grid-cols-3">
              <a
                className={`tab ${
                  activeTab === "executive" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTabState("executive")}
              >
                Executive
              </a>
              <a
                className={`tab ${activeTab === "sales" ? "tab-active" : ""}`}
                onClick={() => setActiveTabState("sales")}
              >
                Sales
              </a>
              <a
                className={`tab ${
                  activeTab === "inventory" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTabState("inventory")}
              >
                Inventory
              </a>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="h-40 flex justify-center items-center">
                <div className="flex flex-col items-center">
                  <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                  <p className="text-base-content text-opacity-60">
                    Loading tab content...
                  </p>
                </div>
              </div>
            }
          >
            <div
              className={
                activeTab === "executive" ? "block space-y-6" : "hidden"
              }
            >
              {executiveSummary ? (
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
              ) : (
                <div className="h-40 flex justify-center items-center">
                  <div className="flex flex-col items-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-base-content text-opacity-60">
                      Loading dashboard data...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className={activeTab === "sales" ? "block space-y-6" : "hidden"}
            >
              <SalesAnalyticsView
                salesData={(salesData || { labels: [], datasets: [] }) as any}
                topDishesData={
                  (topDishesData || { labels: [], datasets: [] }) as any
                }
                formatCurrency={formatCurrency}
                previousPeriodData={previousPeriodData || undefined}
                getPercentageChange={getPercentageChange}
                dateRange={String(dateRange || "7d")}
              />
            </div>

            <div
              className={
                activeTab === "inventory" ? "block space-y-6" : "hidden"
              }
            >
              <InventoryUsageView
                inventoryUsageData={
                  (inventoryUsageData || {
                    labels: [],
                    datasets: [],
                    inventory: [],
                  }) as any
                }
                onRefresh={refetchData}
              />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="container mx-auto py-8 px-4">
          <div className="alert alert-error">
            <AlertCircle className="h-4 w-4" />
            <div>
              <h3 className="font-bold">Something went wrong</h3>
              <div className="text-xs space-y-4">
                <p>
                  {error.message ||
                    "An unexpected error occurred in the Reports page"}
                </p>
                <button className="btn btn-outline btn-sm" onClick={reset}>
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <ReportsContent />
    </ErrorBoundary>
  );
}
