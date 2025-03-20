import { useEffect, useRef, useCallback } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard-store';
import { useCurrency } from '@/lib/hooks/useCurrency';

// Default refresh interval in milliseconds (10 minutes)
const DEFAULT_REFRESH_INTERVAL = 10 * 60 * 1000;

// Global variable to track initial fetch across all components
let globalInitialFetchDone = false;

// Global timestamp to track the last refresh across all components
let globalLastRefreshTime = 0;

// Global minimum time between refreshes (15 seconds)
const GLOBAL_MIN_REFRESH_INTERVAL = 15000;

/**
 * Custom hook for dashboard data management with improved refresh cycle handling
 */
export const useDashboard = (autoRefresh = false, refreshInterval = DEFAULT_REFRESH_INTERVAL) => {
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
        fetchInProgress,
        fetchDashboardData,
        setShouldRefresh
    } = useDashboardStore();

    // Get currency formatting from our custom hook
    const { formatCurrency, currencySymbol } = useCurrency();

    // Track component state with refs to avoid unnecessary rerenders
    const isInitialMount = useRef(!globalInitialFetchDone);
    const isRefreshingRef = useRef(false);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const localLastRefreshTime = useRef(globalLastRefreshTime);

    // Check if we have meaningful data
    const hasData = stats.totalInventoryValue > 0 || salesData.length > 0 || categoryStats.length > 0;

    // Format stats for display
    const formattedStats = {
        totalInventoryValue: formatCurrency(stats.totalInventoryValue || 0),
        lowStockItems: stats.lowStockItems || 0,
        monthlySales: formatCurrency(stats.monthlySales || 0),
        salesGrowth: `${stats.salesGrowth >= 0 ? '+' : ''}${stats.salesGrowth || 0}%`
    };

    // Helper function to check if data is stale
    const isDataStale = useCallback(() => {
        if (!lastUpdated) return true;
        return Date.now() - lastUpdated > refreshInterval;
    }, [lastUpdated, refreshInterval]);

    // Memoized refresh function with throttling
    const refreshData = useCallback(() => {
        // Prevent multiple rapid refreshes
        if (isRefreshingRef.current || fetchInProgress) {
            console.log('Refresh already in progress, ignoring request');
            return;
        }

        // Global throttling to prevent refresh storms
        const now = Date.now();
        if (now - globalLastRefreshTime < GLOBAL_MIN_REFRESH_INTERVAL) {
            console.log(`Global throttling active (${now - globalLastRefreshTime}ms since last refresh), skipping refresh`);
            return;
        }

        isRefreshingRef.current = true;
        globalLastRefreshTime = now;
        localLastRefreshTime.current = now;

        // Clear any existing refresh timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }

        // Set refresh flag to trigger data fetch
        setShouldRefresh(true);

        // Reset local flag after a delay
        setTimeout(() => {
            isRefreshingRef.current = false;
        }, 300);
    }, [fetchInProgress, setShouldRefresh]);

    // Initial fetch effect - runs only once across all instances
    useEffect(() => {
        if (isInitialMount.current) {
            console.log('Initial fetch triggered on first mount');
            isInitialMount.current = false;
            
            // Only set the global flag if we're actually going to fetch
            if (!fetchInProgress && !globalInitialFetchDone) {
                globalInitialFetchDone = true;
                
                // Use a small delay to avoid React 18 double mounting issues
                const initialFetchTimer = setTimeout(() => {
                    if (!fetchInProgress) {
                        setShouldRefresh(true);
                    }
                }, 50);

                return () => clearTimeout(initialFetchTimer);
            }
        }
    }, [setShouldRefresh, fetchInProgress]);

    // Handle the shouldRefresh flag
    useEffect(() => {
        // Only proceed if shouldRefresh is true, not already fetching, and not locally refreshing
        if (shouldRefresh && !fetchInProgress && !isRefreshingRef.current) {
            console.log('Processing shouldRefresh flag');
            
            fetchDashboardData()
                .catch(err => console.error('Error fetching dashboard data:', err))
                .finally(() => {
                    isRefreshingRef.current = false;
                });
        }
    }, [shouldRefresh, fetchDashboardData, fetchInProgress]);

    // Auto refresh effect with jitter
    useEffect(() => {
        // Skip if auto refresh is disabled or we're already loading
        if (!autoRefresh || isLoading) {
            return;
        }

        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        // Add jitter (±10%) to refresh interval to prevent refresh storms
        const jitter = Math.random() * 0.2 - 0.1; // Random value between -10% and +10%
        const jitteredInterval = refreshInterval * (1 + jitter);

        // Set up new timeout
        refreshTimeoutRef.current = setTimeout(() => {
            // Only refresh if data is stale
            if (isDataStale() && !fetchInProgress && !isRefreshingRef.current) {
                refreshData();
            }
        }, jitteredInterval);

        // Cleanup
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
                refreshTimeoutRef.current = null;
            }
        };
    }, [
        autoRefresh,
        refreshInterval,
        isLoading,
        fetchInProgress,
        refreshData,
        isDataStale
    ]);

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
        fetchInProgress,
        refresh: refreshData,
        isDataStale,
        hasData,
        currencySymbol
    };
};