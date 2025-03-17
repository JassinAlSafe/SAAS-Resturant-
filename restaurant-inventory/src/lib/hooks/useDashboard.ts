import { useEffect, useRef } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard-store';
import { formatCurrency } from '@/lib/utils/format';

// Default refresh interval in milliseconds (5 minutes)
const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000;

export const useDashboard = (autoRefresh = true, refreshInterval = DEFAULT_REFRESH_INTERVAL) => {
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
        fetchDashboardData,
        setShouldRefresh
    } = useDashboardStore();

    const isInitialMount = useRef(true);
    const hasDataRef = useRef(false);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    // Check if we have meaningful data
    const hasData = stats.totalInventoryValue > 0 || salesData.length > 0 || categoryStats.length > 0;

    useEffect(() => {
        // Update hasDataRef when data changes
        hasDataRef.current = hasData;
    }, [hasData]);

    // Set up auto refresh if enabled
    useEffect(() => {
        // Only set up auto refresh when we're not already loading and not in an error state
        if (autoRefresh && !isLoading && !error) {
            // Clear any existing timeout to prevent multiple timers
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }

            fetchTimeoutRef.current = setTimeout(() => {
                console.log('Auto refresh triggered');
                // Only set shouldRefresh if it's not already true
                if (!shouldRefresh) {
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
    }, [autoRefresh, refreshInterval, isLoading, error, setShouldRefresh, lastUpdated, shouldRefresh]);

    useEffect(() => {
        // Break circular update pattern by using a ref to track state
        // Initial fetch on mount or explicit refresh
        if ((isInitialMount.current || shouldRefresh) && !isRefreshingRef.current) {
            console.log('Initial fetch or refresh triggered, shouldRefresh:', shouldRefresh);
            isRefreshingRef.current = true;

            // Only fetch if not already loading
            if (!isLoading) {
                fetchDashboardData()
                    .catch(err => console.error('Error fetching dashboard data:', err))
                    .finally(() => {
                        isRefreshingRef.current = false;
                    });
            } else {
                isRefreshingRef.current = false;
            }

            // Clear the refresh flag, but only if it's currently set
            if (shouldRefresh) {
                setShouldRefresh(false);
            }

            isInitialMount.current = false;
        }
    }, [shouldRefresh, fetchDashboardData, setShouldRefresh, isLoading]);

    // Format values for display
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

    // Allow manual refresh
    const refresh = () => {
        console.log('Manual refresh triggered');
        // Prevent multiple rapid refreshes
        if (!isRefreshingRef.current && !isLoading) {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
                fetchTimeoutRef.current = null;
            }
            setShouldRefresh(true);
        } else {
            console.log('Refresh already in progress, ignoring request');
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
        refresh,
        refreshData: refresh, // Alias for backward compatibility
        isDataStale,
        hasData
    };
}; 