import { useEffect, useRef, useCallback, useState } from 'react';
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
    
    // Track local state for better debugging
    const [lastRefreshAttempt, setLastRefreshAttempt] = useState<number | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Check if we have meaningful data
    const hasData = useCallback(() => {
        // Check if we have any sales data
        const hasSalesData = salesData && salesData.length > 0;
        
        // Check if we have any stats data
        const hasStatsData = stats && (
            stats.totalInventoryValue > 0 || 
            stats.lowStockItems > 0 || 
            stats.monthlySales > 0 ||
            stats.salesGrowth !== 0
        );
        
        // Check if we have any category stats
        const hasCategoryData = categoryStats && categoryStats.length > 0;
        
        // Check if we have any activity data
        const hasActivityData = recentActivity && recentActivity.length > 0;
        
        // Check if we have any inventory alerts
        const hasAlertData = inventoryAlerts && inventoryAlerts.length > 0;
        
        // Check if we have any top selling items
        const hasTopSellingData = topSellingItems && topSellingItems.length > 0;
        
        // Return true if we have any meaningful data
        return hasSalesData || hasStatsData || hasCategoryData || 
               hasActivityData || hasAlertData || hasTopSellingData;
    }, [salesData, stats, categoryStats, recentActivity, inventoryAlerts, topSellingItems]);

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

    // Function to refresh data
    const refreshData = useCallback(async (force = false) => {
        // Skip if already fetching
        if (fetchInProgress) {
            console.log('Skipping refresh - fetch already in progress');
            return;
        }
        
        // Get current time
        const now = Date.now();
        
        // Check global throttling (unless forced)
        if (!force && now - globalLastRefreshTime < GLOBAL_MIN_REFRESH_INTERVAL) {
            console.log(`Global throttling active (${now - globalLastRefreshTime}ms since last refresh)`);
            return;
        }
        
        // Update global refresh time
        globalLastRefreshTime = now;
        setLastRefreshAttempt(now);
        setRefreshCount(prev => prev + 1);
        
        try {
            // Trigger fetch in the store
            await fetchDashboardData();
            
            // Update initial fetch flag if this is the first successful fetch
            if (isInitialMount.current) {
                globalInitialFetchDone = true;
                isInitialMount.current = false;
                setIsInitialLoad(false);
            }
            
            // Store the local refresh time
            localLastRefreshTime.current = now;
        } catch (error) {
            console.error('Error refreshing dashboard data:', error);
        }
    }, [fetchDashboardData, fetchInProgress]);

    // Initial fetch effect - runs only once across all instances
    useEffect(() => {
        const loadInitialData = async () => {
            if (isInitialMount.current) {
                console.log('Initial dashboard data load starting');
                await refreshData(true); // Force refresh on initial load
            }
        };
        
        loadInitialData();
    }, [refreshData]);

    // Auto-refresh effect
    useEffect(() => {
        // Only set up auto-refresh if enabled
        if (!autoRefresh) return;
        
        // Function to check and refresh data if needed
        const checkAndRefresh = async () => {
            // Skip if already fetching
            if (fetchInProgress) return;
            
            // Check if data is stale
            if (isDataStale()) {
                console.log('Data is stale, refreshing...');
                await refreshData();
            }
        };
        
        // Initial check
        checkAndRefresh();
        
        // Set up interval for future checks
        const intervalId = setInterval(checkAndRefresh, Math.min(refreshInterval, 60000));
        
        // Clean up on unmount
        return () => {
            clearInterval(intervalId);
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
                refreshTimeoutRef.current = null;
            }
        };
    }, [autoRefresh, refreshInterval, isDataStale, refreshData, fetchInProgress]);

    // Effect to respond to shouldRefresh flag changes
    useEffect(() => {
        if (shouldRefresh && !fetchInProgress) {
            console.log('shouldRefresh flag detected, triggering refresh');
            refreshData();
        }
    }, [shouldRefresh, refreshData, fetchInProgress]);

    // Return everything needed by components
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
        refresh: refreshData,
        hasData: hasData(),
        lastUpdated,
        refreshCount,
        lastRefreshAttempt,
        currencySymbol
    };
};