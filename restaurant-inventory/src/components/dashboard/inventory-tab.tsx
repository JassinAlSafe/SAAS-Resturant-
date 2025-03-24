"use client";

import { FiAlertTriangle, FiCalendar, FiPackage, FiArrowRight } from "react-icons/fi";
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
  } = useDashboard();

  // Format category stats for display
  const formattedCategoryStats = Array.isArray(categoryStats)
    ? categoryStats.map((cat) => ({
        ...cat,
        percentage:
          (cat as { percentage?: number }).percentage ||
          Math.round(
            (cat.count / Math.max(...categoryStats.map((c) => c.count))) * 100
          ),
      }))
    : [];

  // Filter inventory alerts based on search query
  const filteredAlerts = searchQuery 
    ? inventoryAlerts.filter(alert => 
        alert.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : inventoryAlerts;

  // Filter category stats based on search query
  const filteredCategoryStats = searchQuery
    ? formattedCategoryStats.filter(stat => 
        stat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : formattedCategoryStats;

  // Loading state
  if (isLoading && !hasData) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 animate-pulse">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-[400px]">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-[400px]">
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
      <div className="alert alert-error shadow-lg bg-white border border-red-500">
        <div>
          <FiAlertTriangle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-bold text-black">Error Loading Inventory Data</h3>
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
            <span className="mr-2">Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!hasData) {
    return (
      <div className="card bg-white shadow-md border border-gray-200">
        <div className="card-body items-center text-center">
          <div className="avatar placeholder">
            <div className="bg-gray-100 text-black rounded-full w-16 h-16">
              <FiPackage className="h-8 w-8" />
            </div>
          </div>
          <h2 className="card-title text-black">No Inventory Data Available</h2>
          <p className="text-black">
            There&apos;s no inventory data to display at this time.
          </p>
          <div className="card-actions justify-center mt-4">
            <Button onClick={() => refresh()} size="sm" variant="primary" className="bg-orange-500 hover:bg-orange-600 text-white">
              <span className="mr-2">Refresh</span>
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
            <h3 className="text-lg font-medium text-black">Inventory Alerts</h3>
            <div className="text-sm text-gray-500">
              {filteredAlerts.length} {filteredAlerts.length === 1 ? "Alert" : "Alerts"}
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
                      <div className={`p-2 rounded-md ${alert.type === 'low_stock' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                        {alert.type === 'low_stock' ? (
                          <FiAlertTriangle className="h-5 w-5" />
                        ) : (
                          <FiCalendar className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-black">{alert.name}</h4>
                        <p className="text-sm text-gray-600">
                          {alert.type === 'low_stock' 
                            ? `Current: ${alert.currentStock} (Min: ${alert.reorderLevel})` 
                            : `Expires: ${new Date(alert.expiryDate || "").toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
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
                <div className="bg-gray-100 text-gray-600 rounded-full w-16 h-16 mx-auto">
                  <FiAlertTriangle className="h-8 w-8" />
                </div>
              </div>
              <h4 className="font-medium text-black mb-2">No Matching Alerts</h4>
              <p className="text-sm text-gray-600">
                No inventory alerts match your search for &quot;{searchQuery}&quot;.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="avatar placeholder mb-4">
                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 mx-auto">
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
            <a
              href="/inventory"
              className="text-orange-500 text-sm font-medium flex items-center justify-end hover:underline"
            >
              View All Inventory
              <FiArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-black">Category Distribution</h3>
            <div className="text-sm text-gray-500">
              {filteredCategoryStats.length} {filteredCategoryStats.length === 1 ? "Category" : "Categories"}
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
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">{category.count} items</span>
                      <span className="text-sm font-medium">{category.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
                <div className="bg-gray-100 text-gray-600 rounded-full w-16 h-16 mx-auto">
                  <FiPackage className="h-8 w-8" />
                </div>
              </div>
              <h4 className="font-medium text-black mb-2">No Matching Categories</h4>
              <p className="text-sm text-gray-600">
                No categories match your search for &quot;{searchQuery}&quot;.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="avatar placeholder mb-4">
                <div className="bg-gray-100 text-gray-600 rounded-full w-16 h-16 mx-auto">
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
            <a
              href="/inventory/categories"
              className="text-orange-500 text-sm font-medium flex items-center justify-end hover:underline"
            >
              Manage Categories
              <FiArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Inventory Value Over Time Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-black">Inventory Value Over Time</h3>
          <div className="text-sm text-gray-500">Last 30 days</div>
        </div>
        
        <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="text-center">
            <div className="avatar placeholder mb-4">
              <div className="bg-gray-100 text-gray-600 rounded-full w-16 h-16 mx-auto">
                <FiPackage className="h-8 w-8" />
              </div>
            </div>
            <h4 className="font-medium text-black mb-2">Chart Coming Soon</h4>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              We&apos;re working on adding inventory value tracking over time. Check back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
