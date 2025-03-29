import { format } from "date-fns";
import { supabase } from "@/lib/supabase/browser-client";
import { getBusinessProfileId } from "./profile-service";
import { getDefaultMonthsData, logQueryDetails } from "./utils";
import { SaleRecord, SaleWithDate, SaleItem, RecentSale } from "./types";

// Cache for sales data
interface SalesCache {
    monthlySales: {
        data: { currentMonthSales: number; monthlySalesData: { month: string; sales: number }[] };
        timestamp: number;
        businessProfileId: string | null;
    } | null;
    salesGrowth: {
        data: number;
        timestamp: number;
        businessProfileId: string | null;
    } | null;
    recentSales: {
        data: RecentSale[];
        timestamp: number;
        businessProfileId: string | null;
    } | null;
    topSellingItems: {
        data: Array<{ name: string; quantity: number }>;
        timestamp: number;
        businessProfileId: string | null;
    } | null;
}

// Initialize cache
const cache: SalesCache = {
    monthlySales: null,
    salesGrowth: null,
    recentSales: null,
    topSellingItems: null
};

// Cache TTL in milliseconds (30 seconds)
const CACHE_TTL = 30000;

// Consistent timeout for requests
const REQUEST_TIMEOUT = 5000;

// Track the last fetch time for throttling
const lastFetchTimes: Record<string, number> = {};
const MIN_FETCH_INTERVAL = 3000; // 3 seconds minimum between fetches

// Fix the pendingRequests type definition
const pendingRequests: Record<string, Promise<unknown>> = {};

/**
 * Generic request deduplication wrapper
 */
async function deduplicate<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    // Check if we need to throttle the request
    const now = Date.now();
    const lastFetchTime = lastFetchTimes[key] || 0;
    if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
        console.log(`Request for ${key} throttled (${now - lastFetchTime}ms since last fetch)`);

        // If we have a cached result, return it instead of making a new request
        if (key.includes('monthlySales') && cache.monthlySales) {
            return cache.monthlySales.data as unknown as T;
        } else if (key.includes('salesGrowth') && cache.salesGrowth) {
            return cache.salesGrowth.data as unknown as T;
        } else if (key.includes('recentSales') && cache.recentSales) {
            return cache.recentSales.data as unknown as T;
        } else if (key.includes('topSellingItems') && cache.topSellingItems) {
            return cache.topSellingItems.data as unknown as T;
        }
    }

    // If there's already a request in progress, return that instead
    if (key in pendingRequests) {
        console.log(`Reusing pending request for ${key}`);
        return pendingRequests[key] as Promise<T>;
    }

    // Create a new promise and track it
    try {
        console.log(`Starting new request for ${key}`);
        lastFetchTimes[key] = now; // Update last fetch time
        pendingRequests[key] = fetchFn();
        const result = await pendingRequests[key];
        return result as T;
    } finally {
        // Always clear the pending request when done
        delete pendingRequests[key];
    }
}

/**
 * Fetch monthly sales data for the last 6 months
 * Now with caching and request deduplication
 */
export async function fetchMonthlySales(_options?: { signal?: AbortSignal }): Promise<{
    currentMonthSales: number;
    monthlySalesData: { month: string; sales: number }[]
}> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            console.log('No business profile ID found for dashboard sales query');
            return {
                currentMonthSales: 0,
                monthlySalesData: getDefaultMonthsData()
            };
        }

        // Check cache first
        if (
            cache.monthlySales &&
            cache.monthlySales.businessProfileId === businessProfileId &&
            Date.now() - cache.monthlySales.timestamp < CACHE_TTL
        ) {
            console.log('Using cached monthly sales data');
            return cache.monthlySales.data;
        }

        // Use request deduplication
        return await deduplicate(`monthlySales-${businessProfileId}`, async () => {
            // Create a timeout promise
            const timeoutPromise = new Promise<{
                currentMonthSales: number;
                monthlySalesData: { month: string; sales: number }[];
            }>((_, reject) => {
                setTimeout(() => reject(new Error('Monthly sales fetch timed out')), REQUEST_TIMEOUT);
            });

            // Actual fetch promise
            const fetchPromise = async () => {
                // Get data for the past 6 months
                const today = new Date();
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(today.getMonth() - 5);
                sixMonthsAgo.setDate(1); // Start from the 1st day of the month

                const startDate = format(sixMonthsAgo, 'yyyy-MM-dd');
                const endDate = format(today, 'yyyy-MM-dd');

                // Log query details for debugging
                logQueryDetails(businessProfileId, startDate, endDate);

                try {
                    const { data, error } = await supabase
                        .from('sales')
                        .select('created_at, total_amount, date')
                        .eq('business_profile_id', businessProfileId)
                        .gte('created_at', startDate)
                        .lte('created_at', endDate)
                        .order('created_at', { ascending: true });

                    if (error) {
                        console.error('Error fetching monthly sales:', error);
                        throw error;
                    }

                    // If no data using created_at filter, try using the date field instead
                    if (!data || data.length === 0) {
                        const alternateResult = await fetchMonthlySalesByDateField(businessProfileId, startDate, endDate, today);

                        // Cache the result
                        cache.monthlySales = {
                            data: alternateResult,
                            timestamp: Date.now(),
                            businessProfileId
                        };

                        return alternateResult;
                    }

                    const result = processSalesData(data, today);

                    // Cache the result
                    cache.monthlySales = {
                        data: result,
                        timestamp: Date.now(),
                        businessProfileId
                    };

                    return result;
                } catch (error) {
                    console.error('Error in main monthly sales fetch:', error);

                    // Try alternate method if main method fails
                    try {
                        const alternateResult = await fetchMonthlySalesByDateField(businessProfileId, startDate, endDate, today);

                        // Cache the result
                        cache.monthlySales = {
                            data: alternateResult,
                            timestamp: Date.now(),
                            businessProfileId
                        };

                        return alternateResult;
                    } catch (innerError) {
                        console.error('Both methods for fetching monthly sales failed:', innerError);
                        throw innerError;
                    }
                }
            };

            // Race between fetch and timeout
            return await Promise.race([fetchPromise(), timeoutPromise]);
        });
    } catch (error) {
        console.error('Error fetching monthly sales:', error);

        // Return cached data if available, even if expired
        if (cache.monthlySales) {
            console.log('Returning cached monthly sales data after error');
            return cache.monthlySales.data;
        }

        return {
            currentMonthSales: 0,
            monthlySalesData: getDefaultMonthsData()
        };
    }
}

/**
 * Helper function to fetch sales data using the date field
 */
async function fetchMonthlySalesByDateField(
    businessProfileId: string,
    startDate: string,
    endDate: string,
    today: Date
): Promise<{ currentMonthSales: number; monthlySalesData: { month: string; sales: number }[] }> {
    console.log('No data found using created_at filter, trying date field instead...');

    const { data, error } = await supabase
        .from('sales')
        .select('created_at, total_amount, date')
        .eq('business_profile_id', businessProfileId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching sales using date field:', error);
        return {
            currentMonthSales: 0,
            monthlySalesData: getDefaultMonthsData()
        };
    }

    if (data && data.length > 0) {
        console.log(`Found ${data.length} sales records using date field`);
        console.log('First few records:', data.slice(0, 3));
        return processSalesData(data as SaleWithDate[], today);
    } else {
        console.log('No data found using date field either');
        return {
            currentMonthSales: 0,
            monthlySalesData: getDefaultMonthsData()
        };
    }
}

/**
 * Helper function to process sales data
 */
function processSalesData(
    data: (SaleRecord | SaleWithDate)[],
    today: Date
): { currentMonthSales: number; monthlySalesData: { month: string; sales: number }[] } {
    const salesByMonth = new Map<string, number>();

    // First, initialize with zero values for the past 6 months
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(today.getMonth() - 5 + i);
        const monthKey = format(date, 'MMM');
        salesByMonth.set(monthKey, 0);
    }

    // Then add actual sales data
    data.forEach((sale) => {
        const saleDate = 'date' in sale && sale.date
            ? new Date(sale.date || new Date())
            : new Date(sale.created_at || new Date());

        const monthKey = format(saleDate, 'MMM');
        salesByMonth.set(monthKey, (salesByMonth.get(monthKey) || 0) + sale.total_amount);
    });

    // Convert to array of { month, sales }
    const monthlySalesData = Array.from(salesByMonth.entries()).map(([month, total]) => ({
        month,
        sales: total,
    }));

    // Get current month sales (current calendar month)
    const currentMonthKey = format(today, 'MMM');
    const currentMonthSales = salesByMonth.get(currentMonthKey) || 0;

    return { currentMonthSales, monthlySalesData };
}

/**
 * Calculate sales growth percentage between last month and the month before
 * Now with caching and request deduplication
 */
export async function fetchSalesGrowth(_options?: { signal?: AbortSignal }): Promise<number> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            console.log('No business profile ID found for sales growth');
            return 0;
        }

        // Check cache first
        if (
            cache.salesGrowth &&
            cache.salesGrowth.businessProfileId === businessProfileId &&
            Date.now() - cache.salesGrowth.timestamp < CACHE_TTL
        ) {
            console.log('Using cached sales growth data');
            return cache.salesGrowth.data;
        }

        // Use request deduplication
        return await deduplicate(`salesGrowth-${businessProfileId}`, async () => {
            // Create a timeout promise
            const timeoutPromise = new Promise<number>((_, reject) => {
                setTimeout(() => reject(new Error('Sales growth fetch timed out')), REQUEST_TIMEOUT);
            });

            // Actual data fetching promise
            const fetchPromise = async () => {
                const now = new Date();
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

                // Fetch sales for last month
                const { data: lastMonthData, error: lastMonthError } = await supabase
                    .from('sales')
                    .select('total_amount')
                    .eq('business_profile_id', businessProfileId)
                    .gte('created_at', lastMonth.toISOString())
                    .lt('created_at', now.toISOString());

                // Fetch sales for two months ago
                const { data: twoMonthsData, error: twoMonthsError } = await supabase
                    .from('sales')
                    .select('total_amount')
                    .eq('business_profile_id', businessProfileId)
                    .gte('created_at', twoMonthsAgo.toISOString())
                    .lt('created_at', lastMonth.toISOString());

                if (lastMonthError || twoMonthsError) {
                    console.error('Error fetching sales data:', { lastMonthError, twoMonthsError });
                    return 0;
                }

                // Calculate total sales for each period
                const lastMonthTotal = (lastMonthData || []).reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
                const twoMonthsTotal = (twoMonthsData || []).reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

                // Calculate growth percentage
                let growthPercentage = 0;
                if (twoMonthsTotal === 0) {
                    growthPercentage = lastMonthTotal > 0 ? 100 : 0;
                } else {
                    growthPercentage = ((lastMonthTotal - twoMonthsTotal) / twoMonthsTotal) * 100;
                }

                // Cache the result
                cache.salesGrowth = {
                    data: growthPercentage,
                    timestamp: Date.now(),
                    businessProfileId
                };

                return growthPercentage;
            };

            // Race between fetch and timeout
            return await Promise.race([fetchPromise(), timeoutPromise]);
        });
    } catch (error) {
        console.error('Error in fetchSalesGrowth:', error);

        // Return cached growth if available, even if expired
        if (cache.salesGrowth) {
            console.log('Returning cached sales growth data after error');
            return cache.salesGrowth.data;
        }

        return 0;
    }
}

/**
 * Fetch recent sales for the dashboard
 * Modified to work with the actual database schema
 */
export async function fetchRecentSales(_options?: { signal?: AbortSignal }): Promise<RecentSale[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            return [];
        }

        // Check cache first
        if (
            cache.recentSales &&
            cache.recentSales.businessProfileId === businessProfileId &&
            Date.now() - cache.recentSales.timestamp < CACHE_TTL
        ) {
            console.log('Using cached recent sales data');
            return cache.recentSales.data;
        }

        // Use request deduplication
        return await deduplicate(`recentSales-${businessProfileId}`, async () => {
            // Create a timeout promise
            const timeoutPromise = new Promise<RecentSale[]>((_, reject) => {
                setTimeout(() => reject(new Error('Recent sales fetch timed out')), REQUEST_TIMEOUT);
            });

            // Actual fetch promise
            const fetchPromise = async () => {
                try {
                    // Try first without customer_name since it doesn't exist
                    const { data, error } = await supabase
                        .from('sales')
                        .select('id, created_at, total_amount')  // Removed customer_name
                        .eq('business_profile_id', businessProfileId)
                        .order('created_at', { ascending: false })
                        .limit(5);

                    if (error) {
                        console.error('Error fetching recent sales:', error);
                        throw error;
                    }

                    // Convert to RecentSale format with a generic customer name
                    const recentSales = (data || []).map(sale => ({
                        id: sale.id,
                        date: sale.created_at,
                        amount: sale.total_amount,
                        customer: `Customer ${sale.id.substring(0, 4)}`,  // Generate a placeholder name
                    }));

                    // Cache the result
                    cache.recentSales = {
                        data: recentSales,
                        timestamp: Date.now(),
                        businessProfileId
                    };

                    return recentSales;
                } catch (firstAttemptError) {
                    console.error('First attempt failed, trying alternate query:', firstAttemptError);

                    // Try with just the bare minimum fields
                    try {
                        const { data, error } = await supabase
                            .from('sales')
                            .select('id, created_at, total_amount')
                            .eq('business_profile_id', businessProfileId)
                            .order('created_at', { ascending: false })
                            .limit(5);

                        if (error) {
                            console.error('Error on second sales attempt:', error);
                            return []; // Return empty array if both attempts fail
                        }

                        // Convert to RecentSale format with a generic customer name
                        const recentSales = (data || []).map(sale => ({
                            id: sale.id,
                            date: sale.created_at,
                            amount: sale.total_amount || 0,
                            customer: 'Customer',  // Generic placeholder
                        }));

                        // Cache the result
                        cache.recentSales = {
                            data: recentSales,
                            timestamp: Date.now(),
                            businessProfileId
                        };

                        return recentSales;
                    } catch (secondAttemptError) {
                        console.error('Both sales query attempts failed:', secondAttemptError);
                        return [];
                    }
                }
            };

            // Race between fetch and timeout
            return await Promise.race([fetchPromise(), timeoutPromise]);
        });
    } catch (error) {
        console.error('Error in fetchRecentSales:', error);

        // Return cached sales if available, even if expired
        if (cache.recentSales) {
            console.log('Returning cached recent sales data after error');
            return cache.recentSales.data;
        }

        // Return empty array as fallback
        return [];
    }
}

/**
 * Fetch the top selling items
 * Now with caching and request deduplication
 */
export async function fetchTopSellingItems(_options?: { signal?: AbortSignal }): Promise<Array<{ name: string; quantity: number }>> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            console.log('No business profile ID found for top selling items');
            return [];
        }

        // Check cache first
        if (
            cache.topSellingItems &&
            cache.topSellingItems.businessProfileId === businessProfileId &&
            Date.now() - cache.topSellingItems.timestamp < CACHE_TTL
        ) {
            console.log('Using cached top selling items data');
            return cache.topSellingItems.data;
        }

        // Use request deduplication
        return await deduplicate(`topSellingItems-${businessProfileId}`, async () => {
            // Create a timeout promise
            const timeoutPromise = new Promise<Array<{ name: string; quantity: number }>>((_, reject) => {
                setTimeout(() => reject(new Error('Top selling items fetch timed out')), REQUEST_TIMEOUT);
            });

            // Actual data fetching promise
            const fetchPromise = async () => {
                const { data, error } = await supabase
                    .from('sales')
                    .select(`
                        dish_id,
                        quantity,
                        recipes (
                            name
                        )
                    `)
                    .eq('business_profile_id', businessProfileId)
                    .order('created_at', { ascending: false })
                    .limit(100); // Limit to recent sales

                if (error) {
                    console.error('Error fetching top selling items:', error);
                    return [];
                }

                if (!data || data.length === 0) {
                    return [];
                }

                // Type assertion with unknown first to satisfy TypeScript
                const typedData = (data as unknown) as SaleItem[];

                // Aggregate quantities by dish
                const salesByDish = typedData.reduce((acc, sale) => {
                    const dishName = sale.recipes?.name || 'Unknown Dish';
                    if (!acc[dishName]) {
                        acc[dishName] = 0;
                    }
                    acc[dishName] += sale.quantity || 0;
                    return acc;
                }, {} as Record<string, number>);

                // Convert to array and sort by quantity
                const topItems = Object.entries(salesByDish)
                    .map(([name, quantity]) => ({ name, quantity }))
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 5); // Return top 5

                // Cache the result
                cache.topSellingItems = {
                    data: topItems,
                    timestamp: Date.now(),
                    businessProfileId
                };

                return topItems;
            };

            // Race between fetch and timeout
            return await Promise.race([fetchPromise(), timeoutPromise]);
        });
    } catch (error) {
        console.error('Error in fetchTopSellingItems:', error);

        // Return cached items if available, even if expired
        if (cache.topSellingItems) {
            console.log('Returning cached top selling items data after error');
            return cache.topSellingItems.data;
        }

        return [];
    }
}