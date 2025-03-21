"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiSettings, FiRefreshCw, FiClock } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { InventoryTab } from "@/components/dashboard/inventory-tab";
import { SalesTab } from "@/components/dashboard/sales-tab";
import { DashboardDataProvider } from "@/components/dashboard/DashboardDataProvider";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { getBusinessProfileName } from "@/lib/services/dashboard/profile-service";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user, session, isLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !user && !session) {
      console.log("No user or session found, redirecting to login");
      // Use window.location for a hard redirect to clear any stale state
      window.location.href = "/login?redirect=dashboard";
    }
  }, [user, session, isLoading, router]);

  // If loading or not authenticated, show loading state
  if (isLoading || (!user && !session)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <p className="mt-4 text-slate-500">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="px-4 py-6 md:px-8 lg:px-12 max-w-7xl mx-auto space-y-6">
        <DashboardDataProvider autoRefresh={true}>
          <DashboardContent 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </DashboardDataProvider>
      </div>
    </div>
  );
}

function DashboardContent({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const { error, refresh, lastUpdated } = useDashboard();
  const [businessName, setBusinessName] = useState("My Business");
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchBusinessName = async () => {
      try {
        const name = await getBusinessProfileName();
        if (name) {
          setBusinessName(name);
        }
      } catch (error) {
        console.error("Failed to fetch business name:", error);
      }
    };

    fetchBusinessName();
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    
    const now = new Date();
    const updated = new Date(lastUpdated);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return updated.toLocaleString();
  };

  // Show error message if there was an error fetching data
  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-8 mb-6 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-400 mb-4">
            <FiRefreshCw className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-3">
            Error Loading Dashboard Data
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-6 max-w-lg mx-auto">
            {typeof error === 'string' ? error : "We encountered an issue while loading your dashboard data. Please try refreshing."}
          </p>
          <Button 
            onClick={() => refresh()} 
            className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 dark:bg-red-800/40 dark:hover:bg-red-800/60 dark:text-red-300 dark:border-red-700/50"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <FiClock className="h-3.5 w-3.5" />
            <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome to <span className="text-primary">{businessName}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here&apos;s what&apos;s happening with your inventory today.
          </p>
          {lastUpdated && (
            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <span>Last updated: {formatLastUpdated()}</span>
              <button 
                onClick={() => refresh()} 
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                title="Refresh dashboard data"
              >
                <FiRefreshCw className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full md:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
            />
          </div>
          <Button 
            onClick={() => router.push('/settings')}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center gap-2 shadow-sm hover:shadow py-2.5"
          >
            <FiSettings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="bg-slate-100 p-0 h-auto shadow-none border-0 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="px-6 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-600"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="inventory"
              className="px-6 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-600"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger 
              value="sales"
              className="px-6 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-600"
            >
              Sales
            </TabsTrigger>
          </TabsList>
          
          <button 
            onClick={() => refresh()} 
            className="flex items-center text-slate-600 hover:text-primary text-sm"
          >
            <FiRefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <SalesTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
