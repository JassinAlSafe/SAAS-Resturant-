import { Dish, Ingredient } from "@/lib/types";

// Modal type definition for recipe modals
export type RecipeModalType = 'add' | 'edit' | 'delete' | 'bulkDelete' | 'viewIngredients' | null;

// Recipe filtering options
export interface RecipeFilterOptions {
    searchQuery?: string;
    categories?: string[];
    showArchived?: boolean;
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