"use client";

import { useState } from "react";
import { FiX, FiPlusCircle } from "react-icons/fi";
import { RecipeFormData } from "../../types";
import { toast } from "sonner";
import { recipeService } from "@/lib/services/recipe-service";
import { supabase } from "@/lib/supabase/client";

interface RecipeAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecipeAddModal({
  isOpen,
  onClose,
  onSuccess,
}: RecipeAddModalProps) {
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
    preparationTime: 0,
    servingSize: 1,
    instructions: "",
    nutritionInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });

  // Ingredient temporary state
  const [currentIngredient, setCurrentIngredient] = useState({
    ingredientId: "",
    name: "",
    quantity: 1,
    unit: "g",
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to generate a proper UUID (v4)
  const generateUUID = () => {
    // Use crypto.randomUUID() if available (modern browsers)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback implementation for older browsers
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
      const num = Number(c);
      return (
        num ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))
      ).toString(16);
    });
  };

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

  // Create recipe in database
  const createRecipe = async (recipe: RecipeFormData) => {
    // Track toast ID to dismiss later
    let toastId: string | number = "";

    try {
      setIsSubmitting(true);

      // Show saving notification
      toastId = toast.loading("Creating your recipe...");

      // Debug: Log the data we're trying to insert
      console.log("Attempting to create recipe with data:", recipe);

      // Check if user is authenticated first
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        console.error("Authentication error:", authError);
        toast.dismiss(toastId);
        toast.error("Authentication failed. Please try logging in again.");
        onClose(); // Close modal on auth error
        return;
      }

      console.log(
        "Authentication status:",
        authData.user ? "Authenticated" : "Not authenticated",
        "User ID:",
        authData.user?.id
      );

      if (!authData.user) {
        toast.dismiss(toastId);
        toast.error("You must be logged in to create a recipe");
        onClose(); // Close modal when not authenticated
        return;
      }

      // Remove internal tracking field before sending to server
      // We need to use a temporary variable to satisfy the linter
      const { _ingredientNames: _names, ...recipeToSend } = recipe;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _unusedVar = _names; // This line is just to satisfy the linter
      console.log("Prepared data for server:", recipeToSend);

      try {
        // Use the recipe service
        console.log("Calling recipeService.addRecipe...");

        // Update toast message to show progress
        toast.loading("Connecting to server...", { id: toastId });

        const result = await recipeService.addRecipe({
          name: recipeToSend.name,
          price: recipeToSend.price,
          category: recipeToSend.category || "",
          description: recipeToSend.description || "",
          imageUrl: recipeToSend.imageUrl || "",
          foodCost: recipeToSend.foodCost || 0,
          ingredients: recipeToSend.ingredients || [],
          allergies: recipeToSend.allergies || [],
          isArchived: false, // Explicitly set to false
          popularity: 0,
          preparationTime: recipeToSend.preparationTime || 0,
          servingSize: recipeToSend.servingSize || 1,
          instructions: recipeToSend.instructions || "",
          nutritionInfo: recipeToSend.nutritionInfo || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
          },
        });

        console.log("Recipe creation API returned:", result);

        if (!result) {
          toast.dismiss(toastId);
          toast.error("Server returned empty response. Please try again.");
          onClose(); // Close modal on error
          return;
        }

        // Dismiss loading toast and show success
        toast.dismiss(toastId);
        toast.success("Recipe created successfully!");

        // Call the success callback to update the parent component
        onSuccess();

        // Reset form state
        setFormData({
          name: "",
          price: 0,
          category: "",
          description: "",
          imageUrl: "",
          foodCost: 0,
          ingredients: [],
          allergies: [],
          preparationTime: 0,
          servingSize: 1,
          instructions: "",
          nutritionInfo: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
          },
        });

        // Close the modal
        onClose();
      } catch (serviceError: Error | unknown) {
        console.error("Recipe service error:", serviceError);

        // Handle specific error types
        let errorMessage = "Failed to create recipe. Please try again.";

        if (serviceError instanceof Error) {
          if (serviceError.message.includes("business profile")) {
            errorMessage =
              "Missing business profile. Please set up your business profile first.";
          } else if (
            serviceError.message.includes("authentication") ||
            serviceError.message.includes("authenticated")
          ) {
            errorMessage = "Authentication issue. Please log in again.";
          } else {
            // Use the actual error message if available
            errorMessage = serviceError.message;
          }
        }

        toast.dismiss(toastId);
        toast.error(errorMessage);
        onClose(); // Close modal on service error
      }
    } catch (error) {
      console.error("Unexpected error in recipe creation:", error);
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred. Please try again later.");
      onClose(); // Close modal on unexpected error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm() && !isSubmitting) {
      await createRecipe(formData);
    }
  };

  // Close the modal and reset form
  const handleClose = () => {
    setFormData({
      name: "",
      price: 0,
      category: "",
      description: "",
      imageUrl: "",
      foodCost: 0,
      ingredients: [],
      allergies: [],
      preparationTime: 0,
      servingSize: 1,
      instructions: "",
      nutritionInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      _ingredientNames: {},
    });
    setErrors({});
    onClose();
  };

  // Add ingredient to the recipe
  const addIngredient = () => {
    if (!currentIngredient.name.trim()) {
      toast.error("Please enter an ingredient name");
      return;
    }

    // Important: For now, we'll store just the name and unit info
    // The actual ingredient ID will be determined server-side
    // This prevents foreign key violations with non-existent IDs

    // Create a temporary ID for UI purposes only
    const tempId = generateUUID();

    // Keep track of ingredient names for display purposes
    const ingredientNames = {
      ...(formData._ingredientNames || {}),
      [tempId]: currentIngredient.name,
    };

    setFormData({
      ...formData,
      ingredients: [
        ...(formData.ingredients || []),
        {
          // Use name as the ID to be resolved on the server
          ingredientId: currentIngredient.name, // Using name instead of random UUID
          quantity: currentIngredient.quantity,
          unit: currentIngredient.unit,
        },
      ],
      // Store ingredient names internally but don't send to server
      _ingredientNames: ingredientNames,
    });

    // Reset the current ingredient
    setCurrentIngredient({
      ingredientId: "",
      name: "",
      quantity: 1,
      unit: "g",
    });
  };

  // Remove an ingredient
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...(formData.ingredients || [])];
    const ingredientToRemove = updatedIngredients[index];
    updatedIngredients.splice(index, 1);

    // Create a copy of ingredient names without the removed one
    const updatedIngredientNames = { ...(formData._ingredientNames || {}) };
    if (
      ingredientToRemove &&
      updatedIngredientNames[ingredientToRemove.ingredientId]
    ) {
      delete updatedIngredientNames[ingredientToRemove.ingredientId];
    }

    setFormData({
      ...formData,
      ingredients: updatedIngredients,
      _ingredientNames: updatedIngredientNames,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-lg max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-100 p-2.5 rounded-md">
              <FiPlusCircle className="h-5 w-5 text-neutral-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Add New Recipe
              </h3>
              <p className="text-neutral-500 text-sm mt-0.5">
                Create a new recipe for your menu
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-500"
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

            {/* Preparation Time and Serving Size in two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="preparationTime"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  id="preparationTime"
                  name="preparationTime"
                  value={formData.preparationTime || ""}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  placeholder="45"
                />
              </div>

              <div>
                <label
                  htmlFor="servingSize"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Serving Size
                </label>
                <input
                  type="number"
                  id="servingSize"
                  name="servingSize"
                  value={formData.servingSize || ""}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Cooking Instructions */}
            <div>
              <label
                htmlFor="instructions"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Cooking Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions || ""}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
                placeholder="Enter step-by-step cooking instructions"
              />
            </div>

            {/* Nutrition Information - Basic */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-neutral-700">
                  Nutrition Information (per serving)
                </label>
                <span className="text-xs text-neutral-500">Optional</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label
                    htmlFor="calories"
                    className="block text-xs text-neutral-600 mb-1"
                  >
                    Calories
                  </label>
                  <input
                    type="number"
                    id="calories"
                    name="nutritionInfo.calories"
                    value={formData.nutritionInfo?.calories || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutritionInfo: {
                          ...(formData.nutritionInfo || {
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                          }),
                          calories: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    min="0"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                    placeholder="kcal"
                  />
                </div>
                <div>
                  <label
                    htmlFor="protein"
                    className="block text-xs text-neutral-600 mb-1"
                  >
                    Protein
                  </label>
                  <input
                    type="number"
                    id="protein"
                    name="nutritionInfo.protein"
                    value={formData.nutritionInfo?.protein || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutritionInfo: {
                          ...(formData.nutritionInfo || {
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                          }),
                          protein: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    min="0"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                    placeholder="g"
                  />
                </div>
                <div>
                  <label
                    htmlFor="carbs"
                    className="block text-xs text-neutral-600 mb-1"
                  >
                    Carbs
                  </label>
                  <input
                    type="number"
                    id="carbs"
                    name="nutritionInfo.carbs"
                    value={formData.nutritionInfo?.carbs || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutritionInfo: {
                          ...(formData.nutritionInfo || {
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                          }),
                          carbs: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    min="0"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                    placeholder="g"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fat"
                    className="block text-xs text-neutral-600 mb-1"
                  >
                    Fat
                  </label>
                  <input
                    type="number"
                    id="fat"
                    name="nutritionInfo.fat"
                    value={formData.nutritionInfo?.fat || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutritionInfo: {
                          ...(formData.nutritionInfo || {
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                          }),
                          fat: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    min="0"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                    placeholder="g"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients Note */}
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Adding ingredients to your recipe creates
                a dish record, enabling advanced features like inventory
                tracking and cost calculation.
              </p>
              <p className="text-sm text-blue-600 mt-1">
                For the MVP, recipes without ingredients will still display in
                your list but won&apos;t have relational features.
              </p>
            </div>

            {/* Ingredient Management */}
            <div>
              <h3 className="text-md font-medium text-neutral-800 mb-3">
                Ingredient Management
              </h3>

              {/* Add Ingredient Form */}
              <div className="mb-4 p-4 bg-neutral-50 rounded-md border border-neutral-200">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 sm:col-span-5">
                    <label
                      htmlFor="ingredientName"
                      className="block text-xs text-neutral-600 mb-1"
                    >
                      Ingredient Name
                    </label>
                    <input
                      type="text"
                      id="ingredientName"
                      value={currentIngredient.name}
                      onChange={(e) =>
                        setCurrentIngredient({
                          ...currentIngredient,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                      placeholder="e.g., Tomato"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="quantity"
                      className="block text-xs text-neutral-600 mb-1"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      value={currentIngredient.quantity}
                      onChange={(e) =>
                        setCurrentIngredient({
                          ...currentIngredient,
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label
                      htmlFor="unit"
                      className="block text-xs text-neutral-600 mb-1"
                    >
                      Unit
                    </label>
                    <select
                      id="unit"
                      value={currentIngredient.unit}
                      onChange={(e) =>
                        setCurrentIngredient({
                          ...currentIngredient,
                          unit: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm bg-white"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="pcs">pcs</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                    </select>
                  </div>
                  <div className="col-span-12 sm:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="w-full px-3 py-2 bg-neutral-800 text-white rounded-md text-sm font-medium hover:bg-neutral-900 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="border border-neutral-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Ingredient
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {formData.ingredients && formData.ingredients.length > 0 ? (
                      formData.ingredients.map((ingredient, index) => (
                        <tr key={index} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-800">
                            {/* Use stored ingredient name if available */}
                            {formData._ingredientNames?.[
                              ingredient.ingredientId
                            ] || ingredient.ingredientId}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-800 text-right">
                            {ingredient.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                            {ingredient.unit || "g"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-sm text-neutral-500 text-center"
                        >
                          No ingredients added yet. Start by adding ingredients
                          above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note: Allergies would be added here
                using more complex components. For this example, 
                we'll keep it simple */}
          </form>
        </div>

        <div className="p-6 border-t border-neutral-200 flex justify-end gap-3 bg-neutral-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 ${
              isSubmitting
                ? "bg-neutral-400 cursor-not-allowed"
                : "bg-neutral-800 hover:bg-neutral-900"
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
                Creating...
              </>
            ) : (
              "Create Recipe"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
