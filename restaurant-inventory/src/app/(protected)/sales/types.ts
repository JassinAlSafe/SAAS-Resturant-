// Common types for the sales module

import { Dish } from "@/lib/types";

export type ShiftType = "Breakfast" | "Lunch" | "Dinner" | "All";

export enum TabType {
    DAILY_SALES = "daily",
    SALES_HISTORY = "history"
}

export interface SaleEntry {
    id: string;
    date: string;
    shift?: ShiftType;
    dishId: string;
    dishName: string;
    quantity: number;
    totalAmount: number;
    createdAt: string;
    updatedAt?: string;
    notes?: string;
    userId?: string;
}

export interface Recipe {
    id: string;
    name: string;
    price: number;
    category?: string;
    description?: string;
    image?: string;
    ingredients: {
        ingredientId: string;
        quantity: number;
        name: string;
    }[];
}

export interface InventoryImpactItem {
    ingredientId: string;
    name: string;
    quantityUsed: number;
    unit: string;
}

export interface SalesEntryFormProps {
    dishes: (Dish & { recipeId?: string })[];
    recipes: Recipe[];
    salesEntries: { [key: string]: number };
    dateString: string;
    onDateChange: (date: string) => void;
    onQuantityChange: (dishId: string, quantity: number) => void;
    onSubmit: () => Promise<boolean>;
    onAddDishFromRecipe: (recipeId: string) => void;
    total: number;
    isSubmitting: boolean;
    onToggleInventoryImpact: () => void;
    showInventoryImpact: boolean;
    calculateInventoryImpact: (dishId: string, quantity: number) => InventoryImpactItem[];
    onClearAll?: () => void;
    onLoadPreviousDay?: () => void;
    hasPreviousDayTemplate?: boolean;
    activeTab?: TabType;
    onTabChange?: (tab: TabType) => void;
}

export interface SalesFilterProps {
    startDate?: Date;
    endDate?: Date;
    shift?: ShiftType;
    searchTerm?: string;
    onFilterChange: (filters: Partial<SalesFilterProps>) => void;
}

export interface SalesSummary {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topSellingDishes: {
        dishId: string;
        dishName: string;
        quantity: number;
        revenue: number;
    }[];
}

export function loadDishesFromRecipes(recipes: Recipe[]): Dish[] {
    return recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        price: recipe.price,
        category: recipe.category,
        recipeId: recipe.id,
        ingredients: recipe.ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
} 