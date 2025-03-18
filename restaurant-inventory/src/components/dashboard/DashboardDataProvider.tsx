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
  // Track loading duration to prevent endless loading states
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_LOADING_DURATION = 10000; // 10 seconds max loading time

  const { isLoading, isInitialLoad, error, refreshData, resetLoadingState } =
    useDashboard(autoRefresh, refreshInterval);

  // Track loading time and force stop loading if it takes too long
  useEffect(() => {
    if (isLoading) {
      // Set a timeout to force-clear the loading state if it takes too long
      loadingTimeoutRef.current = setTimeout(() => {
        resetLoadingState();
      }, MAX_LOADING_DURATION);

      return () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      };
    } else if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [isLoading, resetLoadingState]);

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
          onClick={refreshData}
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

  // For normal refreshes with existing data, just render children
  return <>{children}</>;
}
