"use client";

import { useEffect, ReactNode, useRef, useState, useCallback } from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
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
  } = useDashboard(autoRefresh, refreshInterval);

  // Helper for safe refreshing - wrapped in useCallback to prevent recreation on each render
  const triggerRefresh = useCallback(() => {
    setIsRetrying(true);

    // Clear any existing retry timeout when manually retrying
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }

    // Reset loading start time
    loadingStartTimeRef.current = Date.now();

    // Trigger refresh
    refresh();

    // Reset retry state after a delay
    setTimeout(() => {
      setIsRetrying(false);
      setHasRetried(true);
    }, 1000);
  }, [refresh]);

  // Effect to handle loading timeout
  useEffect(() => {
    // Track loading start time
    if (isLoading && !loadingStartTimeRef.current) {
      loadingStartTimeRef.current = Date.now();
    } else if (!isLoading) {
      loadingStartTimeRef.current = null;
    }

    // If loading takes too long, set up auto-retry
    if (isLoading && loadingStartTimeRef.current) {
      const loadingDuration = Date.now() - loadingStartTimeRef.current;
      
      if (loadingDuration > MAX_LOADING_DURATION && !retryTimeoutRef.current && !isRetrying) {
        console.log(`Dashboard loading timeout after ${loadingDuration}ms, scheduling auto-retry`);
        
        retryTimeoutRef.current = setTimeout(() => {
          console.log('Auto-retrying dashboard data fetch');
          triggerRefresh();
          retryTimeoutRef.current = undefined;
        }, RETRY_INTERVAL);
      }
    }

    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = undefined;
      }
    };
  }, [isLoading, isRetrying, triggerRefresh]);

  // If there's an error and we've already retried, show error state
  if (error && hasRetried) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <FiAlertCircle className="w-12 h-12 text-error" />
        <h2 className="text-xl font-semibold text-base-content">Failed to load dashboard data</h2>
        <p className="text-base-content/70 max-w-md">
          {error || "There was a problem loading your dashboard. Please try again."}
        </p>
        <Button 
          onClick={triggerRefresh} 
          variant="error" 
          className="mt-4"
          disabled={isRetrying}
          loading={isRetrying}
        >
          {!isRetrying && <FiRefreshCw className="mr-2" />}
          {isRetrying ? "Retrying..." : "Retry"}
        </Button>
      </div>
    );
  }

  // If we're still loading and should show loading state
  if ((isLoading || isInitialLoad) && showLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/70">Loading dashboard data...</p>
      </div>
    );
  }

  // If we have no data but we're not loading, show empty state
  if (!hasData && !isLoading && !isInitialLoad) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="avatar placeholder">
          <div className="bg-base-300 text-base-content rounded-full w-16">
            <span className="text-2xl">?</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-base-content">No dashboard data available</h2>
        <p className="text-base-content/70 max-w-md">
          We couldn&apos;t find any data for your dashboard. This could be because your account is new or there&apos;s no activity yet.
        </p>
        <Button 
          onClick={triggerRefresh} 
          variant="primary" 
          className="mt-4"
          disabled={isRetrying}
          loading={isRetrying}
        >
          {!isRetrying && <FiRefreshCw className="mr-2" />}
          {isRetrying ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    );
  }

  // Render children with data
  return <>{children}</>;
}
