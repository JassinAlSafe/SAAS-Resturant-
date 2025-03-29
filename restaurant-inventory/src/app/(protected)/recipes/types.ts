import { Dish, Ingredient } from "@/lib/types";

// Modal type definition for recipe modals
export type RecipeModalType = 'add' | 'edit' | 'delete' | 'archive' | 'bulkDelete' | 'viewIngredients' | 'view' | null;

// Recipe filtering options
export interface RecipeFilterOptions {
    searchQuery?: string;
    categories?: string[];
    showArchived?: boolean;
}

// Recipe form data interface for adding/editing recipes
export interface RecipeFormData {
    name: string;
    price: number;
    category?: string;
    description?: string;
    imageUrl?: string;
    foodCost?: number;
    ingredients?: Array<{
        ingredientId: string;
        quantity: number;
        unit?: string;
    }>;
    allergies?: string[];
    preparationTime?: number; // in minutes
    servingSize?: number;
    instructions?: string;
    nutritionInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    // Internal tracking of ingredient names (not sent to server)
    _ingredientNames?: Record<string, string>;
}

// Filter criteria for recipe filtering
export interface FilterCriteria {
    categories: string[];
    allergens: string[];
    minPrice?: number;
    maxPrice?: number;
    minFoodCost?: number;
    maxFoodCost?: number;
}

// Recipe filter dialog interface
export interface RecipeFilterDialog {
    isOpen: boolean;
    onClose: () => void;
    recipes: Dish[];
    FilterCriteria: FilterCriteria;
    onFilter: (criteria: FilterCriteria) => void;
}

// Recipe modal state interface
export interface RecipeModalState {
    modalType: RecipeModalType;
    currentRecipe: Dish | null;
    recipesToDelete: Dish[];
    showArchiveOption: boolean;
    showBulkArchiveOption: boolean;
}

// Recipe modal actions interface
export interface RecipeModalActions {
    openAddModal: () => void;
    openEditModal: (recipe: Dish) => void;
    openDeleteModal: (recipe: Dish) => void;
    openBulkDeleteModal: (recipes: Dish[]) => void;
    openViewIngredientsModal: (recipe: Dish) => void;
    closeModal: () => void;
    setArchiveOption: (show: boolean) => void;
    setBulkArchiveOption: (show: boolean) => void;
}

// Combined recipe modal hook return type
export type RecipeModalsHookReturn = RecipeModalState & RecipeModalActions;

// Recipe handler functions
export interface RecipeHandlers {
    onAddRecipe: (recipe: Dish) => void;
    onEditRecipe: (recipe: Dish) => void;
    onDeleteRecipe: (id: string) => void;
    onArchiveRecipe: (id: string) => void;
    onBulkDeleteRecipes: () => void;
    onBulkArchiveRecipes: () => void;
}

// Recipe modals component props
export interface RecipeModalsProps extends RecipeHandlers {
    ingredients: Ingredient[];
    isProcessing: boolean;
} 