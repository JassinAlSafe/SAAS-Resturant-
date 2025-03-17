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
    // Fetch inventory changes (most recent first)
    const { data: inventoryChanges, error: inventoryError } = await supabase
        .from('ingredients_log')
        .select('id, ingredient_id, action, quantity_change, created_at, ingredients (name)')
        .eq('business_profile_id', businessProfileId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (inventoryError) {
        console.error('Error fetching inventory changes:', inventoryError);
        return [];
    }

    // Fetch recent orders
    const { data: recentOrders, error: ordersError } = await supabase
        .from('sales')
        .select('id, created_at, total_amount, customer_name')
        .eq('business_profile_id', businessProfileId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (ordersError) {
        console.error('Error fetching recent orders:', ordersError);
        // Continue with inventory changes only
    }

    // Format inventory changes as activity items
    const inventoryActivity = (inventoryChanges || []).map((change): ActivityItem => {
        const ingredientName = change.ingredients?.name || 'Unknown ingredient';
        const action = change.action === 'add' ? 'added' :
            change.action === 'remove' ? 'removed' :
                change.action === 'update' ? 'updated' :
                    change.action;

        return {
            id: change.id,
            type: 'inventory',
            title: `${ingredientName} ${action}`,
            description: `${Math.abs(change.quantity_change || 0)} units ${action === 'added' ? 'to' : 'from'} inventory`,
            date: change.created_at,
            formattedDate: formatActivityDate(change.created_at),
        };
    });

    // Format orders as activity items
    const orderActivity = (recentOrders || []).map((order): ActivityItem => {
        return {
            id: order.id,
            type: 'sale',
            title: 'New sale recorded',
            description: `${order.customer_name || 'Anonymous'} - $${order.total_amount.toFixed(2)}`,
            date: order.created_at,
            formattedDate: formatActivityDate(order.created_at),
        };
    });

    // Combine and sort all activity items by date (most recent first)
    return [...inventoryActivity, ...orderActivity]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10); // Take the 10 most recent
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