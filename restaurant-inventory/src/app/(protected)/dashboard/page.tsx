"use client";

import { useState } from "react";
import { FiSearch, FiSettings } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

// Import dashboard components
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { QuickAccessToolbar } from "@/components/dashboard/quick-access-toolbar";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { InventoryTab } from "@/components/dashboard/inventory-tab";
import { SalesTab } from "@/components/dashboard/sales-tab";
import { DashboardDataProvider } from "@/components/dashboard/DashboardDataProvider";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { TabRefreshIndicator } from "./components/TabRefreshIndicator";
import { LoadingStatusBanner } from "./components/LoadingStatusBanner";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardDataProvider>
      <DashboardContent
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </DashboardDataProvider>
  );
}

// Using a separate component for the dashboard content enables us to access the dashboard data
// without unnecessarily re-rendering the parent component
function DashboardContent({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const { isLoading, isInitialLoad, error, refreshData } = useDashboard();

  // Show error message if there was an error fetching data
  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 text-center">
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
      {/* Header */}
      <PageHeader
        title="Welcome to ShelfWise"
        actions={
          <div className="flex items-center gap-2">
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
      <QuickAccessToolbar isLoading={isLoading} />

      {/* Error banner */}
      {error && (
        <div className="mb-4">
          <LoadingStatusBanner error={error} onRetry={refreshData} />
        </div>
      )}

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="mb-6">
        <div className="space-y-4">
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

          <TabRefreshIndicator
            isRefreshing={isLoading}
            onRefresh={refreshData}
          />
        </div>

        <TabsContent value="overview" className="m-0 pt-4">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="inventory" className="m-0 pt-4">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="sales" className="m-0 pt-4">
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
