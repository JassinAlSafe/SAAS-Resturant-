import { CategoryStat, DashboardStats } from "@/lib/types";

// Sales-related interfaces
/**
 * Activity item for the dashboard
 */
export interface ActivityItem {
    id: string;
    type: 'inventory' | 'sale' | 'other';
    title: string;
    description: string;
    date: string;
    formattedDate: string;
}

/**
 * Sale record from the database
 */
export interface SaleRecord {
    created_at: string;
    total_amount: number;
}

/**
 * Sale with date field from the database
 */
export interface SaleWithDate {
    date?: string;
    created_at?: string;
    total_amount: number;
}

/**
 * Sale item for the top selling items
 */
export interface SaleItem {
    dish_id: string;
    quantity: number;
    recipes: {
        name: string;
    } | null;
}

// Dashboard-specific interfaces
/**
 * Recent sale for the dashboard
 */
export interface RecentSale {
    id: string;
    date: string;
    amount: number;
    customer: string;
}

/**
 * Inventory alert for the dashboard
 */
export interface InventoryAlert {
    id: string;
    name: string;
    currentStock: number;
    reorderLevel: number;
    expiryDate: string | null;
    type: 'low_stock' | 'expiring';
}

export interface RecentActivity {
    action: string;
    item: string;
    timestamp: string;
    user: string;
}

// Main dashboard data interface
export interface DashboardData {
    stats: DashboardStats;
    salesData: { month: string; sales: number }[];
    categoryStats: CategoryStat[];
    recentActivity: RecentActivity[];
    inventoryAlerts: InventoryAlert[];
    topSellingItems: { name: string; quantity: number }[];
} 