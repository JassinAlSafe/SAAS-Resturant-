"use client";

import { useEffect, ReactNode, useRef, useState, useCallback } from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";

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
  // Track retries and component state
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const loadingStartTimeRef = useRef<number | null>(null);
  const [hasRetried, setHasRetried] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Constants for timeouts
  const MAX_LOADING_DURATION = 15000; // 15 seconds max loading time
  const RETRY_INTERVAL = 30000; // 30 seconds between auto-retries

  // Get dashboard data and state
  const {
    isLoading,
    isInitialLoad,
    error,
    refresh,
    hasData,
    lastUpdated,
  } = useDashboard(autoRefresh, refreshInterval);

  // Helper for safe refreshing - wrapped in useCallback to prevent recreation on each render
  const triggerRefresh = useCallback(() => {
    setIsRetrying(true);

    // Clear any existing retry timeout when manually retrying
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }

    // Add a small delay for UI feedback
    setTimeout(() => {
      refresh();

      // Reset retrying state after a short delay
      setTimeout(() => {
        setIsRetrying(false);
        setHasRetried(true);
      }, 500);
    }, 100);
  }, [refresh, setIsRetrying, setHasRetried]);

  // Set up automatic retry on error
  useEffect(() => {
    if (error && !isRetrying) {
      // Clear any existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Set new timeout for retry
      retryTimeoutRef.current = setTimeout(() => {
        console.log("Auto-retrying dashboard data fetch due to error...");
        triggerRefresh();
      }, RETRY_INTERVAL);
    } else if (!error) {
      // Reset retry flag when error resolves
      setHasRetried(false);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [error, isRetrying, triggerRefresh]);

  // Track loading time and prevent endless loading states
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
  }, [isLoading, triggerRefresh]);

  // Show loading state during initial load
  if (isInitialLoad && showLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-background rounded-md border p-6">
        <LoadingSpinner className="h-8 w-8 mb-4" />
        <span className="text-sm text-muted-foreground">
          Loading dashboard data...
        </span>
      </div>
    );
  }

  // Show error state with retry button
  if (error && showLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-destructive/10 rounded-md border border-destructive/20 min-h-[300px]">
        <FiAlertCircle className="h-10 w-10 text-destructive mb-4" />
        <p className="text-center text-destructive font-medium mb-2">
          Failed to load dashboard data
        </p>
        <p className="text-center text-muted-foreground text-sm mb-4 max-w-md">
          {error}
        </p>
        <Button
          onClick={triggerRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isRetrying}
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
          />
          {isRetrying
            ? "Retrying..."
            : hasRetried
            ? "Retry Again"
            : "Retry Now"}
        </Button>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-4">
            Last successful update: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </div>
    );
  }

  // Only show a loading overlay for initial load with no data
  if (isLoading && !hasData && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner className="h-8 w-8" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading dashboard data...
        </span>
      </div>
    );
  }

  // For normal refreshes with existing data, render children
  // without any loading indicator
  return (
    <div className="relative">
      {children}
    </div>
  );
}
