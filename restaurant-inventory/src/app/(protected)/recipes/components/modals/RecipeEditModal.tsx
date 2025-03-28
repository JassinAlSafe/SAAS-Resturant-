"use client";

import { useState, useEffect, useCallback } from "react";
import { FiX, FiEdit } from "react-icons/fi";
import { Dish, DishIngredient } from "@/lib/types";
import { RecipeFormData } from "../../types";
import { recipeService } from "@/lib/services/recipe-service";
import { toast } from "sonner";

interface RecipeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Dish;
  onSuccess: () => Promise<void>;
}

export default function RecipeEditModal({
  isOpen,
  onClose,
  recipe,
  onSuccess,
}: RecipeEditModalProps) {
  // Form state
  const [formData, setFormData] = useState<RecipeFormData>({
    name: "",
    price: 0,
    category: "",
    description: "",
    imageUrl: "",
    foodCost: 0,
    ingredients: [],
    allergies: [],
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when recipe changes
  useEffect(() => {
    if (recipe) {
      // Convert DishIngredient[] to RecipeFormData ingredients
      const formIngredients = recipe.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        unit: ing.unit,
      }));

      setFormData({
        name: recipe.name,
        price: recipe.price || 0,
        category: recipe.category || "",
        description: recipe.description || "",
        imageUrl: recipe.imageUrl || "",
        foodCost: recipe.foodCost || 0,
        ingredients: formIngredients,
        allergies: recipe.allergies || [],
      });
    }
  }, [recipe]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Convert numeric fields to numbers
    if (name === "price" || name === "foodCost") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseFloat(value) : 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for the field being changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Recipe name is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      if (!validateForm()) {
        toast.error("Please fix the errors in the form");
        return;
      }

      if (!recipe || !recipe.id) {
        toast.error("Missing recipe ID");
        return;
      }

      setIsSubmitting(true);
      const toastId = toast.loading("Updating recipe...");

      try {
        console.log("Submitting recipe update with data:", formData);

        // Convert formData ingredients to DishIngredient format
        // The API expects ingredients in the format used by the Dish type
        const dishIngredients: DishIngredient[] =
          formData.ingredients?.map((ingredient) => ({
            ingredientId: ingredient.ingredientId,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          })) || [];

        // Create the formatted recipe with the correct structure
        const formattedRecipe = {
          name: formData.name,
          price: formData.price,
          category: formData.category || "",
          description: formData.description || "",
          imageUrl: formData.imageUrl || "",
          foodCost: formData.foodCost || 0,
          allergens: formData.allergies || [],
          ingredients: dishIngredients,
        };

        console.log("Formatted recipe for update:", formattedRecipe);

        // Call the service to update the recipe
        const result = await recipeService.updateRecipe(
          recipe.id,
          formattedRecipe
        );

        if (result) {
          toast.dismiss(toastId);
          toast.success("Recipe updated successfully");

          // Call onSuccess to trigger refresh in parent
          await onSuccess();

          // Close the modal
          onClose();
        } else {
          throw new Error("Failed to update recipe");
        }
      } catch (error) {
        console.error("Error updating recipe:", error);
        toast.dismiss(toastId);

        if (error instanceof Error) {
          toast.error(`Update failed: ${error.message}`);
        } else {
          toast.error("Failed to update recipe. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [recipe, formData, validateForm, onSuccess, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-lg max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-100 p-2.5 rounded-md">
              <FiEdit className="h-5 w-5 text-neutral-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Edit Recipe
              </h3>
              <p className="text-neutral-500 text-sm mt-0.5">
                Update recipe details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-500"
            disabled={isSubmitting}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipe Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Recipe Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.name ? "border-red-300" : "border-neutral-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500`}
                placeholder="Enter recipe name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Price and Category in two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    kr
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.price ? "border-red-300" : "border-neutral-300"
                    } rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-xs text-red-500">{errors.price}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  placeholder="e.g., Appetizer, Main Course"
                />
              </div>
            </div>

            {/* Food Cost and Image URL in two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="foodCost"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Food Cost
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    kr
                  </span>
                  <input
                    type="number"
                    id="foodCost"
                    name="foodCost"
                    value={formData.foodCost || ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
                placeholder="Enter recipe description"
              />
            </div>

            {/* Note: Ingredients and allergies would be added here */}
          </form>
        </div>

        <div className="p-6 border-t border-neutral-200 flex justify-end gap-3 bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 ${
              isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Recipe"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
