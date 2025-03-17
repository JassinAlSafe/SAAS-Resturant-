"use client";

import { useEffect, ReactNode, useRef } from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { FiRefreshCw } from "react-icons/fi";

interface DashboardDataProviderProps {
  children: ReactNode;
  showLoading?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function DashboardDataProvider({
  children,
  showLoading = true,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: DashboardDataProviderProps) {
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const isRefreshingRef = useRef(false);

  // Track loading duration to prevent endless loading states
  const loadingStartTimeRef = useRef<number | null>(null);
  const MAX_LOADING_DURATION = 20000; // 20 seconds max loading time
  const lastRefreshAttemptRef = useRef<number>(0);
  const MIN_REFRESH_INTERVAL = 3000; // Minimum 3 seconds between refresh attempts

  const { isLoading, isInitialLoad, error, refreshData, hasData } =
    useDashboard(autoRefresh, refreshInterval);

  // If we get an error, we can try to refresh after a delay
  useEffect(() => {
    if (error) {
      // Clear any existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Set new timeout
      retryTimeoutRef.current = setTimeout(() => {
        console.log("Retrying dashboard data fetch due to previous error...");
        triggerRefresh();
      }, 30000); // Retry after 30 seconds
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [error]);

  // Track loading time and force stop loading if it takes too long
  useEffect(() => {
    if (isLoading) {
      if (loadingStartTimeRef.current === null) {
        loadingStartTimeRef.current = Date.now();
      } else if (
        Date.now() - loadingStartTimeRef.current >
        MAX_LOADING_DURATION
      ) {
        console.warn("Loading taking too long, forcing refresh");
        triggerRefresh();
      }
    } else {
      loadingStartTimeRef.current = null;
    }
  }, [isLoading]);

  // Helper function to prevent too frequent refreshes
  const triggerRefresh = () => {
    const now = Date.now();
    if (now - lastRefreshAttemptRef.current < MIN_REFRESH_INTERVAL) {
      console.log("Refresh attempted too soon, skipping");
      return;
    }

    if (isRefreshingRef.current) {
      console.log("Already refreshing, skipping duplicate request");
      return;
    }

    isRefreshingRef.current = true;
    lastRefreshAttemptRef.current = now;

    // Add small delay to allow state to settle
    setTimeout(() => {
      refreshData();
      // Reset refreshing flag after a short delay
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 200);
    }, 50);
  };

  // Show loading state only during initial load
  if (isInitialLoad && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner className="h-8 w-8" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading dashboard data...
        </span>
      </div>
    );
  }

  // Show error state with retry button
  if (error && showLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-destructive/10 rounded-md border border-destructive/20 min-h-[300px]">
        <p className="text-center text-destructive font-medium mb-2">
          Failed to load dashboard data
        </p>
        <p className="text-center text-muted-foreground text-sm mb-4">
          {error}
        </p>
        <Button
          onClick={() => {
            // Clear retry timeout when manually retrying
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }
            triggerRefresh();
          }}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <FiRefreshCw className="h-4 w-4" />
          Retry Now
        </Button>
      </div>
    );
  }

  // Only show a loading overlay for subsequent refreshes if there's no data yet
  if (isLoading && !isInitialLoad && showLoading && !hasData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner className="h-8 w-8" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading dashboard data...
        </span>
      </div>
    );
  }

  // For normal refreshes with existing data, we'll use a less intrusive indicator in the UI
  // rather than a full overlay that blocks interaction
  return <>{children}</>;
}
