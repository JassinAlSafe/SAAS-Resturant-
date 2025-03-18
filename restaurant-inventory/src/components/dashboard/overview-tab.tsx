"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  FiPackage,
  FiAlertTriangle,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiShoppingBag,
  FiBarChart2,
  FiUsers,
  FiArrowRight,
  FiActivity,
  FiShoppingCart,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import SalesGrowthCard from "@/components/SalesGrowthCard";
import ExpiryAlerts from "@/components/dashboard/ExpiryAlerts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { CategoryIcon } from "./CategoryIcon";
import { Alert } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

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
  } = useDashboard();

  // Handle the initial loading state
  if (isLoading && !hasData) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-4">
        <Alert>
          <p>No dashboard data available.</p>
        </Alert>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  // Parse numeric values
  const salesGrowth = parseFloat(formattedStats.salesGrowth);

  return (
    <div className="space-y-6">
      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Inventory Value"
          value={formattedStats.totalInventoryValue}
          icon={<FiPackage className="h-5 w-5" />}
          variant="primary"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs">Last updated:</span>
              <span className="text-xs font-medium flex items-center">
                <FiClock className="h-3 w-3 mr-1" />{" "}
                {format(new Date(), "h:mm a")}
              </span>
            </div>
          }
        />
        <StatCard
          title="Low Stock Items"
          value={formattedStats.lowStockItems.toString()}
          icon={<FiAlertTriangle className="h-5 w-5" />}
          variant="warning"
          footer={
            <div className="flex items-center justify-center gap-1.5 text-amber-700 bg-amber-50 rounded-md px-2 py-1 mt-1">
              <FiAlertTriangle className="h-3 w-3" /> Needs attention
            </div>
          }
        />
        <StatCard
          title="Monthly Sales"
          value={formattedStats.monthlySales}
          icon={<FiDollarSign className="h-5 w-5" />}
          variant="success"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs">Current Month:</span>
              <span className="text-xs font-medium text-green-600">
                {format(new Date(), "MMMM yyyy")}
              </span>
            </div>
          }
        />
        <StatCard
          title="Sales Growth"
          value={formattedStats.salesGrowth}
          icon={<FiTrendingUp className="h-5 w-5" />}
          trend={{
            value: Math.abs(salesGrowth),
            isPositive: salesGrowth >= 0,
          }}
          variant="info"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs">vs. Last Month:</span>
              <span
                className={`text-xs font-medium ${
                  salesGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {salesGrowth >= 0 ? "+" : ""}
                {salesGrowth}%
              </span>
            </div>
          }
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left column - 8/12 width on large screens */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Sales Performance card */}
          <div className="bg-card rounded-xl border shadow-xs hover:shadow-md transition-all overflow-hidden">
            <div className="p-4 sm:p-6 border-b">
              <h2 className="text-xl font-semibold mb-1">Sales Performance</h2>
              <p className="text-sm text-muted-foreground">
                Monthly revenue and growth trends
              </p>
            </div>
            <div className="p-4 sm:p-6">
              {salesData.length > 0 ? (
                <SalesGrowthCard
                  title=""
                  totalRevenue={salesData.reduce(
                    (sum, item) => sum + item.sales,
                    0
                  )}
                  averageMonthly={
                    salesData.reduce((sum, item) => sum + item.sales, 0) /
                    (salesData.length || 1)
                  }
                  highestMonth={Math.max(
                    ...salesData.map((item) => item.sales),
                    0
                  )}
                  lowestMonth={Math.min(
                    ...salesData.map((item) => item.sales),
                    0
                  )}
                  percentComplete={75}
                  growthPercent={salesGrowth}
                  salesData={salesData}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <p className="text-muted-foreground">Loading sales data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick access cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-xs hover:shadow-md transition-all group">
              <div className="p-5 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FiShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Add Inventory</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quickly add new items to your inventory
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-primary/10 transition-colors"
                  onClick={() => router.push("/inventory/add")}
                >
                  Add New Items
                  <FiArrowRight className="ml-2 h-4 w-4 opacity-70" />
                </Button>
              </div>
            </Card>

            <Card className="shadow-xs hover:shadow-md transition-all group">
              <div className="p-5 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FiBarChart2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-1">Generate Reports</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create detailed inventory reports
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-blue-50 transition-colors"
                  onClick={() => router.push("/reports")}
                >
                  View Reports
                  <FiArrowRight className="ml-2 h-4 w-4 opacity-70" />
                </Button>
              </div>
            </Card>

            <Card className="shadow-xs hover:shadow-md transition-all group">
              <div className="p-5 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FiUsers className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-1">Team Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your team and permissions
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-green-50 transition-colors"
                  onClick={() => router.push("/users")}
                >
                  Manage Team
                  <FiArrowRight className="ml-2 h-4 w-4 opacity-70" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Activity section */}
          <div className="bg-card rounded-xl border shadow-xs hover:shadow-md transition-all overflow-hidden h-[410px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <h2 className="font-semibold flex items-center">
                <FiActivity className="h-4 w-4 mr-2 text-primary" />
                Recent Activity
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => refresh()}
              >
                Refresh
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentActivity.map((activity, index) => {
                    // Safely parse the date
                    const date = new Date(activity.timestamp);
                    const isValidDate = !isNaN(date.getTime());

                    // Determine icon based on action text
                    const actionLower = activity.action.toLowerCase();
                    let Icon = FiActivity;
                    let iconColor = "text-primary";
                    let bgColor = "bg-primary/10";

                    if (
                      actionLower.includes("inventory") ||
                      actionLower.includes("updated")
                    ) {
                      Icon = FiPackage;
                      iconColor = "text-blue-600";
                      bgColor = "bg-blue-100";
                    } else if (
                      actionLower.includes("sale") ||
                      actionLower.includes("order")
                    ) {
                      Icon = FiShoppingCart;
                      iconColor = "text-green-600";
                      bgColor = "bg-green-100";
                    }

                    return (
                      <div
                        key={index}
                        className="flex items-start px-4 py-3 hover:bg-background/70 transition-colors"
                      >
                        <div
                          className={`shrink-0 h-8 w-8 rounded-full ${bgColor} flex items-center justify-center mr-3`}
                        >
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium truncate">
                              {activity.action}
                              {activity.item && (
                                <span className="font-semibold ml-1">
                                  {activity.item}
                                </span>
                              )}
                            </p>
                            {isValidDate && (
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {date.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                          {isValidDate && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {date.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year:
                                  date.getFullYear() !==
                                  new Date().getFullYear()
                                    ? "numeric"
                                    : undefined,
                              })}
                            </p>
                          )}
                          {activity.user && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              by {activity.user}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - 4/12 width on large screens */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Inventory Alerts */}
          <div className="bg-card rounded-xl border shadow-xs hover:shadow-md transition-all overflow-hidden h-[200px] flex flex-col">
            <div className="p-4 border-b bg-amber-50/50 flex items-center justify-between shrink-0">
              <h2 className="font-semibold text-amber-800 flex items-center">
                <FiAlertTriangle className="h-4 w-4 mr-2" />
                Inventory Alerts
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-700 hover:text-amber-800 hover:bg-amber-100/50"
                onClick={() => router.push("/inventory?filter=alerts")}
              >
                View All
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow p-2">
              <ExpiryAlerts compact={true} />
            </div>
          </div>

          {/* Inventory by Category */}
          {categoryStats.length > 0 ? (
            <div className="bg-card rounded-xl border shadow-xs hover:shadow-md transition-all overflow-hidden h-[200px] flex flex-col">
              <div className="p-3 border-b flex items-center justify-between shrink-0">
                <h2 className="font-medium">Inventory by Category</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/inventory")}
                >
                  View All
                </Button>
              </div>
              <div className="overflow-y-auto flex-grow p-3">
                <div className="space-y-2">
                  {categoryStats.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 rounded-md bg-background/50 hover:bg-background transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${category.color}`}>
                          <CategoryIcon categoryName={category.iconName} />
                        </div>
                        <span className="font-medium text-sm">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {category.count} items
                        </Badge>
                        <span
                          className={`text-xs ${
                            category.change > 0
                              ? "text-green-600"
                              : category.change < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {category.change > 0 ? "+" : ""}
                          {category.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border shadow-xs p-4 flex items-center justify-center h-[200px]">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Loading category data...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
