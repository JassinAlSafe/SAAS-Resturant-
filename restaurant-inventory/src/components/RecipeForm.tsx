"use client";

import { Dish, Ingredient } from "@/lib/types";
import { useRecipeForm } from "@/app/(protected)/recipes/hooks/useRecipeForm";
import { useCurrency } from "@/lib/currency";
import { FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import { Select } from "@/components/ui/select";

interface RecipeFormProps {
  initialRecipe?: Dish;
  ingredients: Ingredient[];
  onSave: (
    recipe: Omit<Dish, "id" | "createdAt" | "updatedAt">
  ) => Promise<Dish | null>;
  onUpdate: (
    id: string,
    recipe: Omit<Dish, "id" | "createdAt" | "updatedAt">
  ) => Promise<Dish | null>;
  onCancel: () => void;
}

export default function RecipeForm({
  initialRecipe,
  ingredients,
  onSave,
  onUpdate,
  onCancel,
}: RecipeFormProps) {
  const { currency } = useCurrency();

  const {
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
  } = useRecipeForm({
    onSave,
    onUpdate,
    ingredients,
    initialRecipe,
    onCancel,
  });

  // Get an ingredient object by ID
  const getIngredient = (id: string) => {
    return ingredients.find((ingredient) => ingredient.id === id);
  };

  // Filter out ingredients already used in the recipe
  const availableIngredients = ingredients.filter(
    (ing) => !recipeIngredients.some((ri) => ri.ingredientId === ing.id)
  );

  return (
    <div className="bg-white rounded-lg border border-neutral-100 shadow-sm p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">
              {initialRecipe ? "Edit Recipe" : "Create New Recipe"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-neutral-700 text-sm font-medium block"
              >
                Recipe Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter recipe name"
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="price"
                className="text-neutral-700 text-sm font-medium block"
              >
                Price ({currency.symbol})
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-900">
                Ingredients
              </h3>
              <button
                type="button"
                onClick={addIngredient}
                disabled={availableIngredients.length === 0}
                className="px-3 py-1.5 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 font-medium rounded-lg transition-colors duration-200 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus className="mr-1.5 h-4 w-4" />
                Add Ingredient
              </button>
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="py-3 px-4 text-xs font-medium text-neutral-600 uppercase tracking-wider text-left">
                      Ingredient
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-neutral-600 uppercase tracking-wider text-left">
                      Quantity
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-neutral-600 uppercase tracking-wider text-left">
                      Unit
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-neutral-600 uppercase tracking-wider text-left w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recipeIngredients.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-neutral-500"
                      >
                        No ingredients added yet. Click &quot;Add
                        Ingredient&quot; to start.
                      </td>
                    </tr>
                  ) : (
                    recipeIngredients.map((recipeIngredient, index) => {
                      const ingredient = getIngredient(
                        recipeIngredient.ingredientId
                      );

                      return (
                        <tr key={index} className="border-b border-neutral-100">
                          <td className="py-3 px-4">
                            <Select
                              value={recipeIngredient.ingredientId}
                              onChange={(e) =>
                                updateIngredientId(index, e.target.value)
                              }
                              className="border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            >
                              <option value={recipeIngredient.ingredientId}>
                                {ingredient?.name || "Unknown"}
                              </option>
                              {availableIngredients.map((ing) => (
                                <option key={ing.id} value={ing.id}>
                                  {ing.name}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={recipeIngredient.quantity}
                              onChange={(e) =>
                                updateIngredientQuantity(
                                  index,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                          </td>
                          <td className="py-3 px-4 text-neutral-600">
                            {ingredient?.unit || ""}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove ingredient"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Recipe"}
              {!isSaving && <FiSave className="ml-2 h-4 w-4" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
