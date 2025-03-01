// Inventory Item interface
export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    reorderLevel: number;
    cost: number;
    createdAt: string;
    updatedAt: string;
}

// Alias for backward compatibility
export type Ingredient = InventoryItem;

// Dish interface
export interface Dish {
    id: string;
    name: string;
    price: number;
    ingredients: DishIngredient[];
    createdAt: string;
    updatedAt: string;
}

// DishIngredient interface for the relationship between dishes and ingredients
export interface DishIngredient {
    ingredientId: string;
    quantity: number;
}

// Sales interface
export interface Sale {
    id: string;
    dishId: string;
    dishName: string;
    quantity: number;
    totalAmount: number;
    date: string;
    createdAt: string;
}

// User interface
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'staff';
}

// Dashboard stats interface
export interface DashboardStats {
    totalInventoryValue: number;
    lowStockItems: number;
    monthlySales: number;
    salesGrowth: number;
}

// Stock alert interface
export interface StockAlert {
    id: number;
    name: string;
    currentStock: number;
    unit: string;
    minStock: number;
    category: string;
} 