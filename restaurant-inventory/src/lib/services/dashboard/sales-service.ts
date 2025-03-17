import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { getBusinessProfileId } from "./profile-service";
import { getDefaultMonthsData, logQueryDetails } from "./utils";
import { SaleRecord, SaleWithDate, SaleItem, RecentSale } from "./types";

/**
 * Fetch monthly sales data for the last 6 months
 */
export async function fetchMonthlySales(): Promise<{
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

        // Get data for the past 6 months
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start from the 1st day of the month

        const startDate = format(sixMonthsAgo, 'yyyy-MM-dd');
        const endDate = format(today, 'yyyy-MM-dd');

        // Log query details for debugging
        logQueryDetails(businessProfileId, startDate, endDate);

        const { data, error } = await supabase
            .from('sales')
            .select('created_at, total_amount, date')
            .eq('business_profile_id', businessProfileId)
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching monthly sales:', error);
            return {
                currentMonthSales: 0,
                monthlySalesData: getDefaultMonthsData()
            };
        }

        // If no data using created_at filter, try using the date field instead
        if (!data || data.length === 0) {
            return await fetchMonthlySalesByDateField(businessProfileId, startDate, endDate, today);
        }

        return processSalesData(data, today);
    } catch (error) {
        console.error('Error fetching monthly sales:', error);
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
            ? new Date(sale.date)
            : new Date(sale.created_at);

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
 */
export async function fetchSalesGrowth(): Promise<number> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            console.log('No business profile ID found for sales growth');
            return 0;
        }

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout while fetching sales growth'));
            }, 3000); // 3 second timeout
        });

        // Actual data fetching promise
        const fetchPromise = (async () => {
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
            if (twoMonthsTotal === 0) return lastMonthTotal > 0 ? 100 : 0;
            return ((lastMonthTotal - twoMonthsTotal) / twoMonthsTotal) * 100;
        })();

        // Race between fetch and timeout
        return await Promise.race([fetchPromise, timeoutPromise]) as number;
    } catch (error) {
        console.error('Error in fetchSalesGrowth:', error);
        return 0;
    }
}

/**
 * Fetch recent sales for the dashboard
 */
export async function fetchRecentSales(): Promise<RecentSale[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            return [];
        }

        const { data, error } = await supabase
            .from('sales')
            .select('id, created_at, total_amount, customer_name')
            .eq('business_profile_id', businessProfileId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching recent sales:', error);
            throw error;
        }

        return (data || []).map(sale => ({
            id: sale.id,
            date: sale.created_at,
            amount: sale.total_amount,
            customer: sale.customer_name || 'Anonymous',
        }));
    } catch (error) {
        console.error('Error in fetchRecentSales:', error);
        return [];
    }
}

/**
 * Fetch the top selling items
 */
export async function fetchTopSellingItems(): Promise<Array<{ name: string; quantity: number }>> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            console.log('No business profile ID found for top selling items');
            return [];
        }

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout while fetching top selling items'));
            }, 3000); // 3 second timeout
        });

        // Actual data fetching promise
        const fetchPromise = (async () => {
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
            return Object.entries(salesByDish)
                .map(([name, quantity]) => ({ name, quantity }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5); // Return top 5
        })();

        // Race between fetch and timeout
        return await Promise.race([fetchPromise, timeoutPromise]) as Array<{ name: string; quantity: number }>;
    } catch (error) {
        console.error('Error in fetchTopSellingItems:', error);
        return [];
    }
} 