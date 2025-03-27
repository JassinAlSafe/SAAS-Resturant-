"use client";

import { useState } from "react";
import { FiX, FiInfo } from "react-icons/fi";
import { Dish } from "@/lib/types";
import { useCurrency } from "@/lib/currency";

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Dish | null;
}

export default function RecipeDetailModal({
  isOpen,
  onClose,
  recipe,
}: RecipeDetailModalProps) {
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<"details" | "ingredients">(
    "details"
  );

  if (!isOpen || !recipe) return null;

  // Check if recipe has relational data
  const hasRelationalData = recipe.ingredients && recipe.ingredients.length > 0;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-lg max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-100 p-2.5 rounded-md">
              <FiInfo className="h-5 w-5 text-neutral-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                {recipe.name}
              </h3>
              <p className="text-neutral-500 text-sm mt-0.5">
                {recipe.category || "No category"} ·{" "}
                {formatCurrency(recipe.price)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-500"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-neutral-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "details"
                  ? "text-neutral-900 border-b-2 border-neutral-900"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Recipe Details
            </button>
            <button
              onClick={() => setActiveTab("ingredients")}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "ingredients"
                  ? "text-neutral-900 border-b-2 border-neutral-900"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Ingredients{" "}
              {hasRelationalData && (
                <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                  ✓
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Recipe Image */}
              {recipe.imageUrl && (
                <div className="aspect-video rounded-md overflow-hidden bg-neutral-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Recipe Description */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-neutral-900">
                  Description
                </h4>
                <p className="text-neutral-700">
                  {recipe.description || "No description provided."}
                </p>
              </div>

              {/* Recipe Preparation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-neutral-900">
                    Preparation Details
                  </h4>
                  <div className="bg-white p-4 rounded-md border border-neutral-200">
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs text-neutral-500">
                          Preparation Time
                        </dt>
                        <dd className="text-sm font-medium text-neutral-800">
                          {recipe.preparationTime
                            ? `${recipe.preparationTime} min`
                            : "Not set"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-500">
                          Serving Size
                        </dt>
                        <dd className="text-sm font-medium text-neutral-800">
                          {recipe.servingSize
                            ? `${recipe.servingSize} servings`
                            : "Not set"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 text-neutral-900">
                    Nutrition Information
                  </h4>
                  <div className="bg-white p-4 rounded-md border border-neutral-200">
                    {recipe.nutritionInfo ? (
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-xs text-neutral-500">Calories</dt>
                          <dd className="text-sm font-medium text-neutral-800">
                            {recipe.nutritionInfo.calories} kcal
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-neutral-500">Protein</dt>
                          <dd className="text-sm font-medium text-neutral-800">
                            {recipe.nutritionInfo.protein} g
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-neutral-500">Carbs</dt>
                          <dd className="text-sm font-medium text-neutral-800">
                            {recipe.nutritionInfo.carbs} g
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-neutral-500">Fat</dt>
                          <dd className="text-sm font-medium text-neutral-800">
                            {recipe.nutritionInfo.fat} g
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-sm text-neutral-500">
                        No nutrition information available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipe Instructions */}
              {recipe.instructions && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-neutral-900">
                    Cooking Instructions
                  </h4>
                  <div className="bg-white p-4 rounded-md border border-neutral-200">
                    <p className="text-sm text-neutral-700 whitespace-pre-line">
                      {recipe.instructions}
                    </p>
                  </div>
                </div>
              )}

              {/* Recipe Cost Information */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-neutral-900">
                  Pricing Information
                </h4>
                <div className="bg-white p-4 rounded-md border border-neutral-200 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-neutral-500">Price</dt>
                    <dd className="text-base font-medium text-neutral-800">
                      {formatCurrency(recipe.price)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Food Cost</dt>
                    <dd className="text-base font-medium text-neutral-800">
                      {recipe.foodCost
                        ? formatCurrency(recipe.foodCost)
                        : "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Profit Margin</dt>
                    <dd className="text-base font-medium text-neutral-800">
                      {recipe.foodCost && recipe.price
                        ? `${Math.round(
                            ((recipe.price - recipe.foodCost) / recipe.price) *
                              100
                          )}%`
                        : "Not calculated"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Status</dt>
                    <dd className="text-base font-medium text-neutral-800">
                      {recipe.isArchived ? (
                        <span className="text-orange-600">Archived</span>
                      ) : (
                        <span className="text-green-600">Active</span>
                      )}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="space-y-6">
              {hasRelationalData ? (
                <>
                  <div className="bg-green-50 p-4 rounded-md border border-green-100 mb-4">
                    <h4 className="text-sm font-medium text-green-800">
                      Relational Data Available
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      This recipe has a complete dish relationship with
                      ingredient data. This enables inventory tracking and cost
                      calculation.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-neutral-900">
                      Ingredient List
                    </h4>
                    <div className="bg-white rounded-md border border-neutral-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Ingredient
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Unit
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {recipe.ingredients.map((ingredient, index) => (
                            <tr key={index} className="hover:bg-neutral-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-700">
                                {ingredient.ingredientId}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700 text-right">
                                {ingredient.quantity}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 text-right">
                                {ingredient.unit || "units"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-blue-50 p-6 rounded-md border border-blue-100 text-center">
                  <h4 className="text-base font-medium text-blue-800 mb-2">
                    No Ingredient Data
                  </h4>
                  <p className="text-sm text-blue-700 mb-4">
                    This recipe doesn&apos;t have any ingredients added yet. To
                    enable relational features like inventory tracking and cost
                    calculation, edit the recipe to add ingredients.
                  </p>
                  <div className="p-4 bg-white rounded border border-blue-200">
                    <p className="text-xs text-neutral-600">
                      <strong>Database Structure:</strong> When ingredients are
                      added, a dish record will be created with a relationship
                      to this recipe, enabling the full relational features
                      described in the MVP.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200 flex justify-end gap-3 bg-neutral-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 text-white rounded-md text-sm font-medium hover:bg-neutral-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
