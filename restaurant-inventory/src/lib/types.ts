// Inventory Item interface
export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    reorderLevel: number;
    cost: number;
    expiryDate?: string; // Optional expiry date in ISO format
    supplierId?: string; // Optional reference to supplier
    createdAt: string;
    updatedAt: string;
}

export interface IngredientRow {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    reorder_level: number;
    cost: number;
    expiry_date?: string;
    supplier_id?: string;
    created_at: string;
    updated_at: string;
}

// Alias for backward compatibility
export type Ingredient = InventoryItem;

// Supplier interface
export interface Supplier {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

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