export interface SaleItem {
    date: string;
    dish_name: string;
    quantity: number;
    price: number;
    total: number;
    category: string;
}

export interface SaleData {
    id: string;
    date: string;
    items: SaleItem[];
    total: number;
}

export interface CategoryTotal {
    sales: number;
    items: number;
}

export interface DailyTotal {
    name: string;
    sales: number;
    items: number;
}

export interface SummaryData {
    totalSales: number;
    totalOrders: number;
    categoryTotals: Record<string, CategoryTotal>;
    dailyTotals: DailyTotal[];
}