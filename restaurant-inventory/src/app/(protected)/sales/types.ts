// Common types for the sales module

import { Dish } from "@/lib/types";

export type ShiftType = "Breakfast" | "Lunch" | "Dinner" | "All";

export enum TabType {
    DAILY_SALES = "daily",
    SALES_HISTORY = "history"
}

export interface SaleEntry {
    id: string;
    dish_id: string;
    quantity: number;
    total_amount: number;
    date: string;
    created_at: string;
    updated_at?: string;
    user_id: string;
    business_profile_id: string;
}

export interface Recipe {
    id: string;
    name: string;
    price?: number;
    category?: string;
    ingredients: Array<{
        ingredientId: string;
        quantity: number;
    }>;
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
    onViewHistory?: () => void;
}

export interface SalesFilter {
    startDate?: Date;
    endDate?: Date;
    shift?: 'All' | 'Breakfast' | 'Lunch' | 'Dinner';
    searchTerm?: string;
}

export interface SalesSummary {
    totalSales: number;
    totalItems: number;
    averageOrderValue: number;
    topSellingDishes: Array<{
        dishId: string;
        name: string;
        quantity: number;
        revenue: number;
    }>;
}

export function loadDishesFromRecipes(recipes: Recipe[]): Dish[] {
    return recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        price: recipe.price || 0,
        category: recipe.category || 'Unknown',
        recipeId: recipe.id,
        ingredients: recipe.ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
} 