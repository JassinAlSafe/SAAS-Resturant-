import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

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
          <p className="text-muted-foreground">
            High-level overview of your restaurant\'s performance
          </p>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                <span>Generate Report</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Coming soon: Export dashboard as PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main metrics and charts - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Critical Items Panel with improved visual feedback */}
          <Card className="overflow-hidden shadow-sm border border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 p-1.5 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    Critical Inventory Items
                  </CardTitle>
                </div>
                <Badge variant="outline" className="font-normal">
                  {inventoryData.criticalItems.length} items
                </Badge>
              </div>
              <CardDescription>
                Items requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-1">
              {inventoryData.criticalItems.length > 0 ? (
                <div className="space-y-4">
                  {inventoryData.criticalItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-muted/50 rounded-lg border border-border/30"
                    >
                      <div className="mb-3 sm:mb-0">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {item.depleted ? (
                            <Badge
                              variant="destructive"
                              className="font-normal text-xs"
                            >
                              Depleted
                            </Badge>
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
                          <Progress
                            value={calculateRisk(item.depleted, item.warning)}
                            className="h-2"
                            indicatorClassName={
                              item.depleted
                                ? "bg-red-600"
                                : item.warning
                                ? "bg-amber-500"
                                : "bg-amber-400"
                            }
                          />
                        </div>
                        <Link
                          href={`/inventory?search=${encodeURIComponent(
                            item.name
                          )}`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <p>No critical inventory items</p>
                  <p className="text-sm text-muted-foreground">
                    All inventory levels are within acceptable ranges
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/inventory?filter=critical" className="w-full">
                <Button variant="ghost" size="sm" className="text-xs w-full">
                  View All Critical Items
                  <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Top Selling Dishes with visual engagement scores */}
          <Card className="overflow-hidden shadow-sm border border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-md">
                    <Utensils className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    Top Selling Dishes
                  </CardTitle>
                </div>
                <Badge variant="outline" className="font-normal">
                  {topDishes.length} dishes
                </Badge>
              </div>
              <CardDescription>Highest performing menu items</CardDescription>
            </CardHeader>
            <CardContent className="pb-1">
              {topDishes.length > 0 ? (
                <div className="space-y-4">
                  {topDishes.map((dish, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-muted/50 rounded-lg border border-border/30"
                    >
                      <div className="mb-3 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dish}</span>
                          {index === 0 && (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                              Best Seller
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          #{index + 1} in sales ranking
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-full sm:w-24">
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <span>Popularity</span>
                            <span>{calculatePopularity(index)}%</span>
                          </div>
                          <Progress
                            value={calculatePopularity(index)}
                            className="h-2"
                            indicatorClassName={
                              index === 0 ? "bg-primary" : "bg-blue-400"
                            }
                          />
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                              >
                                Analyze
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                View detailed sales metrics
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No sales data available</p>
                  <p className="text-sm text-muted-foreground">
                    Start recording sales to see your top dishes
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/sales" className="w-full">
                <Button variant="ghost" size="sm" className="text-xs w-full">
                  View Complete Sales Analysis
                  <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Side panel with quick stats and actions - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats in condensed side panel */}
          <Card className="shadow-sm border border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Key Metrics
              </CardTitle>
              <CardDescription>Overall performance snapshot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Current sales metric */}
              <div>
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium">Total Sales</div>
                  <div className="text-sm font-medium">
                    {formatCurrency(salesData.currentSales)}
                  </div>
                </div>
                <div className="bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-xs text-muted-foreground">
                    Previous: {formatCurrency(salesData.previousSales)}
                  </div>
                  <div className="flex items-center">
                    {salesData.salesGrowth >= 0 ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-0 text-xs font-normal"
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {salesData.salesGrowth.toFixed(1)}%
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-0 text-xs font-normal"
                      >
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        {Math.abs(salesData.salesGrowth).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Profit margin metric */}
              <div>
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium">Profit Margin</div>
                  <div className="text-sm font-medium">
                    {salesData.profitMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${salesData.profitMargin}%` }}
                  ></div>
                </div>
                <div className="mt-1">
                  <div className="text-xs text-muted-foreground">
                    Based on cost and revenue analysis
                  </div>
                </div>
              </div>

              <Separator />

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
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Generate Full Report
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions Card */}
          <Card className="shadow-sm border border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Quick Actions
              </CardTitle>
              <CardDescription>Common management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <Link href="/inventory/create">
                  Add New Inventory Item
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <Link href="/shopping-list">
                  Manage Shopping List
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <Link href="/settings">
                  Update Alert Thresholds
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
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
