import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  Info,
  ChevronRight,
  Utensils,
  ClipboardList,
  Star,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface ExecutiveDashboardProps {
  salesData: {
    currentSales: number;
    previousSales: number;
    salesGrowth: number;
    profitMargin: number;
  };
  inventoryData: {
    lowStockCount: number;
    outOfStockCount: number;
    criticalItems: Array<{
      name: string;
      depletion: string;
      depleted: boolean;
      warning: boolean;
    }>;
  };
  topDishes: string[];
  formatCurrency: (value: number) => string;
}

export function ExecutiveDashboard({
  salesData,
  inventoryData,
  topDishes,
  formatCurrency,
}: ExecutiveDashboardProps) {
  // Calculate random scores for demonstration purposes
  const calculateRisk = (depleted: boolean, warning: boolean) => {
    if (depleted) return 100;
    if (warning) return Math.floor(Math.random() * 30) + 60; // 60-90%
    return Math.floor(Math.random() * 30) + 20; // 20-50%
  };

  // Calculate random popularity scores for dishes
  const calculatePopularity = (index: number) => {
    const baseScore = 100 - index * 10;
    return Math.max(40, baseScore); // Ensures minimum score of 40%
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Executive Dashboard
          </h2>
          <p className="text-gray-500 text-sm">
            High-level overview of your restaurant&apos;s performance
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <ClipboardList className="h-4 w-4 text-gray-500" />
          <span>Generate Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main metrics and charts - 3/4 width */}
        <div className="lg:col-span-8 space-y-6">
          {/* Critical Items Panel with improved visual feedback */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <h3 className="font-medium text-lg text-gray-900">
                    Critical Inventory Items
                  </h3>
                </div>
                <div className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {inventoryData.criticalItems.length} items
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Items requiring immediate attention
              </p>
            </div>
            <div className="p-5">
              {inventoryData.criticalItems.length > 0 ? (
                <div className="space-y-3">
                  {inventoryData.criticalItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="mb-2 sm:mb-0">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          {item.depleted ? (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                              Depleted
                            </span>
                          ) : (
                            <>
                              <span>Depleted in {item.depletion}</span>
                              {item.warning && (
                                <Info className="h-3 w-3 text-amber-500" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-full sm:w-24">
                          <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
                            <span>Risk</span>
                            <span>
                              {calculateRisk(item.depleted, item.warning)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.depleted
                                  ? "bg-red-500"
                                  : item.warning
                                  ? "bg-amber-500"
                                  : "bg-amber-400"
                              }`}
                              style={{
                                width: `${calculateRisk(
                                  item.depleted,
                                  item.warning
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        <Link
                          href={`/inventory?search=${encodeURIComponent(
                            item.name
                          )}`}
                        >
                          <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center">
                  <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-gray-900 font-medium">
                    No critical inventory items
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    All inventory levels are within acceptable ranges
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <Link href="/inventory?filter=critical" className="w-full">
                <button className="w-full text-sm text-gray-500 hover:text-orange-500 transition-colors flex items-center justify-center">
                  View All Critical Items
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Top Selling Dishes with visual engagement scores */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-50 rounded-lg">
                    <Utensils className="h-4 w-4 text-orange-500" />
                  </div>
                  <h3 className="font-medium text-lg text-gray-900">
                    Top Selling Dishes
                  </h3>
                </div>
                <div className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {topDishes.length} dishes
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Highest performing menu items
              </p>
            </div>
            <div className="p-5">
              {topDishes.length > 0 ? (
                <div className="space-y-3">
                  {topDishes.map((dish, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {dish}
                          </span>
                          {index === 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-xs font-medium rounded-full">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              Best Seller
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{index + 1} in sales ranking
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-full sm:w-24">
                          <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
                            <span>Popularity</span>
                            <span>{calculatePopularity(index)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                index === 0 ? "bg-orange-500" : "bg-orange-400"
                              }`}
                              style={{
                                width: `${calculatePopularity(index)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          Analyze
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center">
                  <p className="text-gray-900 font-medium">
                    No sales data available
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start recording sales to see your top dishes
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <Link href="/sales" className="w-full">
                <button className="w-full text-sm text-gray-500 hover:text-orange-500 transition-colors flex items-center justify-center">
                  View Complete Sales Analysis
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Side panel with quick stats and actions - 1/4 width */}
        <div className="lg:col-span-4 space-y-6">
          {/* Key Metrics */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-medium text-lg text-gray-900">Key Metrics</h3>
              <p className="text-sm text-gray-500 mt-1">
                Overall performance snapshot
              </p>
            </div>
            <div className="p-5 space-y-5">
              {/* Total Sales metric */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    Total Sales
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(salesData.currentSales)}
                  </div>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-xs text-gray-500">
                    Previous: {formatCurrency(salesData.previousSales)}
                  </div>
                  <div className="flex items-center">
                    {salesData.salesGrowth >= 0 ? (
                      <div className="flex items-center px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs">
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                        {salesData.salesGrowth.toFixed(1)}%
                      </div>
                    ) : (
                      <div className="flex items-center px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs">
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                        {Math.abs(salesData.salesGrowth).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* Profit margin metric */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    Profit Margin
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {salesData.profitMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${salesData.profitMargin}%` }}
                  ></div>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-gray-500">
                    Based on cost and revenue analysis
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* Inventory metrics */}
              <div className="grid grid-cols-2 gap-4">
                {/* Low stock card */}
                <div className="p-3 bg-white border border-amber-100 rounded-xl flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-amber-800 text-xs font-medium">
                      Low Stock
                    </div>
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {inventoryData.lowStockCount}
                  </div>
                  <Link
                    href="/inventory?filter=low-stock"
                    className="text-xs text-amber-600 hover:text-amber-700 flex items-center mt-2"
                  >
                    View items
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>

                {/* Out of stock card */}
                <div className="p-3 bg-white border border-red-100 rounded-xl flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-red-800 text-xs font-medium">
                      Out of Stock
                    </div>
                    <ShoppingCart className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {inventoryData.outOfStockCount}
                  </div>
                  <Link
                    href="/shopping-list"
                    className="text-xs text-red-600 hover:text-red-700 flex items-center mt-2"
                  >
                    Shopping list
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100">
              <button className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                Generate Full Report
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-medium text-lg text-gray-900">
                Quick Actions
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Common management tasks
              </p>
            </div>
            <div className="p-3">
              <Link href="/inventory/new">
                <button className="w-full p-3 flex items-center justify-between text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="font-medium">Add New Inventory Item</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </Link>
              <Link href="/shopping-list">
                <button className="w-full p-3 flex items-center justify-between text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="font-medium">Manage Shopping List</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </Link>
              <Link href="/settings/alerts">
                <button className="w-full p-3 flex items-center justify-between text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="font-medium">Update Alert Thresholds</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
