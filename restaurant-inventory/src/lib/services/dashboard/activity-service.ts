import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { getBusinessProfileId } from "./profile-service";
import { ActivityItem } from "./types";
import { createSafePromise } from "./utils";

/**
 * Fetch recent activities for the dashboard
 */
export async function fetchRecentActivity(): Promise<ActivityItem[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            console.log('No business profile found for recent activity');
            return [];
        }

        const safePromise = createSafePromise(fetchActivityData(businessProfileId), 3000);
        return await safePromise;
    } catch (error) {
        console.error('Error in fetchRecentActivity:', error);
        return [];
    }
}

/**
 * Helper function to fetch activity data with proper error handling
 */
async function fetchActivityData(businessProfileId: string): Promise<ActivityItem[]> {
    try {
        // Since ingredients_log table doesn't exist, we'll fetch recent ingredient updates based on updated_at
        const { data: recentIngredients, error: ingredientsError } = await supabase
            .from('ingredients')
            .select('id, name, quantity, unit, updated_at')
            .eq('business_profile_id', businessProfileId)
            .order('updated_at', { ascending: false })
            .limit(10);

        if (ingredientsError) {
            console.error('Error fetching recent ingredients:', ingredientsError);
            // Continue with empty ingredients list
        }

        // Fetch recent orders
        const { data: recentOrders, error: ordersError } = await supabase
            .from('sales')
            .select('id, created_at, total_amount')
            .eq('business_profile_id', businessProfileId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (ordersError) {
            console.error('Error fetching recent orders:', ordersError);
            // Continue with empty orders list
        }

        // Format ingredients as activity items
        const inventoryActivity = (recentIngredients || []).map((ingredient): ActivityItem => {
            return {
                id: ingredient.id,
                type: 'inventory',
                title: `Inventory updated`,
                description: `${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}`,
                date: ingredient.updated_at,
                formattedDate: formatActivityDate(ingredient.updated_at),
            };
        });

        // Format orders as activity items
        const orderActivity = (recentOrders || []).map((order): ActivityItem => {
            return {
                id: order.id,
                type: 'sale',
                title: 'New sale recorded',
                description: `Sale #${order.id.substring(0, 8)} - $${order.total_amount.toFixed(2)}`,
                date: order.created_at,
                formattedDate: formatActivityDate(order.created_at),
            };
        });

        // Combine and sort all activity items by date (most recent first)
        return [...inventoryActivity, ...orderActivity]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10); // Take the 10 most recent
    } catch (error) {
        console.error('Error fetching activity data:', error);
        return [];
    }
}

/**
 * Format activity date for display
 */
function formatActivityDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();

        // If it's today, show the time
        if (date.toDateString() === now.toDateString()) {
            return `Today at ${format(date, 'h:mm a')}`;
        }

        // If it's yesterday, show "Yesterday"
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${format(date, 'h:mm a')}`;
        }

        // Otherwise show the date
        return format(date, 'MMM d, yyyy');
    } catch (e) {
        console.error('Error formatting date:', e);
        return dateString || 'Unknown date';
    }
}