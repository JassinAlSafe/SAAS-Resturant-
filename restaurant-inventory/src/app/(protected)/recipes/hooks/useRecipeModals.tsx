"use client";

import { useState } from "react";
import { Dish } from "@/lib/types";
import { RecipeModalType, RecipeModalsHookReturn } from "../types";

export function useRecipeModals(): RecipeModalsHookReturn {
  const [modalType, setModalType] = useState<RecipeModalType>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Dish | null>(null);
  const [recipesToDelete, setRecipesToDelete] = useState<Dish[]>([]);
  const [showArchiveOption, setShowArchiveOption] = useState(false);
  const [showBulkArchiveOption, setShowBulkArchiveOption] = useState(false);

  const openAddModal = () => {
    setModalType("add");
    setCurrentRecipe(null);
  };

  const openEditModal = (recipe: Dish) => {
    setModalType("edit");
    setCurrentRecipe(recipe);
  };

  const openDeleteModal = (recipe: Dish) => {
    setModalType("delete");
    setCurrentRecipe(recipe);
    setShowArchiveOption(false);
  };

  const openBulkDeleteModal = (recipes: Dish[]) => {
    setModalType("bulkDelete");
    setRecipesToDelete(recipes);
    setShowBulkArchiveOption(false);
  };

  const openViewIngredientsModal = (recipe: Dish) => {
    setModalType("viewIngredients");
    setCurrentRecipe(recipe);
  };

  const closeModal = () => {
    setModalType(null);
    setCurrentRecipe(null);
    setRecipesToDelete([]);
    setShowArchiveOption(false);
    setShowBulkArchiveOption(false);
  };

  const setArchiveOption = (show: boolean) => {
    setShowArchiveOption(show);
  };

  const setBulkArchiveOption = (show: boolean) => {
    setShowBulkArchiveOption(show);
  };

  return {
    modalType,
    currentRecipe,
    recipesToDelete,
    showArchiveOption,
    showBulkArchiveOption,
    openAddModal,
    openEditModal,
    openDeleteModal,
    openBulkDeleteModal,
    openViewIngredientsModal,
    closeModal,
    setArchiveOption,
    setBulkArchiveOption,
  };
}
