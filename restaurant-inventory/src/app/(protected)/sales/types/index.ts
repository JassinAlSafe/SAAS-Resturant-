export interface Dish {
    id: string;
    name: string;
    price: number;
    category?: string;
}

export interface Recipe {
    id: string;
    name: string;
    price: number;
    category?: string;
    description?: string;
    image?: string;
    ingredients: Array<{
        ingredientId: string;
        quantity: number;
        name: string;
    }>;
}

export interface InventoryImpact {
    name: string;
    quantityUsed: number;
    unit: string;
}

export interface SalesEntry {
    [dishId: string]: number;
}

export interface SalesEntryFormProps {
    dishes: Dish[];
    recipes: Recipe[];
    total: number;
    salesEntries: SalesEntry;
    dateString?: string;
    onDateChange: (date: string) => void;
    onQuantityChange: (dishId: string, quantity: number) => void;
    onSubmit: () => Promise<void>;
    isSubmitting: boolean;
    onToggleInventoryImpact: () => void;
    showInventoryImpact: boolean;
    calculateInventoryImpact: (dishId: string, quantity: number) => InventoryImpact[];
    onClearAll: () => void;
    onLoadPreviousDay: () => void;
    hasPreviousDayTemplate: boolean;
    onAddDishFromRecipe: (recipeId: string) => void;
}

// Constants for the sales entry form
export const SALES_FORM_CONSTANTS = {
    MINIMUM_QUANTITY: 0,
    INPUT_HEIGHT: 'h-9',
    DATE_FORMAT: 'MMM d, yyyy',
    GRID_COLS: 'grid-cols-12',
    COL_SPANS: {
        DISH: 'col-span-6',
        PRICE: 'col-span-2',
        QUANTITY: 'col-span-2',
        TOTAL: 'col-span-2'
    }
} as const; 