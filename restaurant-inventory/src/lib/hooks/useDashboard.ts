import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard-store';
import { useCurrency } from '@/lib/hooks/useCurrency';

// Constants for configuration
const DEFAULT_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const GLOBAL_MIN_REFRESH_INTERVAL = 15000; // 15 seconds minimum between refreshes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Use a React-friendly singleton pattern instead of globals
const dashboardState = {
    initialFetchDone: false,
    lastRefreshTime: 0,
    retryCount: 0,
    activeInstances: 0
};

/**
 * Enhanced hook for dashboard data management with improved refresh handling,
 * error recovery, and performance optimizations
 */
export const useDashboard = (autoRefresh = false, refreshInterval = DEFAULT_REFRESH_INTERVAL) => {
    // Access store state and actions
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

    // Currency formatting
    const { formatCurrency, currencySymbol } = useCurrency();

    // Component state with refs to prevent unnecessary renders
    const componentId = useRef(`dashboard-${Math.random().toString(36).substring(2, 9)}`);
    const isInitialMount = useRef(!dashboardState.initialFetchDone);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const localLastRefreshTime = useRef(dashboardState.lastRefreshTime);

    // Tracking state for debugging and UI feedback
    const [lastRefreshAttempt, setLastRefreshAttempt] = useState<number | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(isInitialMount.current);

    // Track component instances for better cleanup
    useEffect(() => {
        dashboardState.activeInstances++;

        return () => {
            dashboardState.activeInstances--;

            // Reset global state if no instances remain
            if (dashboardState.activeInstances === 0) {
                dashboardState.retryCount = 0;
            }
        };
    }, []);

    // Check if we have meaningful data - memoized for performance
    const hasData = useMemo(() => {
        // Check if we have any sales data
        const hasSalesData = salesData?.length > 0;

        // Check if we have any stats data with real values
        const hasStatsData = stats && (
            stats.totalInventoryValue > 0 ||
            stats.lowStockItems > 0 ||
            stats.monthlySales > 0 ||
            stats.salesGrowth !== 0
        );

        // Check if we have any other data types
        const hasCategoryData = categoryStats?.length > 0;
        const hasActivityData = recentActivity?.length > 0;
        const hasAlertData = inventoryAlerts?.length > 0;
        const hasTopSellingData = topSellingItems?.length > 0;

        return hasSalesData || hasStatsData || hasCategoryData ||
            hasActivityData || hasAlertData || hasTopSellingData;
    }, [salesData, stats, categoryStats, recentActivity, inventoryAlerts, topSellingItems]);

    // Format stats for display - memoized to prevent unnecessary recalculation
    const formattedStats = useMemo(() => ({
        totalInventoryValue: formatCurrency(stats.totalInventoryValue || 0),
        lowStockItems: stats.lowStockItems || 0,
        monthlySales: formatCurrency(stats.monthlySales || 0),
        salesGrowth: `${stats.salesGrowth >= 0 ? '+' : ''}${stats.salesGrowth || 0}%`
    }), [stats, formatCurrency]);

    // Calculate data freshness state
    const dataState = useMemo(() => {
        if (!lastUpdated) return 'stale';
        const ageInMs = Date.now() - lastUpdated;

        if (ageInMs < refreshInterval * 0.5) return 'fresh';
        if (ageInMs < refreshInterval) return 'aging';
        return 'stale';
    }, [lastUpdated, refreshInterval]);

    // Helper function to check if data is stale
    const isDataStale = useCallback(() => {
        if (!lastUpdated) return true;
        return Date.now() - lastUpdated > refreshInterval;
    }, [lastUpdated, refreshInterval]);

    // Enhanced refresh function with retry logic
    const refreshData = useCallback(async (force = false, isRetry = false) => {
        // Clear any existing retry timeouts
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        // Skip if already fetching
        if (fetchInProgress) {
            console.log('Skipping refresh - fetch already in progress');
            return false;
        }

        // Get current time
        const now = Date.now();

        // Apply throttling (unless forced)
        if (!force && !isRetry && now - dashboardState.lastRefreshTime < GLOBAL_MIN_REFRESH_INTERVAL) {
            console.log(`Throttling active (${now - dashboardState.lastRefreshTime}ms < ${GLOBAL_MIN_REFRESH_INTERVAL}ms)`);
            return false;
        }

        // Update tracking state
        dashboardState.lastRefreshTime = now;
        localLastRefreshTime.current = now;
        setLastRefreshAttempt(now);
        setRefreshCount(prev => prev + 1);

        if (isRetry) {
            setRetryAttempt(prev => prev + 1);
        } else {
            setRetryAttempt(0);
        }

        try {
            // Fetch data from the store
            await fetchDashboardData();

            // Reset retry count on success
            dashboardState.retryCount = 0;

            // Mark initial fetch as done if this was the first one
            if (isInitialMount.current) {
                dashboardState.initialFetchDone = true;
                isInitialMount.current = false;
                setIsInitialLoad(false);
            }

            return true;
        } catch (err) {
            console.error('Error refreshing dashboard data:', err);

            // Implement retry logic
            if (!isRetry && dashboardState.retryCount < MAX_RETRY_ATTEMPTS) {
                dashboardState.retryCount++;
                console.log(`Scheduling retry attempt ${dashboardState.retryCount}/${MAX_RETRY_ATTEMPTS} in ${RETRY_DELAY}ms`);

                retryTimeoutRef.current = setTimeout(() => {
                    refreshData(true, true);
                }, RETRY_DELAY);
            } else if (isRetry) {
                console.log(`Retry attempt ${dashboardState.retryCount}/${MAX_RETRY_ATTEMPTS} failed`);
            }

            return false;
        }
    }, [fetchDashboardData, fetchInProgress]);

    // Initial data fetch
    useEffect(() => {
        const loadInitialData = async () => {
            if (isInitialMount.current) {
                console.log(`Initial dashboard data load starting (${componentId.current})`);
                await refreshData(true);
            }
        };

        loadInitialData();

        return () => {
            // Clear any timeouts
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [refreshData]);

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefresh) return;

        const checkAndRefresh = async () => {
            if (fetchInProgress) return;

            if (isDataStale()) {
                console.log('Data is stale, auto-refreshing...');
                await refreshData();
            }
        };

        // Initial check
        checkAndRefresh();

        // Set up polling interval
        const intervalId = setInterval(checkAndRefresh, Math.min(refreshInterval, 60000));

        return () => {
            clearInterval(intervalId);
        };
    }, [autoRefresh, refreshInterval, isDataStale, refreshData, fetchInProgress]);

    // Handle explicit refresh requests
    useEffect(() => {
        if (shouldRefresh && !fetchInProgress) {
            console.log('Refresh requested via store flag');
            refreshData().then(() => {
                // Reset the refresh flag
                setShouldRefresh(false);
            });
        }
    }, [shouldRefresh, refreshData, fetchInProgress, setShouldRefresh]);

    return {
        stats: formattedStats,
        rawStats: stats,
        salesData,
        categoryStats,
        recentActivity,
        inventoryAlerts,
        topSellingItems,
        isLoading,
        isInitialLoad,
        error,
        refresh: () => refreshData(true),
        hasData,
        lastUpdated,
        dataState,
        refreshCount,
        lastRefreshAttempt,
        retryAttempt,
        currencySymbol
    };
};