import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/hooks/useDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiTrendingUp,
  FiPieChart,
  FiBarChart2,
  FiCalendar,
  FiShoppingCart,
  FiCreditCard,
} from "react-icons/fi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function SalesTab() {
  const router = useRouter();
  const {
    salesData,
    stats,
    topSellingItems,
    recentActivity,
    isLoading,
    error,
    refresh,
  } = useDashboard();

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card border shadow-xs overflow-hidden">
              <CardContent className="p-6">
                <div className="h-5 w-1/3 bg-muted/70 rounded mb-4"></div>
                <div className="h-8 w-1/2 bg-muted/70 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-muted/70 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border shadow-xs overflow-hidden">
          <CardHeader className="py-4 px-6">
            <div className="h-6 w-1/4 bg-muted/70 rounded"></div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <LoadingSpinner />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state with clean error UI
  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-700">
              Unable to Load Sales Data
            </CardTitle>
            <CardDescription className="text-red-600">
              There was a problem retrieving your sales information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={refresh}>
              <FiClock className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure the stats object exists to prevent TypeError
  const monthlySales = stats?.monthlySales || "0.00";
  const salesGrowth = stats?.salesGrowth || "0%";
  const growthValue = parseFloat(salesGrowth);
  const isPositiveGrowth = growthValue >= 0;

  // Get average order value if data exists
  const hasTransactions = salesData && salesData.length > 0;
  const totalSales = hasTransactions
    ? salesData.reduce((sum, item) => sum + item.sales, 0)
    : 0;
  // Estimate average order from monthly sales and activity count
  const transactionsCount =
    recentActivity?.filter(
      (a) =>
        a.action?.toLowerCase().includes("sale") ||
        a.action?.toLowerCase().includes("order")
    ).length || 0;
  const avgOrderValue =
    hasTransactions && transactionsCount > 0
      ? (totalSales / transactionsCount).toFixed(2)
      : "0.00";

  // Prepare the chart data
  const chartData = salesData || [];
  const maxSalesValue = Math.max(
    ...(chartData.map((item) => item.sales) || [0])
  );

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Sales Overview
          </h2>
          <p className="text-muted-foreground">
            Analyze your business sales performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8" onClick={refresh}>
            <FiClock className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="h-8"
            onClick={() => router.push("/sales/history")}
          >
            <FiShoppingCart className="mr-2 h-3.5 w-3.5" />
            View Sales History
          </Button>
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Month Sales
                </p>
                <h3 className="text-2xl font-bold mt-1">{monthlySales}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2">
                <FiCreditCard className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <FiCalendar className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date().toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Growth
                </p>
                <h3 className="text-2xl font-bold mt-1">{salesGrowth}</h3>
              </div>
              <div
                className={`rounded-full ${
                  isPositiveGrowth ? "bg-green-100" : "bg-red-100"
                } p-2`}
              >
                {isPositiveGrowth ? (
                  <FiArrowUp className="h-4 w-4 text-green-600" />
                ) : (
                  <FiArrowDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <Badge
                variant="outline"
                className={`px-1.5 py-0.5 ${
                  isPositiveGrowth
                    ? "text-green-600 border-green-200 bg-green-50"
                    : "text-red-600 border-red-200 bg-red-50"
                }`}
              >
                vs last month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Order
                </p>
                <h3 className="text-2xl font-bold mt-1">{avgOrderValue}</h3>
              </div>
              <div className="rounded-full bg-blue-100 p-2">
                <FiPieChart className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-muted-foreground">
                Based on {transactionsCount} transactions
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </p>
                <h3 className="text-2xl font-bold mt-1">{transactionsCount}</h3>
              </div>
              <div className="rounded-full bg-purple-100 p-2">
                <FiTrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <FiCalendar className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">This month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales chart section */}
      <Card className="bg-card border shadow-xs overflow-hidden">
        <CardHeader className="py-4 px-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Monthly revenue trends</CardDescription>
            </div>
            <Tabs defaultValue="bar" className="w-32">
              <TabsList className="h-8 p-1">
                <TabsTrigger value="bar" className="text-xs">
                  <FiBarChart2 className="h-3.5 w-3.5" />
                </TabsTrigger>
                <TabsTrigger value="line" className="text-xs">
                  <FiTrendingUp className="h-3.5 w-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          {chartData.length > 0 ? (
            <div className="h-[350px] w-full">
              <div className="relative h-full w-full">
                {/* Chart container */}
                <div className="absolute inset-0 flex items-end justify-center gap-2">
                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="relative flex flex-col items-center group w-full max-w-[40px]"
                    >
                      <div
                        className="w-full bg-primary/80 hover:bg-primary transition-colors rounded-t"
                        style={{
                          height: `${Math.max(
                            30,
                            (item.sales / (maxSalesValue || 1)) * 300
                          )}px`,
                        }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">
                        {item.month}
                      </span>
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 pointer-events-none">
                        {item.sales.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  No sales data available for this period
                </p>
                <Button variant="outline" size="sm" onClick={refresh}>
                  Refresh Data
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional analysis section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border shadow-xs overflow-hidden">
          <CardHeader className="py-4 px-6 border-b">
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling items this month</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {topSellingItems && topSellingItems.length > 0 ? (
              <div className="divide-y">
                {topSellingItems.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} sold
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {(item.quantity * 25).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">
                  No product data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-xs overflow-hidden">
          <CardHeader className="py-4 px-6 border-b">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and changes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity && recentActivity.length > 0 ? (
              <div className="divide-y">
                {recentActivity
                  .filter(
                    (activity) =>
                      activity.action?.toLowerCase().includes("sale") ||
                      activity.action?.toLowerCase().includes("order")
                  )
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Completed
                        </Badge>
                        <p className="font-medium">{activity.item}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">No recent activity data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
