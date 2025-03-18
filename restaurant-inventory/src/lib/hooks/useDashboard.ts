import { useEffect, useRef } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard-store';
import { useCurrency } from '@/lib/currency';

// Default refresh interval in milliseconds (5 minutes)
const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000;

export const useDashboard = (autoRefresh = true, refreshInterval = DEFAULT_REFRESH_INTERVAL) => {
    // Get the formatCurrency function from the currency context
    const { formatCurrency } = useCurrency();

    const {
        stats,
        salesData,
        categoryStats,
        recentActivity,
        inventoryAlerts,
        topSellingItems,
        isLoading,
        error,
        lastUpdated,
        shouldRefresh,
        refreshLock,
        fetchDashboardData,
        setShouldRefresh,
        resetLoadingState
    } = useDashboardStore();

    const isInitialMount = useRef(true);
    const hasDataRef = useRef(false);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);
    const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Check if we have meaningful data
    const hasData = stats.totalInventoryValue > 0 || salesData.length > 0 || categoryStats.length > 0;

    useEffect(() => {
        // Update hasDataRef when data changes
        hasDataRef.current = hasData;
    }, [hasData]);

    // Monitor loading state for hanging issues
    useEffect(() => {
        if (isLoading) {
            // If we start loading, set a safety timeout to clear the loading state
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
            }

            loadingTimerRef.current = setTimeout(() => {
                resetLoadingState();
            }, 10000);
        } else {
            // Clear the timer when loading finishes
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
            }
        }

        return () => {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
            }
        };
    }, [isLoading, resetLoadingState]);

    // Set up auto refresh if enabled
    useEffect(() => {
        // Only set up auto refresh when we're not already loading
        if (autoRefresh && !isLoading && !error && !refreshLock) {
            // Clear any existing timeout to prevent multiple timers
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }

            fetchTimeoutRef.current = setTimeout(() => {
                // Only set shouldRefresh if it's not already true and we're not in a refresh lock
                if (!shouldRefresh && !refreshLock && !isLoading) {
                    setShouldRefresh(true);
                }
            }, refreshInterval);
        }

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
                fetchTimeoutRef.current = null;
            }
        };
    }, [autoRefresh, refreshInterval, isLoading, error, refreshLock, setShouldRefresh, lastUpdated, shouldRefresh]);

    // Handle initial load and refresh requests
    useEffect(() => {
        // Clear any previous loading timer when effect reruns
        if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
            loadingTimerRef.current = null;
        }

        // Initial fetch on mount or explicit refresh
        if ((isInitialMount.current || shouldRefresh) && !isRefreshingRef.current && !isLoading) {
            isRefreshingRef.current = true;

            // Set a timeout to force reset loading state if it gets stuck
            loadingTimerRef.current = setTimeout(() => {
                if (isRefreshingRef.current) {
                    resetLoadingState();
                    isRefreshingRef.current = false;
                }
            }, 15000);

            // Only fetch if conditions are right
            fetchDashboardData()
                .catch(() => {
                    // Silently handle errors as they'll be reported in the store
                })
                .finally(() => {
                    isRefreshingRef.current = false;

                    // Clear the safety timeout
                    if (loadingTimerRef.current) {
                        clearTimeout(loadingTimerRef.current);
                        loadingTimerRef.current = null;
                    }
                });

            isInitialMount.current = false;
        }

        // Cleanup
        return () => {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
            }
        };
    }, [shouldRefresh, fetchDashboardData, isLoading, refreshLock, resetLoadingState]);

    // Format values for display - now using the currency context
    const formattedStats = {
        totalInventoryValue: formatCurrency(stats.totalInventoryValue || 0),
        lowStockItems: stats.lowStockItems || 0,
        monthlySales: formatCurrency(stats.monthlySales || 0),
        salesGrowth: `${stats.salesGrowth >= 0 ? '+' : ''}${stats.salesGrowth || 0}%`
    };

    // Helper function to check if data is stale
    const isDataStale = () => {
        if (!lastUpdated) return true;
        return Date.now() - lastUpdated > refreshInterval;
    };

    // Manual refresh function with safety checks
    const refresh = () => {
        // If already loading and it's been more than 10 seconds, force reset the loading state
        if (isLoading) {
            resetLoadingState();
        }

        // Only proceed if not locked, loading, or already refreshing
        if (!refreshLock && !isLoading && !isRefreshingRef.current) {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
                fetchTimeoutRef.current = null;
            }
            setShouldRefresh(true);
        }
    };

    return {
        stats: formattedStats,
        salesData,
        categoryStats,
        recentActivity,
        inventoryAlerts,
        topSellingItems,
        isLoading,
        isInitialLoad: isInitialMount.current,
        error,
        lastUpdated,
        shouldRefresh,
        refreshLock,
        refresh,
        refreshData: refresh, // Alias for backward compatibility
        isDataStale,
        hasData,
        resetLoadingState
    };
}; 