"use client";

import { useState, useEffect } from "react";
import { FiAlertTriangle, FiSearch, FiSettings } from "react-icons/fi";
import { DashboardStats, CategoryStat } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { dashboardService } from "@/lib/services/dashboard-service";

// Import the extracted components
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { QuickAccessToolbar } from "@/components/dashboard/quick-access-toolbar";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { InventoryTab } from "@/components/dashboard/inventory-tab";
import { SalesTab } from "@/components/dashboard/sales-tab";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalInventoryValue: 0,
    lowStockItems: 0,
    monthlySales: 0,
    salesGrowth: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<
    { month: string; sales: number }[]
  >([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<
    {
      action: string;
      item: string;
      timestamp: string;
      user: string;
    }[]
  >([]);
  const [isDataStale, setIsDataStale] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");



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

    // Set up auto-refresh indicator - after 5 minutes, data is considered stale
    const staleDataTimeout = setTimeout(() => {
      setIsDataStale(true);
    }, 5 * 60 * 1000);

    return () => clearTimeout(staleDataTimeout);
  }, [user]);

  // Function to fetch all dashboard data using the dashboard service
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setIsDataStale(false);
    try {
      const data = await dashboardService.fetchDashboardData();
      setStats(data.stats);
      setSalesData(data.salesData);
      setCategoryStats(data.categoryStats);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (!user) return; // Don't refresh if user is not authenticated
    fetchDashboardData();
  };

  // If still loading auth or not authenticated, show loading state
  if (authLoading || !user) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
      {/* Header - Using the improved PageHeader component */}
      <PageHeader
        title="Welcome to ShelfWise"
        onRefresh={handleRefresh}
        isLoading={isLoading}
        actions={
          <div className="flex items-center gap-2">
            {isDataStale && (
              <div className="bg-amber-100 text-amber-800 px-3 py-1 text-xs rounded-md flex items-center mr-2">
                <FiAlertTriangle className="mr-1 h-3 w-3" /> Data may be
                outdated
              </div>
            )}
            <div className="relative hidden sm:block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="pl-9 pr-4 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Currency selector removed */}
          </div>
        }
      />

      {/* Quick Access Toolbar */}
      <QuickAccessToolbar onRefresh={handleRefresh} isLoading={isLoading} />

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="mb-6">
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

        <TabsContent value="overview" className="m-0">
          <OverviewTab
            stats={stats}
            salesData={salesData}
            categoryStats={categoryStats}
            recentActivity={recentActivity}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="inventory" className="m-0">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="sales" className="m-0">
          <SalesTab isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      {/* Fixed Bottom Help Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          className="rounded-full shadow-lg flex items-center gap-1"
        >
          <FiSettings className="h-4 w-4" /> Help & Settings
        </Button>
      </div>
    </div>
  );
}
