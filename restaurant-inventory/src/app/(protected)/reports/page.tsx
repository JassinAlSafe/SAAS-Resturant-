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
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Download, FileBarChart2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";

// Components
import {
  SalesAnalyticsView,
  InventoryUsageView,
  DateRangeSelector,
} from "./components";

// Hooks
import { useReports } from "./hooks/useReports";

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

// Define TabType if not already defined
// type TabType = 'sales' | 'inventory';

function ReportsContent() {
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
    formatCurrency,
    previousPeriodData,
    error,
    refetchData,
    getPercentageChange,
  } = useReports();

  if (error) {
    return (
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
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-xl">
            <FileBarChart2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              View sales performance and inventory usage analytics
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <HoverCard>
            <HoverCardTrigger>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last updated: {format(new Date(), "HH:mm:ss")}
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              Data is automatically refreshed every 5 minutes. Click the refresh
              button for real-time updates.
            </HoverCardContent>
          </HoverCard>

          <div className="flex items-center gap-2">
            <DateRangeSelector
              dateRange={dateRange}
              setDateRange={setDateRange}
              customDateRange={customDateRange}
              setCustomDateRange={setCustomDateRange}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={refetchData}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Export data"
              onClick={() => {
                // TODO: Implement export functionality
                toast.info("Coming soon", {
                  description:
                    "Export functionality will be available in the next update.",
                });
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTabState(value as "sales" | "inventory")
        }
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <SalesAnalyticsView
            salesData={salesData || { labels: [], datasets: [] }}
            topDishesData={topDishesData || { labels: [], datasets: [] }}
            formatCurrency={formatCurrency}
            previousPeriodData={previousPeriodData}
            getPercentageChange={getPercentageChange}
          />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryUsageView
            inventoryUsageData={
              inventoryUsageData || {
                labels: [],
                datasets: [],
              }
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Reports() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-background min-h-[calc(100vh-4rem)]">
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Something went wrong
            </h2>
            <p className="mb-4 text-muted-foreground">
              {error.message ||
                "We encountered an error while loading the reports"}
            </p>
            <Button onClick={reset}>Try again</Button>
          </div>
        )}
      >
        <ReportsContent />
      </ErrorBoundary>
    </div>
  );
}
