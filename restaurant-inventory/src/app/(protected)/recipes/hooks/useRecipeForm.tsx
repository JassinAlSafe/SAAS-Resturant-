"use client";

import { useState, useEffect } from "react";
import { Dish, Ingredient, DishIngredient } from "@/lib/types";
import { useNotificationHelpers } from "@/lib/notification-context";

interface UseRecipeFormProps {
  onSave: (
    recipe: Omit<Dish, "id" | "createdAt" | "updatedAt">
  ) => Promise<Dish | null>;
  onUpdate: (
    id: string,
    recipe: Omit<Dish, "id" | "createdAt" | "updatedAt">
  ) => Promise<Dish | null>;
  ingredients: Ingredient[];
  initialRecipe?: Dish;
  onCancel: () => void;
}

export function useRecipeForm({
  onSave,
  onUpdate,
  ingredients,
  initialRecipe,
  onCancel,
}: UseRecipeFormProps) {
  // Form state
  const [name, setName] = useState(initialRecipe?.name || "");
  const [price, setPrice] = useState(initialRecipe?.price.toString() || "");
  const [recipeIngredients, setRecipeIngredients] = useState<DishIngredient[]>(
    initialRecipe?.ingredients || []
  );

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  // Notifications
  const { error: showError } = useNotificationHelpers();

  // Reset form when initialRecipe changes
  useEffect(() => {
    setName(initialRecipe?.name || "");
    setPrice(initialRecipe?.price.toString() || "");
    setRecipeIngredients(initialRecipe?.ingredients || []);
  }, [initialRecipe]);

  // Function to add a new ingredient to the recipe
  const addIngredient = () => {
    if (ingredients.length === 0) return;

    // Find first ingredient not already in the recipe
    const availableIngredients = ingredients.filter(
      (ing) => !recipeIngredients.some((ri) => ri.ingredientId === ing.id)
    );

    if (availableIngredients.length === 0) return;

    setRecipeIngredients([
      ...recipeIngredients,
      { ingredientId: availableIngredients[0].id, quantity: 0 },
    ]);
  };

  // Function to remove an ingredient from the recipe
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients.splice(index, 1);
    setRecipeIngredients(updatedIngredients);
  };

  // Function to update an ingredient\'s quantity
  const updateIngredientQuantity = (index: number, quantity: number) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients[index].quantity = quantity;
    setRecipeIngredients(updatedIngredients);
  };

  // Function to update an ingredient\'s id
  const updateIngredientId = (index: number, ingredientId: string) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients[index].ingredientId = ingredientId;
    setRecipeIngredients(updatedIngredients);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!name.trim()) {
      showError("Validation Error", "Please enter a recipe name");
      return false;
    }

    if (!price || parseFloat(price) < 0) {
      showError("Validation Error", "Please enter a valid price");
      return false;
    }

    if (recipeIngredients.length === 0) {
      showError("Validation Error", "Please add at least one ingredient");
      return false;
    }

    // Check for valid quantities
    const invalidIngredient = recipeIngredients.find(
      (ing) => ing.quantity <= 0
    );

    if (invalidIngredient) {
      const ingredientName =
        ingredients.find((i) => i.id === invalidIngredient.ingredientId)
          ?.name || "Unknown";

      showError(
        "Validation Error",
        `Please enter a valid quantity for ${ingredientName}`
      );
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Create recipe data
      const recipeData = {
        name,
        price: parseFloat(price),
        ingredients: recipeIngredients,
      };

      let result;

      // Update or create recipe
      if (initialRecipe) {
        result = await onUpdate(initialRecipe.id, recipeData);
      } else {
        result = await onSave(recipeData);
      }

      if (result) {
        // Reset form on success
        if (!initialRecipe) {
          setName("");
          setPrice("");
          setRecipeIngredients([]);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    name,
    setName,
    price,
    setPrice,
    recipeIngredients,
    isSaving,
    addIngredient,
    removeIngredient,
    updateIngredientQuantity,
    updateIngredientId,
    handleSubmit,
    onCancel,
  };
}
