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
} from "react-icons/fi";
import StatCard from "@/components/StatCard";
import AlertCard from "@/components/AlertCard";
import Card from "@/components/Card";
import SalesGrowthCard from "@/components/SalesGrowthCard";
import CategoryStatsCard from "@/components/CategoryStatsCard";
import { DashboardStats, StockAlert } from "@/lib/types";
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
  const [salesData] = useState([
    { month: "Jan", sales: 12400 },
    { month: "Feb", sales: 13800 },
    { month: "Mar", sales: 15200 },
    { month: "Apr", sales: 14900 },
    { month: "May", sales: 16300 },
    { month: "Jun", sales: 17500 },
  ]);

  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Simulate fetching dashboard data
  useEffect(() => {
    if (!user) return; // Don't fetch data if user is not authenticated

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setStats({
          totalInventoryValue: 24750.5,
          lowStockItems: 8,
          monthlySales: 18650.75,
          salesGrowth: 12.3,
        });

        setStockAlerts([
          {
            id: 1,
            name: "Chicken Breast",
            currentStock: 2.5,
            unit: "kg",
            minStock: 5,
            category: "Meat",
          },
          {
            id: 2,
            name: "Olive Oil",
            currentStock: 0.8,
            unit: "L",
            minStock: 2,
            category: "Oils",
          },
          {
            id: 3,
            name: "Tomatoes",
            currentStock: 1.2,
            unit: "kg",
            minStock: 3,
            category: "Vegetables",
          },
          {
            id: 4,
            name: "Heavy Cream",
            currentStock: 0.5,
            unit: "L",
            minStock: 1.5,
            category: "Dairy",
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleRefresh = () => {
    if (!user) return; // Don't refresh if user is not authenticated

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refresh data with the same values
        setStats({
          totalInventoryValue: 24750.5,
          lowStockItems: 8,
          monthlySales: 18650.75,
          salesGrowth: 12.3,
        });
      } catch (error) {
        console.error("Error refreshing dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
              Welcome to ShelfWise
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-1" />
              ) : (
                <FiRefreshCw className="h-4 w-4" />
              )}
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
            <div className="bg-background/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
              <CurrencySelector />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column - Stats and Charts */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Stats Section */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                title="Total Inventory Value"
                value={formatCurrency(stats.totalInventoryValue)}
                icon={<FiPackage className="h-5 w-5" />}
                variant="primary"
                footer={
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs">Last updated:</span>
                    <span className="text-xs font-medium flex items-center">
                      <FiClock className="h-3 w-3 mr-1" /> Today, 2:30 PM
                    </span>
                  </div>
                }
              />
              <StatCard
                title="Low Stock Items"
                value={stats.lowStockItems.toString()}
                icon={<FiAlertTriangle className="h-5 w-5" />}
                trend={{
                  value: 3,
                  isPositive: false,
                }}
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
                    <span className="text-xs">vs. Last Month:</span>
                    <span className="text-xs font-medium text-green-600">
                      +8.5%
                    </span>
                  </div>
                }
              />
              <StatCard
                title="Sales Growth"
                value={`${stats.salesGrowth}%`}
                icon={<FiTrendingUp className="h-5 w-5" />}
                trend={{
                  value: 2.5,
                  isPositive: true,
                }}
                variant="info"
                footer={
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs">YTD Growth:</span>
                    <span className="text-xs font-medium text-blue-600">
                      +15.3%
                    </span>
                  </div>
                }
              />
            </div>
          </section>

          {/* Main Charts */}
          <section className="grid gap-6">
            <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold mb-1">
                  Sales Performance
                </h2>
                <p className="text-sm text-muted-foreground">
                  Monthly revenue and growth trends
                </p>
              </div>
              <div className="p-6">
                <SalesGrowthCard
                  title=""
                  totalRevenue={90000}
                  averageMonthly={15000}
                  highestMonth={17500}
                  lowestMonth={12400}
                  percentComplete={75}
                  growthPercent={12.3}
                  salesData={salesData}
                />
              </div>
            </div>
          </section>

          {/* Quick Actions Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-all">
              <div className="p-5 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <FiShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Add Inventory</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quickly add new items to your inventory
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push("/inventory/add")}
                >
                  Add New Items
                </Button>
              </div>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-all">
              <div className="p-5 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <FiBarChart2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-1">Generate Reports</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create detailed inventory reports
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push("/reports")}
                >
                  View Reports
                </Button>
              </div>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-all">
              <div className="p-5 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <FiUsers className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-1">Team Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your team and permissions
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push("/users")}
                >
                  Manage Team
                </Button>
              </div>
            </Card>
          </section>
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
          <CategoryStatsCard
            title="Inventory by Category"
            categories={[
              {
                id: "1",
                name: "Meat",
                count: 35,
                change: 5,
                icon: <FiShoppingBag className="h-5 w-5 text-white" />,
                color: "bg-primary",
              },
              {
                id: "2",
                name: "Produce",
                count: 25,
                change: 3,
                icon: <FiHome className="h-5 w-5 text-white" />,
                color: "bg-green-500",
              },
              {
                id: "3",
                name: "Dairy",
                count: 18,
                change: -2,
                icon: <FiSettings className="h-5 w-5 text-white" />,
                color: "bg-blue-500",
              },
              {
                id: "4",
                name: "Dry Goods",
                count: 22,
                change: 0,
                icon: <FiBarChart2 className="h-5 w-5 text-white" />,
                color: "bg-amber-500",
              },
            ]}
            onViewAll={() => router.push("/inventory")}
          />
        </div>
      </div>
    </div>
  );
}
