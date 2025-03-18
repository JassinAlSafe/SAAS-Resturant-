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
                console.warn('Loading state stuck for 10 seconds, force resetting');
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
        // Only set up auto refresh when we're not already loading, not in an error state, and not locked
        if (autoRefresh && !isLoading && !error && !refreshLock) {
            // Clear any existing timeout to prevent multiple timers
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }

            fetchTimeoutRef.current = setTimeout(() => {
                console.log('Auto refresh timer triggered');
                // Only set shouldRefresh if it's not already true and we're not in a refresh lock
                if (!shouldRefresh && !refreshLock && !isLoading) {
                    console.log('Auto refresh initiated');
                    setShouldRefresh(true);
                } else {
                    console.log('Auto refresh skipped - refresh already pending or locked');
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
        // Initial fetch on mount or explicit refresh
        if ((isInitialMount.current || shouldRefresh) && !isRefreshingRef.current && !isLoading) {
            console.log('Fetch triggered, shouldRefresh:', shouldRefresh, 'refreshLock:', refreshLock);
            isRefreshingRef.current = true;

            // Only fetch if conditions are right
            fetchDashboardData()
                .catch(err => console.error('Error fetching dashboard data:', err))
                .finally(() => {
                    isRefreshingRef.current = false;
                });

            isInitialMount.current = false;
        }
    }, [shouldRefresh, fetchDashboardData, isLoading, refreshLock]);

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
        console.log('Manual refresh triggered, refreshLock:', refreshLock, 'isLoading:', isLoading);

        // If already loading and it's been more than 10 seconds, force reset the loading state
        if (isLoading) {
            console.log('Already loading, resetting loading state before continuing');
            resetLoadingState();
        }

        // Only proceed if not locked, loading, or already refreshing
        if (!refreshLock && !isLoading && !isRefreshingRef.current) {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
                fetchTimeoutRef.current = null;
            }
            console.log('Setting shouldRefresh to true');
            setShouldRefresh(true);
        } else {
            console.log('Manual refresh blocked - already in progress or locked');
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