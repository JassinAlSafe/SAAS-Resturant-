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
          <h2 className="text-2xl font-bold tracking-tight">
            Executive Dashboard
          </h2>
          <p className="text-base-content text-opacity-60">
            High-level overview of your restaurant&apos;s performance
          </p>
        </div>

        <div
          className="tooltip"
          data-tip="Coming soon: Export dashboard as PDF"
        >
          <button className="btn btn-outline gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main metrics and charts - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Critical Items Panel with improved visual feedback */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 p-1.5 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <h3 className="card-title text-lg font-semibold">
                    Critical Inventory Items
                  </h3>
                </div>
                <div className="badge badge-outline">
                  {inventoryData.criticalItems.length} items
                </div>
              </div>
              <p className="text-base-content text-opacity-60">
                Items requiring immediate attention
              </p>

              <div className="pb-1">
                {inventoryData.criticalItems.length > 0 ? (
                  <div className="space-y-4">
                    {inventoryData.criticalItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-base-200 bg-opacity-50 rounded-lg border border-base-300"
                      >
                        <div className="mb-3 sm:mb-0">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-base-content text-opacity-60 flex items-center gap-1">
                            {item.depleted ? (
                              <div className="badge badge-error badge-sm font-normal">
                                Depleted
                              </div>
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
                            <div className="flex justify-between items-center mb-1 text-xs">
                              <span>Risk Level</span>
                              <span>
                                {calculateRisk(item.depleted, item.warning)}%
                              </span>
                            </div>
                            <progress
                              className={`progress ${
                                item.depleted
                                  ? "progress-error"
                                  : item.warning
                                  ? "progress-warning"
                                  : "progress-warning"
                              } w-full h-2`}
                              value={calculateRisk(item.depleted, item.warning)}
                              max="100"
                            ></progress>
                          </div>
                          <Link
                            href={`/inventory?search=${encodeURIComponent(
                              item.name
                            )}`}
                          >
                            <button className="btn btn-outline btn-sm ml-auto">
                              View
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-base-content text-opacity-60">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <p>No critical inventory items</p>
                    <p className="text-sm text-base-content text-opacity-60">
                      All inventory levels are within acceptable ranges
                    </p>
                  </div>
                )}
              </div>
              <div className="card-actions justify-center pt-0 border-t mt-2">
                <Link href="/inventory?filter=critical" className="w-full">
                  <button className="btn btn-ghost btn-sm text-xs w-full">
                    View All Critical Items
                    <ChevronRight className="ml-2 h-3 w-3" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Top Selling Dishes with visual engagement scores */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-1.5 rounded-md">
                    <Utensils className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="card-title text-lg font-semibold">
                    Top Selling Dishes
                  </h3>
                </div>
                <div className="badge badge-outline">
                  {topDishes.length} dishes
                </div>
              </div>
              <p className="text-base-content text-opacity-60">
                Highest performing menu items
              </p>

              <div className="pb-1">
                {topDishes.length > 0 ? (
                  <div className="space-y-4">
                    {topDishes.map((dish, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-base-200 bg-opacity-50 rounded-lg border border-base-300"
                      >
                        <div className="mb-3 sm:mb-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{dish}</span>
                            {index === 0 && (
                              <div className="badge bg-amber-100 text-amber-800">
                                <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                                Best Seller
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-base-content text-opacity-60">
                            #{index + 1} in sales ranking
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-full sm:w-24">
                            <div className="flex justify-between items-center mb-1 text-xs">
                              <span>Popularity</span>
                              <span>{calculatePopularity(index)}%</span>
                            </div>
                            <progress
                              className={`progress ${
                                index === 0
                                  ? "progress-primary"
                                  : "progress-info"
                              } w-full h-2`}
                              value={calculatePopularity(index)}
                              max="100"
                            ></progress>
                          </div>
                          <div
                            className="tooltip"
                            data-tip="View detailed sales metrics"
                          >
                            <button className="btn btn-outline btn-sm ml-auto">
                              Analyze
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-base-content text-opacity-60">
                    <p>No sales data available</p>
                    <p className="text-sm text-base-content text-opacity-60">
                      Start recording sales to see your top dishes
                    </p>
                  </div>
                )}
              </div>
              <div className="card-actions justify-center pt-0 border-t mt-2">
                <Link href="/sales" className="w-full">
                  <button className="btn btn-ghost btn-sm text-xs w-full">
                    View Complete Sales Analysis
                    <ChevronRight className="ml-2 h-3 w-3" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel with quick stats and actions - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats in condensed side panel */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg font-semibold">Key Metrics</h3>
              <p className="text-base-content text-opacity-60">
                Overall performance snapshot
              </p>

              <div className="space-y-5">
                {/* Current sales metric */}
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">Total Sales</div>
                    <div className="text-sm font-medium">
                      {formatCurrency(salesData.currentSales)}
                    </div>
                  </div>
                  <div className="bg-base-300 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="text-xs text-base-content text-opacity-60">
                      Previous: {formatCurrency(salesData.previousSales)}
                    </div>
                    <div className="flex items-center">
                      {salesData.salesGrowth >= 0 ? (
                        <div className="badge badge-sm badge-outline bg-green-50 text-green-700 border-0 text-xs font-normal">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          {salesData.salesGrowth.toFixed(1)}%
                        </div>
                      ) : (
                        <div className="badge badge-sm badge-outline bg-red-50 text-red-700 border-0 text-xs font-normal">
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                          {Math.abs(salesData.salesGrowth).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* Profit margin metric */}
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">Profit Margin</div>
                    <div className="text-sm font-medium">
                      {salesData.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-base-300 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-success h-full rounded-full"
                      style={{ width: `${salesData.profitMargin}%` }}
                    ></div>
                  </div>
                  <div className="mt-1">
                    <div className="text-xs text-base-content text-opacity-60">
                      Based on cost and revenue analysis
                    </div>
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* Inventory metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Low stock card */}
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-amber-800 text-xs font-medium">
                        Low Stock
                      </div>
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                    </div>
                    <div className="text-xl font-semibold text-amber-800">
                      {inventoryData.lowStockCount}
                    </div>
                    <Link
                      href="/inventory?filter=low-stock"
                      className="text-xs text-amber-800 hover:underline flex items-center mt-1"
                    >
                      View items
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>

                  {/* Out of stock card */}
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-red-800 text-xs font-medium">
                        Out of Stock
                      </div>
                      <ShoppingCart className="h-3 w-3 text-red-600" />
                    </div>
                    <div className="text-xl font-semibold text-red-800">
                      {inventoryData.outOfStockCount}
                    </div>
                    <Link
                      href="/shopping-list"
                      className="text-xs text-red-800 hover:underline flex items-center mt-1"
                    >
                      Shopping list
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-outline w-full">
                  Generate Full Report
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg font-semibold">
                Quick Actions
              </h3>
              <p className="text-base-content text-opacity-60">
                Common management tasks
              </p>
              <div className="space-y-3">
                <Link href="/inventory/create" className="w-full">
                  <button className="btn btn-outline w-full justify-between">
                    Add New Inventory Item
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Link>

                <Link href="/shopping-list" className="w-full">
                  <button className="btn btn-outline w-full justify-between">
                    Manage Shopping List
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Link>

                <Link href="/settings" className="w-full">
                  <button className="btn btn-outline w-full justify-between">
                    Update Alert Thresholds
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for empty state
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
