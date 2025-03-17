"use client";

import { useState, useEffect } from "react";
import { FiAlertTriangle, FiSearch, FiSettings } from "react-icons/fi";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

// Import the extracted components
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { QuickAccessToolbar } from "@/components/dashboard/quick-access-toolbar";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { InventoryTab } from "@/components/dashboard/inventory-tab";
import { SalesTab } from "@/components/dashboard/sales-tab";

// Import our new DashboardDataProvider and hook
import { DashboardDataProvider } from "@/components/dashboard/DashboardDataProvider";
import { useDashboard } from "@/lib/hooks/useDashboard";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // If still loading auth or not authenticated, show loading state
  if (authLoading || !user) {
    return <DashboardLoadingState />;
  }

  return (
    <DashboardDataProvider>
      <DashboardContent
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </DashboardDataProvider>
  );
}

// Separated component that uses the dashboard store
function DashboardContent({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const { isLoading, isInitialLoad, error, refreshData, isDataStale } =
    useDashboard();

  // Track how long we've been in the loading state
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  useEffect(() => {
    if (isLoading && loadingStartTime === null) {
      setLoadingStartTime(Date.now());
    } else if (!isLoading && loadingStartTime !== null) {
      setLoadingStartTime(null);
    }

    // Force exit loading state if it's been loading for too long (30 seconds)
    if (loadingStartTime && Date.now() - loadingStartTime > 30000) {
      console.warn("Loading has taken too long, forcing refresh");
      refreshData();
      setLoadingStartTime(null);
    }
  }, [isLoading, loadingStartTime, refreshData]);

  // Show error message if there was an error fetching data
  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Error Loading Dashboard Data
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={refreshData}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show a loading skeleton during initial load
  if (isInitialLoad) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
      {/* Header - Using the improved PageHeader component */}
      <PageHeader
        title="Welcome to ShelfWise"
        onRefresh={refreshData}
        isLoading={isLoading}
        actions={
          <div className="flex items-center gap-2">
            {isDataStale() && !isLoading && (
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
                className="pl-9 pr-4 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/30 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        }
      />

      {/* Quick Access Toolbar */}
      <QuickAccessToolbar onRefresh={refreshData} isLoading={isLoading} />

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
          <OverviewTab />
        </TabsContent>

        <TabsContent value="inventory" className="m-0">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="sales" className="m-0">
          <SalesTab />
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
