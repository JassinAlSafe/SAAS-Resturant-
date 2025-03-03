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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-8 border-b mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4 sm:mb-0">
          Welcome to ShelfWise
        </h1>
        <div className="flex items-center">
          <CurrencySelector />
        </div>
      </div>

      {/* Stats Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-foreground/80">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Inventory Value"
            value={formatCurrency(stats.totalInventoryValue)}
            icon={<FiPackage className="h-5 w-5 text-primary" />}
            className="shadow-sm hover:shadow transition-shadow duration-200"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems.toString()}
            icon={<FiAlertTriangle className="h-5 w-5 text-amber-500" />}
            trend={{
              value: 3,
              isPositive: false,
            }}
            className="shadow-sm hover:shadow transition-shadow duration-200"
          />
          <StatCard
            title="Monthly Sales"
            value={formatCurrency(stats.monthlySales)}
            icon={<FiDollarSign className="h-5 w-5 text-green-600" />}
            className="shadow-sm hover:shadow transition-shadow duration-200"
          />
          <StatCard
            title="Sales Growth"
            value={`${stats.salesGrowth}%`}
            icon={<FiTrendingUp className="h-5 w-5 text-blue-600" />}
            trend={{
              value: 2.5,
              isPositive: true,
            }}
            className="shadow-sm hover:shadow transition-shadow duration-200"
          />
        </div>
      </section>

      {/* Charts Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-foreground/80">
          Analytics
        </h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesGrowthCard
              title="Sales Trend"
              totalRevenue={90000}
              averageMonthly={15000}
              highestMonth={17500}
              lowestMonth={12400}
              percentComplete={75}
              growthPercent={12.3}
              salesData={salesData}
            />
          </div>
          <div>
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
                  count: 15,
                  change: 2,
                  icon: <FiPackage className="h-5 w-5 text-white" />,
                  color: "bg-blue-500",
                },
                {
                  id: "4",
                  name: "Dry Goods",
                  count: 15,
                  change: 1,
                  icon: <FiBarChart2 className="h-5 w-5 text-white" />,
                  color: "bg-amber-500",
                },
                {
                  id: "5",
                  name: "Beverages",
                  count: 10,
                  change: 0,
                  icon: <FiSettings className="h-5 w-5 text-white" />,
                  color: "bg-red-500",
                },
              ]}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AlertCard
            title="Low Stock Alerts"
            alerts={stockAlerts}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </div>
        <div>
          <ExpiryAlerts />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <Card title="Quick Links">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="flex w-full items-center justify-start gap-2"
              >
                <FiPackage className="h-4 w-4" />
                <span>Manage Inventory</span>
              </Button>
              <Button
                variant="outline"
                className="flex w-full items-center justify-start gap-2"
              >
                <FiBarChart2 className="h-4 w-4" />
                <span>View Sales Reports</span>
              </Button>
              <Button
                variant="outline"
                className="flex w-full items-center justify-start gap-2"
              >
                <FiUsers className="h-4 w-4" />
                <span>Manage Suppliers</span>
              </Button>
              <Button
                variant="outline"
                className="flex w-full items-center justify-start gap-2"
              >
                <FiSettings className="h-4 w-4" />
                <span>System Settings</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
