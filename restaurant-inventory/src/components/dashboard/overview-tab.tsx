"use client";

import { useRouter } from "next/navigation";
import {
  FiPackage,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
  FiShoppingBag,
  FiBarChart2,
  FiUsers,
  FiArrowRight,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import { CiMoneyBill } from "react-icons/ci";
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

// Define interfaces for our data types
interface RecentActivity {
  id: string;
  type?: string;
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
    currencySymbol = "$"
  } = useDashboard();

  // Helper function for number formatting
  const formatNumber = (num: number | string): string => {
    if (typeof num === 'string') {
      // If it\'s already a string, assume it\'s already formatted
      return num.replace(/[^0-9.]/g, ''); // Remove any non-numeric characters except decimal
    }
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading && !hasData) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="h-[400px] rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-[400px] rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-8 text-center">
        <FiAlertTriangle className="mx-auto h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-red-600 max-w-md mx-auto">
          {typeof error === 'string' ? error : "Failed to load dashboard data. Please try again."}
        </p>
        <Button 
          onClick={() => refresh()} 
          className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
          size="sm"
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!formattedStats) {
    return (
      <div className="text-center p-8 rounded-xl bg-slate-50 border border-slate-200">
        <FiPackage className="mx-auto h-10 w-10 text-slate-400 mb-4" />
        <p className="text-slate-500 mb-4">No data available</p>
        <Button onClick={() => refresh()} className="mt-2" size="sm">
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  const { totalInventoryValue, lowStockItems, monthlySales, salesGrowth } = formattedStats;
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
          variant={parseInt(lowStockItems.toString()) > 5 ? "warning" : "default"}
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
        />
        <StatCard
          title="Sales Growth"
          value={`${salesGrowth}%`}
          icon={<FiTrendingUp className="h-5 w-5" />}
          variant={salesGrowthValue >= 0 ? "success" : "warning"}
          trend={{
            value: salesGrowthValue,
            isPositive: salesGrowthValue >= 0,
          }}
        />
      </div>

      {/* Charts and Analysis */}
      <div className="grid gap-8 grid-cols-1">
        <SalesGrowthCard 
          title="Sales Growth"
          dateRange="Last 30 days"
          salesData={salesData}
          growthPercent={salesGrowthValue}
          viewAllLink="/reports/sales"
          className="w-full"
        />

        <div className="rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 group h-full relative overflow-hidden">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>
          
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-3 transition-transform group-hover:scale-110 duration-300">
                  <FiClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800">Expiry Alerts</p>
                  <p className="text-xs text-slate-500">Items expiring soon</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => router.push('/inventory?filter=expiring-soon')}
              >
                View All
                <FiArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <ExpiryAlerts />
            
            {/* Hover effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-30 transition-opacity"></div>
              <div className="absolute inset-[-100%] top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500"></div>
        
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-3 transition-transform group-hover:scale-110 duration-300">
                <FiBarChart2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">Inventory by Category</p>
                <p className="text-xs text-slate-500">Distribution of your inventory</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => router.push('/inventory')}
            >
              View Inventory
              <FiArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
            {categoryStats && categoryStats.length > 0 ? (
              categoryStats.map((category, index) => (
                <div 
                  key={index}
                  className="flex items-center p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                  onClick={() => router.push(`/inventory?category=${encodeURIComponent(category.name)}`)}
                  role="button"
                >
                  <div className="mr-3 bg-white p-2 rounded-full">
                    <CategoryIcon categoryName={category.name} className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{category.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">{category.count} items</p>
                      <p className="text-xs font-medium text-slate-700">{currencySymbol}{formatNumber(category.count * 100)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center p-8">
                <p className="text-slate-500">No category data available</p>
              </div>
            )}
          </div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute inset-[-100%] top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500"></div>
        
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-3 transition-transform group-hover:scale-110 duration-300">
                <FiActivity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">Recent Activity</p>
                <p className="text-xs text-slate-500">Latest inventory changes</p>
              </div>
            </div>
          </div>
          
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {(recentActivity as RecentActivity[]).map((activity, index) => {
                // Determine activity type based on action or description
                const activityType = activity.action?.toLowerCase().includes('add') ? 'add' : 
                                    activity.action?.toLowerCase().includes('remove') ? 'remove' : 'other';
                
                return (
                  <div 
                    key={activity.id || index} 
                    className="flex items-start p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`p-2 rounded-full mr-3 ${
                      activityType === 'add' ? 'bg-emerald-100 text-emerald-600' :
                      activityType === 'remove' ? 'bg-rose-100 text-rose-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activityType === 'add' ? (
                        <FiPackage className="h-4 w-4" />
                      ) : activityType === 'remove' ? (
                        <FiShoppingBag className="h-4 w-4" />
                      ) : (
                        <FiUsers className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">
                        {activity.user ? `${activity.user} ` : ''}{activity.action || ''} {activity.item || ''}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : 'Recently'}
                        </p>
                        {activity.amount && (
                          <Badge variant="outline" className="text-xs">
                            {currencySymbol}{formatNumber(activity.amount)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-slate-500">No recent activity</p>
            </div>
          )}
          
          {/* Hover effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute inset-[-100%] top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
