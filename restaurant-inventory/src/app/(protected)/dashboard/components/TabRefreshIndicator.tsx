"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/stores/dashboard-store";

interface TabRefreshIndicatorProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function TabRefreshIndicator({
  isRefreshing,
  onRefresh,
}: TabRefreshIndicatorProps) {
  // Get refresh lock state directly from store
  const refreshLock = useDashboardStore((state) => state.refreshLock);
  const resetLoadingState = useDashboardStore(
    (state) => state.resetLoadingState
  );

  // Use state to control visibility of the indicator and button enabled state
  const [isVisible, setIsVisible] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showForceReset, setShowForceReset] = useState(false);

  // Track previous refresh state to detect changes
  const prevRefreshingRef = useRef(isRefreshing);
  // Track whether an auto-hide is in progress
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track last refresh time to prevent too frequent refreshes
  const lastRefreshTimeRef = useRef<number>(0);
  // Track loading duration to detect stuck states
  const loadingStartTimeRef = useRef<number | null>(null);
  // Minimum time between refreshes (5 seconds)
  const MIN_REFRESH_INTERVAL = 5000;
  // Threshold for stuck loading state (8 seconds)
  const STUCK_LOADING_THRESHOLD = 8000;

  // Monitor loading state duration
  useEffect(() => {
    if (isRefreshing) {
      if (!loadingStartTimeRef.current) {
        loadingStartTimeRef.current = Date.now();

        // Set a timer to show force reset button if loading takes too long
        const timer = setTimeout(() => {
          if (isRefreshing && loadingStartTimeRef.current) {
            setShowForceReset(true);
          }
        }, STUCK_LOADING_THRESHOLD);

        return () => clearTimeout(timer);
      }
    } else {
      loadingStartTimeRef.current = null;
      setShowForceReset(false);
    }
  }, [isRefreshing]);

  // Debounced refresh handler with rate limiting
  const handleRefresh = useCallback(() => {
    const now = Date.now();

    // Skip if currently refreshing, button disabled, or in a refresh lock
    if (isRefreshing || isButtonDisabled || refreshLock) {
      return;
    }

    // Check if enough time has passed since last refresh
    if (now - lastRefreshTimeRef.current < MIN_REFRESH_INTERVAL) {
      return;
    }

    // Update last refresh time
    lastRefreshTimeRef.current = now;

    // Disable the button temporarily and show the indicator
    setIsButtonDisabled(true);
    setIsVisible(true);

    // Call the refresh function
    onRefresh();

    // Re-enable after cooldown (longer than the refresh lock to ensure it's available only after lock is released)
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 6000);
  }, [isRefreshing, isButtonDisabled, refreshLock, onRefresh]);

  // Handler for force resetting loading state
  const handleForceReset = useCallback(() => {
    resetLoadingState();
    setShowForceReset(false);

    // Allow a new refresh after a short delay
    setTimeout(() => {
      if (!isRefreshing) {
        onRefresh();
      }
    }, 1000);
  }, [resetLoadingState, isRefreshing, onRefresh]);

  // Update visibility when isRefreshing changes
  useEffect(() => {
    // Skip effect if refresh state hasn't changed
    if (isRefreshing === prevRefreshingRef.current) return;

    // If we're starting to refresh, show the indicator
    if (isRefreshing && !prevRefreshingRef.current) {
      setIsVisible(true);

      // Clear any existing timer
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = null;
      }
    }

    // If we've finished refreshing, start the hide timer
    if (!isRefreshing && prevRefreshingRef.current) {
      // Auto-hide after 3 seconds
      autoHideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        autoHideTimerRef.current = null;
      }, 3000);
    }

    // Update previous state
    prevRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = null;
      }
    };
  }, []);

  // Don't render if not visible, not refreshing, or in a refresh lock (unless showing force reset)
  if (
    (!isVisible && !isRefreshing && !showForceReset) ||
    (refreshLock && !isRefreshing && !showForceReset)
  )
    return null;

  return (
    <div className="w-full flex items-center justify-center py-3 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
        <FiRefreshCw
          className={cn("h-4 w-4", isRefreshing && "animate-spin")}
        />
        <span className="text-sm font-medium">
          {isRefreshing
            ? "Refreshing dashboard data..."
            : "Dashboard data refreshed"}
        </span>

        {!isRefreshing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isButtonDisabled || refreshLock}
            className={cn(
              "ml-2 h-8 px-2 py-1 hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-400",
              (isButtonDisabled || refreshLock) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            Refresh
          </Button>
        )}

        {showForceReset && (
          <div className="ml-4 flex items-center gap-2">
            <FiAlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Loading seems stuck
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceReset}
              className="ml-1 h-7 px-2 py-0.5 text-xs bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
