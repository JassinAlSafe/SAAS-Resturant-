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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  RefreshCw,
  Calendar,
  Download,
  FileBarChart2,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Components
import {
  SalesAnalyticsView,
  InventoryUsageView,
  DateRangeSelector,
  ExecutiveDashboard,
} from "./components";

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

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl">
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {typeof error === "object" && "message" in error
              ? (error as { message: string }).message
              : "Failed to load report data"}
          </AlertDescription>
          <Button
            variant="outline"
            onClick={refetchData}
            className="mt-4 flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Try again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header section with improved layout */}
      <div className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <FileBarChart2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                View unified sales, inventory, and business analytics
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-md text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{currentTime}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Data is refreshed every 5 minutes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2">
              <DateRangeSelector
                dateRange={dateRange}
                setDateRange={setDateRange}
                customDateRange={customDateRange}
                setCustomDateRange={setCustomDateRange}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={refetchData}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh data</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      toast.info("Coming soon", {
                        description:
                          "Export functionality will be available in the next update.",
                      });
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export report</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      toast.info("Coming soon", {
                        description:
                          "Filter functionality will be available in the next update.",
                      });
                    }}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Advanced filters</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        {executiveSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white relative overflow-hidden border border-border/40">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="pb-2">
                <CardDescription>Total Sales</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(executiveSummary.currentSales)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-0">
                <Badge
                  variant={
                    executiveSummary.salesGrowth >= 0
                      ? "default"
                      : "destructive"
                  }
                  className="font-normal"
                >
                  {executiveSummary.salesGrowth >= 0 ? "+" : ""}
                  {executiveSummary.salesGrowth.toFixed(1)}% vs last period
                </Badge>
              </CardFooter>
            </Card>

            <Card className="bg-white relative overflow-hidden border border-border/40">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent" />
              <CardHeader className="pb-2">
                <CardDescription>Profit Margin</CardDescription>
                <CardTitle className="text-2xl">
                  {executiveSummary.profitMargin.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Based on cost and revenue analysis
                </p>
              </CardFooter>
            </Card>

            <Card className="bg-white relative overflow-hidden border border-border/40">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent" />
              <CardHeader className="pb-2">
                <CardDescription>Low Stock Items</CardDescription>
                <CardTitle className="text-2xl">
                  {executiveSummary.lowStockCount}
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button
                  variant="link"
                  className="px-0 h-auto font-normal"
                  asChild
                >
                  <a href="/inventory?filter=low-stock">View items →</a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white relative overflow-hidden border border-border/40">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent" />
              <CardHeader className="pb-2">
                <CardDescription>Out of Stock Items</CardDescription>
                <CardTitle className="text-2xl">
                  {executiveSummary.outOfStockCount}
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button
                  variant="link"
                  className="px-0 h-auto font-normal"
                  asChild
                >
                  <a href="/shopping-list">Go to Shopping List →</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      <Separator />

      {/* Improved Tabs UI */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          // Fix the type mismatch by ensuring value is treated as TabType
          if (
            value === "sales" ||
            value === "inventory" ||
            value === "executive"
          ) {
            setActiveTabState(value);
          }
        }}
        className="space-y-8"
      >
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="executive" className="rounded-md">
              Executive
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-md">
              Sales
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-md">
              Inventory
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="executive" className="space-y-6">
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
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">
                  Loading dashboard data...
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <SalesAnalyticsView
            salesData={salesData || { labels: [], datasets: [] }}
            topDishesData={topDishesData || { labels: [], datasets: [] }}
            formatCurrency={formatCurrency}
            previousPeriodData={previousPeriodData}
            getPercentageChange={getPercentageChange}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryUsageView
            inventoryUsageData={
              inventoryUsageData || {
                labels: [],
                datasets: [],
                inventory: [],
              }
            }
            onRefresh={refetchData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Reports() {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                {error.message ||
                  "An unexpected error occurred in the Reports page"}
              </p>
              <Button variant="outline" onClick={reset}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    >
      <ReportsContent />
    </ErrorBoundary>
  );
}
