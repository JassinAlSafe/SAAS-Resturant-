"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiSettings, FiRefreshCw, FiClock } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { InventoryTab } from "@/components/dashboard/inventory-tab";
import { SalesTab } from "@/components/dashboard/sales-tab";
import { DashboardDataProvider } from "@/components/dashboard/DashboardDataProvider";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useAuth } from "@/lib/services/auth-context";
import { getBusinessProfileName } from "@/lib/services/dashboard/profile-service";
import { debounce } from "lodash";

export default function DashboardPage() {
  const { user, session, isLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !user && !session) {
      console.log("No user or session found, redirecting to login");
      // Use router with returnTo parameter for better user experience
      router.push(
        `/login?returnTo=${encodeURIComponent(window.location.pathname)}`
      );
    }
  }, [user, session, isLoading, router]);

  // If loading or not authenticated, show loading state
  if (isLoading || (!user && !session)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white"
        aria-live="polite"
      >
        <div className="flex flex-col items-center">
          <div
            className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Loading"
          ></div>
          <p className="mt-4 text-black">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
  const { error, refresh } = useDashboard();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [businessName, setBusinessName] = useState("O/O Brewing");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isBusinessLoading, setIsBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState<Error | null>(null);

  // Debounced search handler for better performance
  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    [setSearchQuery]
  );

  // Handle search input changes
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetSearchQuery(e.target.value);
    },
    [debouncedSetSearchQuery]
  );

  // Handle tab changes
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Navigate to settings
  const navigateToSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Fetch business name and update time
  useEffect(() => {
    const fetchBusinessName = async () => {
      setIsBusinessLoading(true);
      try {
        const name = await getBusinessProfileName();
        if (name) {
          setBusinessName(name);
        }
      } catch (error) {
        console.error("Failed to fetch business name:", error);
        setBusinessError(error as Error);
      } finally {
        setIsBusinessLoading(false);
      }
    };

    fetchBusinessName();

    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Memoize formatted date to prevent unnecessary renders
  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [currentTime]);

  // Show error message if there was an error fetching data
  if (error) {
    return (
      <div
        className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 text-center"
        aria-live="assertive"
      >
        <div
          className="alert alert-error shadow-sm bg-white border border-red-500"
          role="alert"
        >
          <div className="flex flex-col items-center">
            <FiRefreshCw
              className="h-8 w-8 mb-4 text-orange-500"
              aria-hidden="true"
            />
            <h2 className="text-2xl font-semibold mb-3 text-black">
              Error Loading Dashboard Data
            </h2>
            <p className="mb-6 max-w-lg mx-auto text-black">
              {typeof error === "string"
                ? error
                : "We encountered an issue while loading your dashboard data. Please try refreshing."}
            </p>
            <Button
              onClick={handleRefresh}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Refresh Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with business name, date, search and settings */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {isBusinessLoading ? "Loading..." : businessName}
          </h1>
          {businessError && (
            <p className="text-red-500 text-sm mt-1">
              Error: {businessError.message}
            </p>
          )}
          <div className="flex items-center text-gray-500 text-sm">
            <FiClock className="mr-1 h-4 w-4" aria-hidden="true" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <label htmlFor="dashboard-search" className="sr-only">
              Search dashboard
            </label>
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="dashboard-search"
              type="text"
              placeholder="Search..."
              defaultValue={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 py-2 pr-3 rounded-md border border-gray-300 w-[220px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              aria-label="Search dashboard"
            />
          </div>
          <Button
            onClick={navigateToSettings}
            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 flex items-center"
          >
            <FiSettings className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav role="navigation" aria-label="Dashboard sections">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8" role="tablist">
            <button
              role="tab"
              id="overview-tab"
              aria-controls="overview-panel"
              aria-selected={activeTab === "overview"}
              className={`pb-3 px-1 ${
                activeTab === "overview"
                  ? "text-black font-medium border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-orange-500"
              }`}
              onClick={() => handleTabChange("overview")}
            >
              Overview
            </button>
            <button
              role="tab"
              id="inventory-tab"
              aria-controls="inventory-panel"
              aria-selected={activeTab === "inventory"}
              className={`pb-3 px-1 ${
                activeTab === "inventory"
                  ? "text-black font-medium border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-orange-500"
              }`}
              onClick={() => handleTabChange("inventory")}
            >
              Inventory
            </button>
            <button
              role="tab"
              id="sales-tab"
              aria-controls="sales-panel"
              aria-selected={activeTab === "sales"}
              className={`pb-3 px-1 ${
                activeTab === "sales"
                  ? "text-black font-medium border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-orange-500"
              }`}
              onClick={() => handleTabChange("sales")}
            >
              Sales
            </button>
          </div>
        </div>
      </nav>

      {/* Render the active tab content */}
      <div className="space-y-6">
        <div
          role="tabpanel"
          id="overview-panel"
          aria-labelledby="overview-tab"
          hidden={activeTab !== "overview"}
        >
          {activeTab === "overview" && <OverviewTab />}
        </div>

        <div
          role="tabpanel"
          id="inventory-panel"
          aria-labelledby="inventory-tab"
          hidden={activeTab !== "inventory"}
        >
          {activeTab === "inventory" && (
            <InventoryTab searchQuery={searchQuery} />
          )}
        </div>

        <div
          role="tabpanel"
          id="sales-panel"
          aria-labelledby="sales-tab"
          hidden={activeTab !== "sales"}
        >
          {activeTab === "sales" && <SalesTab />}
        </div>
      </div>
    </>
  );
}

// Recommendation: Extract DashboardContent to its own file
// export default DashboardContent;
