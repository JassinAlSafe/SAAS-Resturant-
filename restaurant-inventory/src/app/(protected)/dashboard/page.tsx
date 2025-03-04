"use client";

import { useState, useEffect } from "react";
import {
  FiPackage,
  FiAlertTriangle,
  FiDollarSign,
  FiTrendingUp,
  FiShoppingBag,
  FiHome,
  FiBarChart2,
  FiSettings,
  FiUsers,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiShoppingCart,
  FiArrowRight,
  FiCalendar,
} from "react-icons/fi";
import StatCard from "@/components/StatCard";
import Card from "@/components/Card";
import SalesGrowthCard from "@/components/SalesGrowthCard";
import CategoryStatsCard from "@/components/CategoryStatsCard";
import { DashboardStats, StockAlert, InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/lib/currency-context";
import { CurrencySelector } from "@/components/currency-selector";
import ExpiryAlerts from "@/components/dashboard/ExpiryAlerts";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { inventoryService } from "@/lib/services/inventory-service";
import { salesService } from "@/lib/services/sales-service";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { PageHeader } from "@/components/page-header";

// Simple loading spinner component
function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-2",
    xl: "h-12 w-12 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-current border-t-transparent text-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalInventoryValue: 0,
    lowStockItems: 0,
    monthlySales: 0,
    salesGrowth: 0,
  });

  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [salesData, setSalesData] = useState<
    { month: string; sales: number }[]
  >([]);
  const [categoryStats, setCategoryStats] = useState<
    {
      id: string;
      name: string;
      count: number;
      change: number;
      icon: React.ReactNode;
      color: string;
    }[]
  >([]);

  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return; // Don't fetch data if user is not authenticated
    fetchDashboardData();
  }, [user]);

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch data in parallel
      const [
        inventoryValue,
        lowStockCount,
        monthlySalesData,
        salesGrowthData,
        categoryData,
      ] = await Promise.all([
        fetchInventoryValue(),
        fetchLowStockCount(),
        fetchMonthlySales(),
        fetchSalesGrowth(),
        fetchCategoryStats(),
      ]);

      // Update state with fetched data
      setStats({
        totalInventoryValue: inventoryValue,
        lowStockItems: lowStockCount,
        monthlySales: monthlySalesData.currentMonthSales,
        salesGrowth: salesGrowthData,
      });

      setSalesData(monthlySalesData.monthlySalesData);
      setCategoryStats(categoryData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch total inventory value
  const fetchInventoryValue = async (): Promise<number> => {
    try {
      const items = await inventoryService.getItems();
      const totalValue = items.reduce((sum: number, item: InventoryItem) => {
        return sum + item.quantity * item.cost_per_unit;
      }, 0);
      return totalValue;
    } catch (error) {
      console.error("Error fetching inventory value:", error);
      return 0;
    }
  };

  // Function to fetch low stock items count
  const fetchLowStockCount = async (): Promise<number> => {
    try {
      const items = await inventoryService.getItems();
      const lowStockCount = items.filter(
        (item: InventoryItem) =>
          item.quantity <= (item.minimum_stock_level || 0)
      ).length;
      return lowStockCount;
    } catch (error) {
      console.error("Error fetching low stock count:", error);
      return 0;
    }
  };

  // Function to fetch monthly sales data
  const fetchMonthlySales = async (): Promise<{
    currentMonthSales: number;
    monthlySalesData: { month: string; sales: number }[];
  }> => {
    try {
      const sales = await salesService.getSales();
      const now = new Date();
      const sixMonthsAgo = subMonths(now, 5);

      // Initialize monthly data for the last 6 months
      const monthlyData: { [key: string]: number } = {};
      for (let i = 0; i < 6; i++) {
        const month = subMonths(now, i);
        const monthKey = format(month, "MMM");
        monthlyData[monthKey] = 0;
      }

      // Calculate sales for each month
      let currentMonthTotal = 0;
      sales.forEach((sale) => {
        const saleDate = new Date(sale.date);
        const monthKey = format(saleDate, "MMM");

        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += sale.totalAmount;
        }

        // Check if sale is in current month
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        if (saleDate >= currentMonthStart && saleDate <= currentMonthEnd) {
          currentMonthTotal += sale.totalAmount;
        }
      });

      // Convert to array format for chart
      const monthlySalesData = Object.entries(monthlyData)
        .map(([month, sales]) => ({ month, sales }))
        .reverse(); // Reverse to show oldest first

      return {
        currentMonthSales: currentMonthTotal,
        monthlySalesData,
      };
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
      return {
        currentMonthSales: 0,
        monthlySalesData: [],
      };
    }
  };

  // Function to calculate sales growth percentage
  const fetchSalesGrowth = async (): Promise<number> => {
    try {
      const sales = await salesService.getSales();
      const now = new Date();

      // Current month range
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);

      // Previous month range
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));

      // Calculate totals
      let currentMonthTotal = 0;
      let prevMonthTotal = 0;

      sales.forEach((sale) => {
        const saleDate = new Date(sale.date);

        if (saleDate >= currentMonthStart && saleDate <= currentMonthEnd) {
          currentMonthTotal += sale.totalAmount;
        } else if (saleDate >= prevMonthStart && saleDate <= prevMonthEnd) {
          prevMonthTotal += sale.totalAmount;
        }
      });

      // Calculate growth percentage
      if (prevMonthTotal === 0) return 0;
      const growthPercentage =
        ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
      return parseFloat(growthPercentage.toFixed(1));
    } catch (error) {
      console.error("Error calculating sales growth:", error);
      return 0;
    }
  };

  // Function to fetch category statistics
  const fetchCategoryStats = async () => {
    try {
      const items = await inventoryService.getItems();

      // Group items by category
      const categories: {
        [key: string]: { count: number; items: InventoryItem[] };
      } = {};

      items.forEach((item) => {
        if (!categories[item.category]) {
          categories[item.category] = { count: 0, items: [] };
        }
        categories[item.category].count += 1;
        categories[item.category].items.push(item);
      });

      // Convert to required format
      const iconMap: { [key: string]: React.ReactNode } = {
        Meat: <FiShoppingBag className="h-5 w-5 text-white" />,
        Produce: <FiHome className="h-5 w-5 text-white" />,
        Dairy: <FiSettings className="h-5 w-5 text-white" />,
        "Dry Goods": <FiBarChart2 className="h-5 w-5 text-white" />,
        Seafood: <FiShoppingCart className="h-5 w-5 text-white" />,
      };

      const colorMap: { [key: string]: string } = {
        Meat: "bg-primary",
        Produce: "bg-green-500",
        Dairy: "bg-blue-500",
        "Dry Goods": "bg-amber-500",
        Seafood: "bg-purple-500",
      };

      // Calculate change (this would normally come from historical data)
      // For now, we'll use a random value between -5 and 5
      const getRandomChange = () => Math.floor(Math.random() * 11) - 5;

      return Object.entries(categories).map(([name, data], index) => ({
        id: index.toString(),
        name,
        count: data.count,
        change: getRandomChange(),
        icon: iconMap[name] || <FiPackage className="h-5 w-5 text-white" />,
        color: colorMap[name] || "bg-gray-500",
      }));
    } catch (error) {
      console.error("Error fetching category stats:", error);
      return [];
    }
  };

  const handleRefresh = () => {
    if (!user) return; // Don't refresh if user is not authenticated
    fetchDashboardData();
  };

  // If still loading auth or not authenticated, show loading state
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
      {/* Header - Using the improved PageHeader component */}
      <PageHeader
        title="Welcome to ShelfWise"
        onRefresh={handleRefresh}
        isLoading={isLoading}
        actions={
          <div className="bg-card border border-border/50 rounded-md p-1 shadow-sm">
            <CurrencySelector />
          </div>
        }
      />

      {/* Dashboard Tabs */}
      <Tabs
        defaultValue="overview"
        className="mb-6"
        onValueChange={setActiveTab}
      >
        <div className="border-b mb-6">
          <TabsList className="bg-transparent h-10 p-0 w-full justify-start">
            <TabsTrigger
              value="overview"
              className={cn(
                "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 h-10",
                "text-muted-foreground data-[state=active]:text-foreground"
              )}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className={cn(
                "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 h-10",
                "text-muted-foreground data-[state=active]:text-foreground"
              )}
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className={cn(
                "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 h-10",
                "text-muted-foreground data-[state=active]:text-foreground"
              )}
            >
              Sales
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="m-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <StatCard
              title="Total Inventory Value"
              value={formatCurrency(stats.totalInventoryValue)}
              icon={<FiPackage className="h-5 w-5" />}
              variant="primary"
              footer={
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs">Last updated:</span>
                  <span className="text-xs font-medium flex items-center">
                    <FiClock className="h-3 w-3 mr-1" />{" "}
                    {format(new Date(), "h:mm a")}
                  </span>
                </div>
              }
            />
            <StatCard
              title="Low Stock Items"
              value={stats.lowStockItems.toString()}
              icon={<FiAlertTriangle className="h-5 w-5" />}
              variant="warning"
              footer={
                <div className="flex items-center justify-center gap-1.5 text-amber-700 bg-amber-50 rounded-md px-2 py-1 mt-1">
                  <FiAlertTriangle className="h-3 w-3" /> Needs attention
                </div>
              }
            />
            <StatCard
              title="Monthly Sales"
              value={formatCurrency(stats.monthlySales)}
              icon={<FiDollarSign className="h-5 w-5" />}
              variant="success"
              footer={
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs">Current Month:</span>
                  <span className="text-xs font-medium text-green-600">
                    {format(new Date(), "MMMM yyyy")}
                  </span>
                </div>
              }
            />
            <StatCard
              title="Sales Growth"
              value={`${stats.salesGrowth}%`}
              icon={<FiTrendingUp className="h-5 w-5" />}
              trend={{
                value: Math.abs(stats.salesGrowth),
                isPositive: stats.salesGrowth >= 0,
              }}
              variant="info"
              footer={
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs">vs. Last Month:</span>
                  <span
                    className={`text-xs font-medium ${
                      stats.salesGrowth >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stats.salesGrowth >= 0 ? "+" : ""}
                    {stats.salesGrowth}%
                  </span>
                </div>
              }
            />
          </div>

          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            {/* Left column - Stats and Charts */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Main Charts */}
              <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-4 sm:p-6 border-b">
                  <h2 className="text-xl font-semibold mb-1">
                    Sales Performance
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Monthly revenue and growth trends
                  </p>
                </div>
                <div className="p-4 sm:p-6">
                  {salesData.length > 0 ? (
                    <SalesGrowthCard
                      title=""
                      totalRevenue={salesData.reduce(
                        (sum, item) => sum + item.sales,
                        0
                      )}
                      averageMonthly={
                        salesData.reduce((sum, item) => sum + item.sales, 0) /
                        (salesData.length || 1)
                      }
                      highestMonth={Math.max(
                        ...salesData.map((item) => item.sales),
                        0
                      )}
                      lowestMonth={Math.min(
                        ...salesData.map((item) => item.sales),
                        0
                      )}
                      percentComplete={75} // This would come from a goal tracking system
                      growthPercent={stats.salesGrowth}
                      salesData={salesData}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <LoadingSpinner size="lg" className="mb-4" />
                      <p className="text-muted-foreground">
                        Loading sales data...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <Card className="shadow-sm hover:shadow-md transition-all group">
                  <div className="p-5 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <FiShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">Add Inventory</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Quickly add new items to your inventory
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary/10 transition-colors"
                      onClick={() => router.push("/inventory/add")}
                    >
                      Add New Items
                      <FiArrowRight className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </div>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-all group">
                  <div className="p-5 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <FiBarChart2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium mb-1">Generate Reports</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create detailed inventory reports
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-blue-50 transition-colors"
                      onClick={() => router.push("/reports")}
                    >
                      View Reports
                      <FiArrowRight className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </div>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-all group">
                  <div className="p-5 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <FiUsers className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-medium mb-1">Team Management</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your team and permissions
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-green-50 transition-colors"
                      onClick={() => router.push("/users")}
                    >
                      Manage Team
                      <FiArrowRight className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right column - Alerts & Categories */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Alerts Section */}
              <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-4 border-b bg-amber-50/50 flex items-center justify-between">
                  <h2 className="font-semibold text-amber-800 flex items-center">
                    <FiAlertTriangle className="h-4 w-4 mr-2" />
                    Inventory Alerts
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-700 hover:text-amber-800 hover:bg-amber-100/50"
                    onClick={() => router.push("/inventory?filter=alerts")}
                  >
                    View All
                  </Button>
                </div>
                <ExpiryAlerts />
              </div>

              {/* Categories Section */}
              {categoryStats.length > 0 ? (
                <CategoryStatsCard
                  title="Inventory by Category"
                  categories={categoryStats}
                  onViewAll={() => router.push("/inventory")}
                />
              ) : (
                <div className="bg-card rounded-xl border shadow-sm p-6 flex items-center justify-center h-64">
                  <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Loading category data...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="m-0">
          <div className="bg-card rounded-xl border shadow-sm p-6 flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Inventory Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                This tab would contain detailed inventory analytics
              </p>
              <Button onClick={() => router.push("/inventory")}>
                Go to Inventory
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="m-0">
          <div className="bg-card rounded-xl border shadow-sm p-6 flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Sales Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                This tab would contain detailed sales analytics
              </p>
              <Button onClick={() => router.push("/sales")}>Go to Sales</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
