"use client";

import { Dish, Ingredient } from "@/lib/types";
import RecipeForm from "../RecipeForm";
import DeleteRecipeDialog from "./DeleteRecipeDialog";

interface RecipeModalsProps {
  isFormOpen: boolean;
  selectedRecipe?: Dish;
  isDeleteDialogOpen: boolean;
  recipeToDelete: Dish | null;
  ingredients: Ingredient[];
  onCloseForm: () => void;
  onCloseDeleteDialog: () => void;
  onSaveRecipe: (
    recipe: Omit<Dish, "id" | "createdAt" | "updatedAt">
  ) => Promise<Dish | null>;
  onUpdateRecipe: (
    id: string,
    recipe: Omit<Dish, "id" | "createdAt" | "updatedAt">
  ) => Promise<Dish | null>;
  onDeleteRecipe: () => void;
}

export function RecipeModals({
  isFormOpen,
  selectedRecipe,
  isDeleteDialogOpen,
  recipeToDelete,
  ingredients,
  onCloseForm,
  onCloseDeleteDialog,
  onSaveRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
}: RecipeModalsProps) {
  return (
    <>
      {isFormOpen && (
        <RecipeForm
          initialRecipe={selectedRecipe}
          ingredients={ingredients}
          onSave={onSaveRecipe}
          onUpdate={onUpdateRecipe}
          onCancel={onCloseForm}
        />
      )}

      <DeleteRecipeDialog
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDeleteDialog}
        onConfirm={onDeleteRecipe}
        recipeName={recipeToDelete?.name || ""}
      />
    </>
  );
}
