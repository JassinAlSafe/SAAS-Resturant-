"use client";

import { useState } from "react";
import { Dish } from "@/lib/types";

export function useRecipeModals() {
  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Dish | undefined>(
    undefined
  );

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Dish | null>(null);

  // Open modal for adding a new recipe
  const openAddModal = () => {
    setSelectedRecipe(undefined);
    setIsFormOpen(true);
  };

  // Open modal for editing a recipe
  const openEditModal = (recipe: Dish) => {
    setSelectedRecipe(recipe);
    setIsFormOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (recipe: Dish) => {
    setRecipeToDelete(recipe);
    setIsDeleteDialogOpen(true);
  };

  // Close recipe form modal
  const closeFormModal = () => {
    setIsFormOpen(false);
    setSelectedRecipe(undefined);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setRecipeToDelete(null);
  };

  return {
    isFormOpen,
    selectedRecipe,
    isDeleteDialogOpen,
    recipeToDelete,
    openAddModal,
    openEditModal,
    openDeleteDialog,
    closeFormModal,
    closeDeleteDialog,
  };
}
