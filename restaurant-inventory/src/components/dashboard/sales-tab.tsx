import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/hooks/useDashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Cell,
} from "recharts";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  ChevronRight,
  BarChart3,
  FileText,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";

export function SalesTab() {
  const router = useRouter();
  const {
    salesData,
    stats,
    recentActivity,
    topSellingItems,
    isLoading,
    refresh,
    error,
    hasData,
    dataState,
    currencySymbol = "$",
  } = useDashboard();

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Format date for display
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  }, []);

  // Format time for display
  const formatTime = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch {
      return "";
    }
  }, []);

  // Format currency helper
  const formatCurrency = useCallback(
    (value: number | string): string => {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numValue)) return `${currencySymbol}0`;
      return `${currencySymbol}${numValue.toLocaleString()}`;
    },
    [currencySymbol]
  );

  // Handle refresh click
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Data freshness indicator
  const freshnessBadge = useMemo(() => {
    if (!dataState) return null;

    const badgeClasses = {
      fresh: "bg-green-100 text-green-800 border-green-200",
      aging: "bg-yellow-100 text-yellow-800 border-yellow-200",
      stale: "bg-red-100 text-red-800 border-red-200",
    };

    const badgeText = {
      fresh: "Data Fresh",
      aging: "Updating...",
      stale: "Needs Refresh",
    };

    return (
      <Badge
        variant="outline"
        className={`ml-2 text-xs font-normal ${
          badgeClasses[dataState as keyof typeof badgeClasses]
        }`}
      >
        {badgeText[dataState as keyof typeof badgeText]}
      </Badge>
    );
  }, [dataState]);

  // Check if sales growth is positive or negative for styling
  const isPositiveGrowth = useMemo(() => {
    return stats.salesGrowth === undefined || stats.salesGrowth === null
      ? true // Default to positive if no data
      : Number(stats.salesGrowth) >= 0;
  }, [stats.salesGrowth]);

  // Format sales growth for display
  const salesGrowthText = useMemo(() => {
    return stats.salesGrowth === undefined || stats.salesGrowth === null
      ? "N/A"
      : `${Number(stats.salesGrowth) > 0 ? "+" : ""}${Number(
          stats.salesGrowth
        ).toFixed(1)}%`;
  }, [stats.salesGrowth]);

  // Format the sales data for the chart
  const formattedSalesData = useMemo(() => {
    return salesData.map((item) => ({
      ...item,
      sales:
        typeof item.sales === "string" ? parseFloat(item.sales) : item.sales,
    }));
  }, [salesData]);

  // Calculate max sales for better bar chart visualization
  const maxSales = useMemo(() => {
    return formattedSalesData.length
      ? Math.max(...formattedSalesData.map((item) => item.sales || 0)) * 1.2
      : 0;
  }, [formattedSalesData]);

  // Custom bar chart tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number | string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-sm text-gray-800">{label}</p>
          <p className="text-blue-600 font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading && !hasData) {
    return (
      <div className="space-y-6" aria-live="polite" aria-busy="true">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Sales Overview</h2>
          <div className="h-9 w-24 bg-muted/70 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card shadow-sm">
              <CardHeader className="pb-2">
                <div className="h-5 w-1/2 bg-muted/70 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/3 bg-muted/70 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-2/3 bg-muted/50 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className="h-6 w-1/4 bg-muted/70 rounded mb-4 animate-pulse"></div>
          <div className="h-64 bg-muted/30 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((cardIndex) => (
            <Card key={cardIndex} className="bg-card shadow-sm">
              <CardHeader>
                <div className="h-6 w-1/3 bg-muted/70 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between p-2 border-b">
                      <div className="h-4 w-1/3 bg-muted/70 rounded animate-pulse"></div>
                      <div className="h-4 w-1/4 bg-muted/70 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        className="bg-white border border-red-200 rounded-xl p-6 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start space-x-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-full">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Error Loading Sales Data
            </h3>
            <p className="text-gray-600 mt-1">
              {typeof error === "string"
                ? error
                : "Failed to load sales data. Please try again."}
            </p>
            <div className="mt-4">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="gap-1.5 font-medium border-red-200 text-red-600 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <motion.div
        className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        aria-live="polite"
      >
        <div className="mx-auto bg-blue-50 text-blue-600 p-3 rounded-full inline-flex mb-4">
          <BarChart3 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          No Sales Data Available
        </h3>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          There is no sales data to display at this time. Start making sales to
          see insights and analytics here.
        </p>
        <div className="mt-6">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-1.5 font-medium me-3"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/sales/new")}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 gap-1.5 font-medium"
          >
            <ShoppingBag className="h-4 w-4" />
            Record New Sale
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Sales Overview
              </h2>
              {freshnessBadge}
            </div>
            <p className="text-gray-500 mt-1">
              Monthly performance and insights
            </p>
          </div>
          <div className="flex gap-3 self-end sm:self-auto">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="gap-1.5 font-medium"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
            <Button
              onClick={() => router.push("/sales")}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 gap-1.5 font-medium"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Full Analytics
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-white border-none shadow-md hover:shadow-xl transition-all rounded-xl overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                  <DollarSign
                    className="h-4 w-4 mr-1.5 text-blue-500"
                    aria-hidden="true"
                  />
                  Monthly Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.monthlySales)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Current month revenue
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-white border-none shadow-md hover:shadow-xl transition-all rounded-xl overflow-hidden h-full">
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  isPositiveGrowth ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                  {isPositiveGrowth ? (
                    <TrendingUp
                      className="h-4 w-4 mr-1.5 text-green-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <TrendingDown
                      className="h-4 w-4 mr-1.5 text-red-500"
                      aria-hidden="true"
                    />
                  )}
                  Sales Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${
                    isPositiveGrowth ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {salesGrowthText}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Compared to previous month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-white border-none shadow-md hover:shadow-xl transition-all rounded-xl overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                  <Users
                    className="h-4 w-4 mr-1.5 text-purple-500"
                    aria-hidden="true"
                  />
                  Average Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(42.5)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Per customer transaction
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Monthly Sales Chart */}
        <motion.div
          className="bg-white rounded-xl border shadow-md p-6 hover:shadow-lg transition-all"
          whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly Sales Trend
            </h3>
            <Badge
              variant="outline"
              className="font-normal bg-blue-50 text-blue-700 border-blue-200"
            >
              Last 6 Months
            </Badge>
          </div>
          <div
            className="h-72"
            aria-label="Bar chart showing monthly sales trends"
            role="img"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedSalesData}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                barGap={8}
                onMouseMove={(data) => {
                  if (data.activeTooltipIndex !== undefined) {
                    setHoveredBarIndex(data.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `${currencySymbol}${value}`}
                  width={70}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  domain={[0, maxSales]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                />
                <Bar
                  dataKey="sales"
                  fill="url(#colorSales)"
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                  aria-label="Monthly sales data"
                >
                  {formattedSalesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        hoveredBarIndex === index
                          ? "#1d4ed8"
                          : "url(#colorSales)"
                      }
                      cursor="pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Selling Items & Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Selling Items */}
          <motion.div
            className="bg-white rounded-xl border shadow-md hover:shadow-lg transition-all overflow-hidden"
            whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Selling Items
                </h3>
                <Badge
                  variant="outline"
                  className="font-normal bg-orange-50 text-orange-700 border-orange-200"
                >
                  This Month
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Most popular items by quantity sold
              </p>
            </div>
            <div className="p-5">
              <ScrollArea className="h-72 pr-4">
                {topSellingItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="bg-orange-50 text-orange-600 p-3 rounded-full mb-4">
                      <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="text-gray-700 font-medium">
                      No sales data available
                    </p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs">
                      Start selling to see your top performing items here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topSellingItems.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r hover:from-orange-50 hover:to-white border border-gray-100 transition-all cursor-pointer"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`
                              flex items-center justify-center text-white font-medium rounded-full w-8 h-8
                              ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                  ? "bg-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }
                            `}
                            aria-hidden="true"
                          >
                            {index < 3 ? (
                              index + 1
                            ) : (
                              <ShoppingBag className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Sold:{" "}
                              <span className="font-semibold text-blue-700">
                                {item.quantity}
                              </span>{" "}
                              units
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            <CardFooter className="bg-gray-50 border-t p-4 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 gap-1 w-full justify-center"
                onClick={() => router.push("/inventory")}
              >
                View All Products
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardFooter>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="bg-white rounded-xl border shadow-md hover:shadow-lg transition-all overflow-hidden"
            whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
                <Badge
                  variant="outline"
                  className="font-normal bg-purple-50 text-purple-700 border-purple-200"
                >
                  Last 24 Hours
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Recent sales and inventory changes
              </p>
            </div>
            <div className="p-5">
              <ScrollArea className="h-72 pr-4">
                {recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="bg-purple-50 text-purple-600 p-3 rounded-full mb-4">
                      <Clock className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="text-gray-700 font-medium">
                      No recent activity
                    </p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs">
                      Activity will appear here as it happens
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        className="flex justify-between items-start p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="bg-purple-100 text-purple-600 p-2 rounded-full mt-0.5"
                            aria-hidden="true"
                          >
                            {activity.action.toLowerCase().includes("sale") ? (
                              <ShoppingBag className="h-4 w-4" />
                            ) : activity.action
                                .toLowerCase()
                                .includes("inventory") ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {activity.action}
                            </div>
                            <div className="text-sm text-gray-700 mt-0.5">
                              {activity.item}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              <time dateTime={activity.timestamp}>
                                {formatDate(activity.timestamp)} at{" "}
                                {formatTime(activity.timestamp)}
                              </time>
                            </div>
                          </div>
                        </div>
                        {activity.user && (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-xs font-normal"
                          >
                            {activity.user}
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            <CardFooter className="bg-gray-50 border-t p-4 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 gap-1 w-full justify-center"
                onClick={() => router.push("/activity")}
              >
                View All Activity
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardFooter>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mt-6 bg-gray-50 p-6 rounded-xl border">
          <h3 className="w-full text-md font-semibold text-gray-700 mb-2">
            Quick Actions
          </h3>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-gray-200 shadow-sm font-medium gap-2 px-4"
              onClick={() => router.push("/sales/analytics")}
            >
              <TrendingUp
                className="h-4 w-4 text-blue-600"
                aria-hidden="true"
              />
              Sales Analytics
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-gray-200 shadow-sm font-medium gap-2 px-4"
              onClick={() => router.push("/sales/reports")}
            >
              <FileText className="h-4 w-4 text-green-600" aria-hidden="true" />
              Sales Reports
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-gray-200 shadow-sm font-medium gap-2 px-4"
              onClick={() => router.push("/sales/new")}
            >
              <ShoppingBag
                className="h-4 w-4 text-orange-600"
                aria-hidden="true"
              />
              Record New Sale
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
