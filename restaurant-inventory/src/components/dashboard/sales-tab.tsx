import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/hooks/useDashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export function SalesTab() {
  const router = useRouter();
  const {
    salesData,
    stats,
    recentActivity,
    topSellingItems,
    isLoading,
    refresh,
    currencySymbol,
  } = useDashboard();

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch {
      return "";
    }
  };

  // Format currency helper
  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return `${currencySymbol}${numValue.toLocaleString()}`;
  };

  // Handle refresh click
  const handleRefresh = () => {
    refresh();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Sales Overview</h2>
          <div className="h-9 w-24 bg-muted/70 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card shadow-sm">
              <CardHeader className="pb-2">
                <div className="h-5 w-1/2 bg-muted/70 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/3 bg-muted/70 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-muted/50 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className="h-6 w-1/4 bg-muted/70 rounded mb-4"></div>
          <div className="h-64 bg-muted/30 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card shadow-sm">
            <CardHeader>
              <div className="h-6 w-1/3 bg-muted/70 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between p-2 border-b">
                    <div className="h-4 w-1/3 bg-muted/70 rounded"></div>
                    <div className="h-4 w-1/4 bg-muted/70 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm">
            <CardHeader>
              <div className="h-6 w-1/3 bg-muted/70 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between p-2 border-b">
                    <div className="h-4 w-1/3 bg-muted/70 rounded"></div>
                    <div className="h-4 w-1/4 bg-muted/70 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if sales growth is positive or negative for styling
  const isPositiveGrowth =
    stats.salesGrowth === undefined || stats.salesGrowth === null
      ? true // Default to positive if no data
      : Number(stats.salesGrowth) >= 0;

  // Format sales growth for display
  const salesGrowthText =
    stats.salesGrowth === undefined || stats.salesGrowth === null
      ? "N/A"
      : `${Number(stats.salesGrowth) > 0 ? "+" : ""}${Number(
          stats.salesGrowth
        ).toFixed(1)}%`;

  // Format the sales data for the chart
  const formattedSalesData = salesData.map((item) => ({
    ...item,
    sales: typeof item.sales === "string" ? parseFloat(item.sales) : item.sales,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sales Overview</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/sales")}
            variant="default"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            Sales Analytics
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="h-4 w-4 mr-1.5 text-blue-500" />
              Monthly Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.monthlySales)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current month revenue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              {isPositiveGrowth ? (
                <TrendingUp className="h-4 w-4 mr-1.5 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1.5 text-red-500" />
              )}
              Sales Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isPositiveGrowth ? "text-green-600" : "text-red-600"
              }`}
            >
              {salesGrowthText}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Compared to previous month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-purple-500" />
              Average Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(42.5)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Per customer transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Chart */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Monthly Sales Trend</h3>
          <Badge variant="outline" className="font-normal">
            Last 6 Months
          </Badge>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedSalesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => `${currencySymbol}${value}`}
                width={60}
              />
              <Tooltip
                formatter={(value) => [
                  `${formatCurrency(value as number)}`,
                  "Sales",
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar
                dataKey="sales"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Items & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Top Selling Items</span>
              <Badge variant="outline" className="font-normal">
                This Month
              </Badge>
            </CardTitle>
            <CardDescription>
              Most popular items by quantity sold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 pr-4">
              {topSellingItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-full mb-3">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground">
                    No sales data available
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start selling to see your top items
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topSellingItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 rounded-lg border border-muted hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-blue-700 p-2 rounded-full">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Quantity sold:{" "}
                            <span className="font-medium">{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={index < 3 ? "default" : "outline"}
                        className="ml-2"
                      >
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Recent Activity</span>
              <Badge variant="outline" className="font-normal">
                Last 24 Hours
              </Badge>
            </CardTitle>
            <CardDescription>
              Recent sales and inventory changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 pr-4">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="bg-purple-50 text-purple-700 p-3 rounded-full mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Activity will appear here as it happens
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-3 rounded-lg border border-muted hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-50 text-purple-700 p-2 rounded-full">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.item}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(activity.timestamp)} at{" "}
                            {formatTime(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.user}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/sales/analytics")}
        >
          <TrendingUp className="h-4 w-4 mr-1.5" />
          Sales Analytics
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/sales/new")}
        >
          <ShoppingBag className="h-4 w-4 mr-1.5" />
          Record New Sale
        </Button>
      </div>
    </div>
  );
}
