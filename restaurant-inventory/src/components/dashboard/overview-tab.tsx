"use client";

import {
  FiPackage,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import { CiMoneyBill } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
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

export function OverviewTab() {
  const {
    categoryStats,
    isLoading,
    error,
    refresh,
    hasData,
    currencySymbol = "SEK",
  } = useDashboard();

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
            className="card bg-white shadow-md h-[400px] animate-pulse"
          >
            <div className="skeleton h-full bg-gray-100"></div>
          </div>
          <div
            key="category-skeleton"
            className="card bg-white shadow-md h-[400px] animate-pulse"
          >
            <div className="skeleton h-full bg-gray-100"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg bg-white border border-red-500">
        <div>
          <FiAlertTriangle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-bold text-black">Error Loading Dashboard</h3>
            <div className="text-xs text-black">
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
            className="bg-white text-black border border-gray-300 hover:bg-gray-100"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="card bg-white shadow-md border border-gray-200">
        <div className="card-body items-center text-center">
          <div className="avatar placeholder">
            <div className="bg-gray-100 text-black rounded-full w-16 h-16">
              <FiPackage className="h-8 w-8" />
            </div>
          </div>
          <h2 className="card-title text-black">No Data Available</h2>
          <p className="text-black">
            There&apos;s no dashboard data to display at this time.
          </p>
          <div className="card-actions justify-center mt-4">
            <Button onClick={() => refresh()} size="sm" variant="primary" className="bg-orange-500 hover:bg-orange-600 text-white">
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory Value"
          value={`${currencySymbol}755.00`}
          icon={<FiPackage className="h-5 w-5" />}
          variant="primary"
          trend={{
            value: 12,
            isPositive: true,
          }}
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        />
        <StatCard
          title="Low Stock Items"
          value="2"
          icon={<FiAlertTriangle className="h-5 w-5" />}
          variant="warning"
          trend={{
            value: 15,
            isPositive: false,
          }}
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        />
        <StatCard
          title="Monthly Sales"
          value={`${currencySymbol}13021.00`}
          icon={<CiMoneyBill className="h-5 w-5" />}
          variant="info"
          trend={{
            value: 100,
            isPositive: true,
          }}
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        />
        <StatCard
          title="Sales Growth"
          value="+100%"
          icon={<FiTrendingUp className="h-5 w-5" />}
          variant="success"
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        />
      </div>

      {/* Sales Growth and Category Distribution */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Sales Growth Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-black">Sales Growth</h3>
              <p className="text-sm text-gray-500">Monthly sales performance analysis</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>Last 30 days</span>
              <FiClock className="ml-1 h-4 w-4" />
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="text-2xl font-bold text-black">+0%</div>
            <div className="text-sm text-gray-500 ml-2">vs last period</div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-black mb-2">Top Sales Channels</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Online Store</span>
                </div>
                <span className="text-sm font-medium">SEK 8,400.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  <span className="text-sm">In-Store</span>
                </div>
                <span className="text-sm font-medium">SEK 6,200.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm">Wholesale</span>
                </div>
                <span className="text-sm font-medium">SEK 4,800.00</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-black mb-2">Top Products</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">Product A</span>
                </div>
                <span className="text-sm font-medium">245</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Product B</span>
                </div>
                <span className="text-sm font-medium">187</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Product C</span>
                </div>
                <span className="text-sm font-medium">143</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-black">Category Distribution</h3>
            <div className="text-sm text-gray-500">{enrichedCategoryStats.length} Categories</div>
          </div>
          
          <div className="space-y-4">
            {enrichedCategoryStats.length > 0 ? (
              enrichedCategoryStats.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CategoryIcon 
                        category={category.name} 
                        className="mr-2 text-orange-500" 
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div>
                {/* Sample category data for preview */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CategoryIcon 
                        category="Beverages" 
                        className="mr-2 text-orange-500" 
                      />
                      <span className="text-sm font-medium">Beverages</span>
                    </div>
                    <span className="text-sm font-medium">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CategoryIcon 
                        category="Produce" 
                        className="mr-2 text-orange-500" 
                      />
                      <span className="text-sm font-medium">Produce</span>
                    </div>
                    <span className="text-sm font-medium">17%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '17%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total: <span className="font-medium">{enrichedCategoryStats.reduce((acc, cat) => acc + cat.count, 0) || 6} items</span>
            </div>
            <a href="#" className="text-orange-500 text-sm font-medium flex items-center hover:underline">
              View Details
              <FiArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
