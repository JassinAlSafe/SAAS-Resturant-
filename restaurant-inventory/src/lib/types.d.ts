// Type declarations for the Restaurant Inventory Management System

export interface DishIngredient {
    ingredientId: string;
    quantity: number;
}

export interface Dish {
    id: string;
    name: string;
    description?: string;
    price: number;
    foodCost?: number;
    category?: string;
    allergies?: string[];
    popularity?: number;
    imageUrl?: string;
    ingredients: DishIngredient[];
    recipeId?: string;
    createdAt: string;
    updatedAt: string;
    isArchived?: boolean;
}

export interface Sale {
    id: string;
    dishId: string;
    dishName: string;
    quantity: number;
    totalAmount: number;
    date: string;
    createdAt: string;
    userId?: string;
} 