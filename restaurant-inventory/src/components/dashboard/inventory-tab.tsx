"use client";

import { useMemo } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiPackage,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { CategoryIcon } from "./CategoryIcon";
import { Button } from "@/components/ui/button";

interface InventoryTabProps {
  searchQuery?: string;
}

export function InventoryTab({ searchQuery = "" }: InventoryTabProps) {
  const {
    inventoryAlerts,
    categoryStats,
    isLoading,
    error,
    refresh,
    hasData,
    dataState,
  } = useDashboard();

  // Define valid data state types
  type DataState = "fresh" | "aging" | "stale";

  // Cast dataState to the correct type
  const typedDataState = dataState as DataState;

  // Format category stats for display - memoized for performance
  const formattedCategoryStats = useMemo(() => {
    if (!Array.isArray(categoryStats) || categoryStats.length === 0) return [];

    const maxCount = Math.max(...categoryStats.map((c) => c.count)) || 1;

    return categoryStats.map((cat) => ({
      ...cat,
      percentage:
        (cat as { percentage?: number }).percentage ||
        Math.round((cat.count / maxCount) * 100),
    }));
  }, [categoryStats]);

  // Filter inventory alerts based on search query - memoized
  const filteredAlerts = useMemo(() => {
    if (!searchQuery) return inventoryAlerts;

    const query = searchQuery.toLowerCase();
    return inventoryAlerts.filter((alert) =>
      alert.name.toLowerCase().includes(query)
    );
  }, [inventoryAlerts, searchQuery]);

  // Filter category stats based on search query - memoized
  const filteredCategoryStats = useMemo(() => {
    if (!searchQuery) return formattedCategoryStats;

    const query = searchQuery.toLowerCase();
    return formattedCategoryStats.filter((stat) =>
      stat.name.toLowerCase().includes(query)
    );
  }, [formattedCategoryStats, searchQuery]);

  // Data freshness indicator
  const freshnessBadge = useMemo(() => {
    if (!typedDataState) return null;

    const badgeClasses: Record<DataState, string> = {
      fresh: "bg-green-100 text-green-800 text-xs",
      aging: "bg-yellow-100 text-yellow-800 text-xs",
      stale: "bg-red-100 text-red-800 text-xs",
    };

    const badgeText: Record<DataState, string> = {
      fresh: "Fresh",
      aging: "Updating",
      stale: "Stale",
    };

    return (
      <span className={`ml-2 badge badge-sm ${badgeClasses[typedDataState]}`}>
        {badgeText[typedDataState]}
      </span>
    );
  }, [typedDataState]);

  // Loading state
  if (isLoading && !hasData) {
    return (
      <div className="space-y-8" aria-busy="true" aria-live="polite">
        <div className="grid gap-6 md:grid-cols-2 animate-pulse">
          <div
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-[400px]"
            aria-hidden="true"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-[400px]"
            aria-hidden="true"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="alert alert-error shadow-lg bg-white border border-red-500"
        role="alert"
        aria-live="assertive"
      >
        <div>
          <FiAlertTriangle
            className="h-6 w-6 text-red-500"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-bold text-black">
              Error Loading Inventory Data
            </h3>
            <div className="text-xs text-black">
              {typeof error === "string"
                ? error
                : "Failed to load inventory data. Please try again."}
            </div>
          </div>
        </div>
        <div className="flex-none">
          <Button
            onClick={() => refresh()}
            size="sm"
            variant="outline"
            className="bg-white text-black border border-gray-300 hover:bg-gray-100"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!hasData) {
    return (
      <div
        className="card bg-white shadow-md border border-gray-200"
        aria-live="polite"
      >
        <div className="card-body items-center text-center">
          <div className="avatar placeholder">
            <div className="bg-gray-100 text-black rounded-full w-16 h-16">
              <FiPackage className="h-8 w-8" aria-hidden="true" />
            </div>
          </div>
          <h2 className="card-title text-black">No Inventory Data Available</h2>
          <p className="text-black">
            There&apos;s no inventory data to display at this time.
          </p>
          <div className="card-actions justify-center mt-4">
            <Button
              onClick={() => refresh()}
              size="sm"
              variant="primary"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Inventory Alerts and Category Stats */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Inventory Alerts */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-black">
              Inventory Alerts
              {freshnessBadge}
            </h3>
            <div className="text-sm text-gray-500">
              {filteredAlerts.length}{" "}
              {filteredAlerts.length === 1 ? "Alert" : "Alerts"}
            </div>
          </div>

          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-md ${
                          alert.type === "low_stock"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-red-100 text-red-600"
                        }`}
                        aria-hidden="true"
                      >
                        {alert.type === "low_stock" ? (
                          <FiAlertTriangle className="h-5 w-5" />
                        ) : (
                          <FiCalendar className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-black">{alert.name}</h4>
                        <p className="text-sm text-gray-600">
                          {alert.type === "low_stock"
                            ? `Current: ${alert.currentStock} (Min: ${alert.reorderLevel})`
                            : `Expires: ${new Date(
                                alert.expiryDate || ""
                              ).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                      aria-label={`View details for ${alert.name}`}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8">
              <div className="avatar placeholder mb-4">
                <div
                  className="bg-gray-100 text-gray-600 rounded-full w-16 h-16 mx-auto"
                  aria-hidden="true"
                >
                  <FiAlertTriangle className="h-8 w-8" />
                </div>
              </div>
              <h4 className="font-medium text-black mb-2">
                No Matching Alerts
              </h4>
              <p className="text-sm text-gray-600">
                No inventory alerts match your search for &quot;{searchQuery}
                &quot;.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="avatar placeholder mb-4">
                <div
                  className="bg-green-100 text-green-600 rounded-full w-16 h-16 mx-auto"
                  aria-hidden="true"
                >
                  <FiPackage className="h-8 w-8" />
                </div>
              </div>
              <h4 className="font-medium text-black mb-2">No Alerts</h4>
              <p className="text-sm text-gray-600">
                Your inventory is in good shape! No alerts at this time.
              </p>
            </div>
          )}

          <div className="mt-6 text-right">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-orange-500 text-sm font-medium flex items-center justify-end hover:underline p-0"
            >
              <a href="/inventory" aria-label="View all inventory items">
                View All Inventory
                <FiArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-black">
              Category Distribution
              {freshnessBadge}
            </h3>
            <div className="text-sm text-gray-500">
              {filteredCategoryStats.length}{" "}
              {filteredCategoryStats.length === 1 ? "Category" : "Categories"}
            </div>
          </div>

          {filteredCategoryStats.length > 0 ? (
            <div className="space-y-4">
              {filteredCategoryStats.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CategoryIcon
                        category={category.name}
                        className="mr-2 text-orange-500"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {category.count} items
                      </span>
                      <span className="text-sm font-medium">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={category.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${category.name}: ${category.percentage}%`}
                  >
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8">
              <div className="avatar placeholder mb-4">
                <div
                  className="bg-gray-100 text-gray-600 rounded-full w-16 h-16 mx-auto"
                  aria-hidden="true"
                >
                  <FiPackage className="h-8 w-8" />
                </div>
              </div>
              <h4 className="font-medium text-black mb-2">
                No Matching Categories
              </h4>
              <p className="text-sm text-gray-600">
                No categories match your search for &quot;{searchQuery}&quot;.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="avatar placeholder mb-4">
                <div
                  className="bg-gray-100 text-gray-600 rounded-full w-16 h-16 mx-auto"
                  aria-hidden="true"
                >
                  <FiPackage className="h-8 w-8" />
                </div>
              </div>
              <h4 className="font-medium text-black mb-2">No Categories</h4>
              <p className="text-sm text-gray-600">
                No inventory categories have been defined yet.
              </p>
            </div>
          )}

          <div className="mt-6 text-right">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-orange-500 text-sm font-medium flex items-center justify-end hover:underline p-0"
            >
              <a
                href="/inventory/categories"
                aria-label="Manage inventory categories"
              >
                Manage Categories
                <FiArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Inventory Value Over Time Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-black">
            Inventory Value Over Time
            {freshnessBadge}
          </h3>
          <div className="text-sm text-gray-500">Last 30 days</div>
        </div>

        <div
          className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300"
          aria-label="Chart placeholder - feature coming soon"
        >
          <div className="text-center">
            <div className="avatar placeholder mb-4">
              <div
                className="bg-gray-100 text-gray-600 rounded-full w-16 h-16 mx-auto"
                aria-hidden="true"
              >
                <FiPackage className="h-8 w-8" />
              </div>
            </div>
            <h4 className="font-medium text-black mb-2">Chart Coming Soon</h4>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              We&apos;re working on adding inventory value tracking over time.
              Check back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
