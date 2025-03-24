"use client";

import { useRouter } from "next/navigation";
import {
  FiPackage,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
  FiBarChart2,
  FiActivity,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import { CiMoneyBill } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import SalesGrowthCard from "@/components/SalesGrowthCard";
import ExpiryAlerts from "@/components/dashboard/ExpiryAlerts";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { CategoryIcon } from "./CategoryIcon";
import StatsSkeleton from "./StatsSkeleton";
import type { CategoryStat as BackendCategoryStat } from "@/lib/types";

// Define local interface that extends the backend type with UI-specific properties
interface UICategoryStat extends Partial<BackendCategoryStat> {
  name: string;
  percentage: number;
  count: number;
}

interface RecentActivity {
  id: string;
  title?: string;
  description?: string;
  user?: string;
  action?: string;
  item?: string;
  timestamp?: string;
  amount?: number;
}

export function OverviewTab() {
  const router = useRouter();
  const {
    stats: formattedStats,
    salesData,
    categoryStats,
    recentActivity,
    isLoading,
    error,
    refresh,
    hasData,
    currencySymbol = "$",
  } = useDashboard();

  // Helper function for number formatting
  const formatNumber = (num: number | string): string => {
    if (typeof num === "string") {
      // If it's already a string, assume it's already formatted
      return num.replace(/[^0-9.]/g, ""); // Remove any non-numeric characters except decimal
    }
    return new Intl.NumberFormat().format(num);
  };

  // Calculate percentage for category stats if needed
  const enrichedCategoryStats: UICategoryStat[] = Array.isArray(categoryStats)
    ? categoryStats.map((cat) => ({
        ...cat,
        percentage:
          (cat as { percentage?: number }).percentage ||
          Math.round(
            (cat.count / Math.max(...categoryStats.map((c) => c.count))) * 100
          ),
      }))
    : [];

  if (isLoading && !hasData) {
    return (
      <div className="space-y-8">
        <StatsSkeleton />
        <div className="grid gap-8 md:grid-cols-2">
          <div
            key="sales-skeleton"
            className="card bg-base-100 shadow-md h-[400px] animate-pulse"
          >
            <div className="skeleton h-full"></div>
          </div>
          <div
            key="category-skeleton"
            className="card bg-base-100 shadow-md h-[400px] animate-pulse"
          >
            <div className="skeleton h-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <FiAlertTriangle className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Error Loading Dashboard</h3>
            <div className="text-xs">
              {typeof error === "string"
                ? error
                : "Failed to load dashboard data. Please try again."}
            </div>
          </div>
        </div>
        <div className="flex-none">
          <Button
            onClick={() => refresh()}
            size="sm"
            variant="outline"
            className="bg-base-100"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!formattedStats) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body items-center text-center">
          <div className="avatar placeholder">
            <div className="bg-base-300 text-base-content rounded-full w-16 h-16">
              <FiPackage className="h-8 w-8" />
            </div>
          </div>
          <h2 className="card-title">No Data Available</h2>
          <p className="text-base-content/60">
            There&apos;s no dashboard data to display at this time.
          </p>
          <div className="card-actions justify-center mt-4">
            <Button onClick={() => refresh()} size="sm">
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { totalInventoryValue, lowStockItems, monthlySales, salesGrowth } =
    formattedStats;
  const salesGrowthValue = parseFloat(salesGrowth);

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory Value"
          value={`${currencySymbol}${formatNumber(totalInventoryValue)}`}
          icon={<FiPackage className="h-5 w-5" />}
          variant="primary"
          trend={{
            value: 12,
            isPositive: true,
          }}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems.toString()}
          icon={<FiAlertTriangle className="h-5 w-5" />}
          variant={
            parseInt(lowStockItems.toString()) > 5 ? "warning" : "default"
          }
          trend={
            parseInt(lowStockItems.toString()) > 0
              ? { value: 15, isPositive: false }
              : undefined
          }
        />
        <StatCard
          title="Monthly Sales"
          value={`${currencySymbol}${formatNumber(monthlySales)}`}
          icon={<CiMoneyBill className="h-5 w-5" />}
          variant="info"
          trend={
            parseFloat(monthlySales) > 0
              ? { value: 8, isPositive: true }
              : undefined
          }
        />
        <StatCard
          title="Sales Growth"
          value={`${salesGrowthValue >= 0 ? "+" : ""}${salesGrowth}%`}
          icon={<FiTrendingUp className="h-5 w-5" />}
          variant={salesGrowthValue >= 0 ? "success" : "info"}
          trend={
            salesGrowthValue !== 0
              ? {
                  value: Math.abs(salesGrowthValue),
                  isPositive: salesGrowthValue >= 0,
                }
              : undefined
          }
        />
      </div>

      {/* Main Content Area with Sales Growth and Category Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Growth Chart */}
        <SalesGrowthCard
          data={salesData}
          viewAllLink="/sales"
          className="h-full"
        />

        {/* Category Distribution */}
        <div className="card bg-base-100 shadow-md h-full">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-lg">
                <FiBarChart2 className="h-5 w-5 mr-2 text-primary" />
                Category Distribution
              </h2>
              <span className="badge badge-primary badge-outline text-xs">
                {categoryStats?.length || 0} Categories
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`category-skeleton-${i}`}
                    className="skeleton h-12 w-full"
                  ></div>
                ))}
              </div>
            ) : !categoryStats?.length ? (
              <div className="text-center py-6">
                <div className="avatar placeholder mb-4">
                  <div className="bg-base-300 text-base-content rounded-full w-12 h-12">
                    <FiPackage className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-base-content/60">
                  No category data available
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrichedCategoryStats.map((category, index) => (
                  <div
                    key={
                      category.id
                        ? `category-${category.id}`
                        : `category-${category.name}-${index}`
                    }
                    className="flex items-center p-3 border border-base-200 rounded-lg transition-all hover:bg-base-200/50"
                  >
                    <div className="mr-3 bg-primary/10 text-primary p-2 rounded-full">
                      <CategoryIcon category={category.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {category.name}
                        </span>
                        <span className="text-sm font-semibold">
                          {category.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-base-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="card-actions justify-end mt-4">
              <Button
                variant="ghost"
                className="text-primary"
                onClick={() => router.push("/inventory/categories")}
              >
                View All Categories
                <FiArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections: Expiry Alerts and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expiry Alerts */}
        <ExpiryAlerts />

        {/* Recent Activity */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-lg">
                <FiActivity className="h-5 w-5 mr-2 text-primary" />
                Recent Activity
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`activity-skeleton-${i}`}
                    className="skeleton h-12 w-full"
                  ></div>
                ))}
              </div>
            ) : !recentActivity?.length ? (
              <div className="text-center py-6">
                <div className="avatar placeholder mb-4">
                  <div className="bg-base-300 text-base-content rounded-full w-12 h-12">
                    <FiClock className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-base-content/60">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(recentActivity as RecentActivity[])?.map(
                  (activity, index) => (
                    <div
                      key={
                        activity.id
                          ? `activity-${activity.id}`
                          : `activity-index-${index}`
                      }
                      className="flex items-start p-3 border border-base-200 rounded-lg transition-all hover:bg-base-200/50"
                    >
                      <div className="mr-3 bg-info/10 text-info p-2 rounded-full">
                        <FiClock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {activity.title ||
                            `${activity.action} ${activity.item}`}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {activity.description ||
                            `${activity.user ? `by ${activity.user}` : ""} ${
                              activity.timestamp
                                ? `• ${activity.timestamp}`
                                : ""
                            }`}
                        </p>
                        {activity.amount && (
                          <span className="inline-block mt-1 text-xs badge badge-primary badge-outline">
                            {currencySymbol}
                            {formatNumber(activity.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="card-actions justify-end mt-4">
              <Button
                variant="ghost"
                className="text-primary"
                onClick={() => router.push("/activity")}
              >
                View All Activity
                <FiArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
