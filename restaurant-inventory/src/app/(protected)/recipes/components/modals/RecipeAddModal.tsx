"use client";

import {
  useState,
  useCallback,
  ReactNode,
  ChangeEvent,
  MouseEvent,
} from "react";
import { FiX, FiPlusCircle } from "react-icons/fi";
import { toast } from "sonner";
import { recipeService } from "@/lib/services/recipe-service";
import { getCurrentUser } from "@/lib/utils/Auth/auth-utils";

// Define RecipeFormData type locally if it's not being used from imported file
interface RecipeFormData {
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  foodCost: number;
  ingredients: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
  }>;
  allergies: string[];
  preparationTime: number;
  servingSize: number;
  instructions: string;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  _ingredientNames?: Record<string, string>;
}

// Define FormField prop types
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

// Components
const FormField = ({ label, error, required, children }: FormFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-neutral-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// Default form values
const defaultFormData: RecipeFormData = {
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
};

// Define modal props interface
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
  const [formData, setFormData] = useState<RecipeFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ingredient state
  const [ingredientState, setIngredientState] = useState({
    name: "",
    quantity: 1,
    unit: "g",
  });

  // Handle form input changes
  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;

      // Handle nested fields with dot notation (e.g., nutritionInfo.calories)
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        setFormData((prev) => {
          if (parent === "nutritionInfo") {
            return {
              ...prev,
              nutritionInfo: {
                ...prev.nutritionInfo,
                [child]:
                  typeof value === "string" && !isNaN(parseFloat(value))
                    ? parseFloat(value) || 0
                    : value,
              },
            };
          }
          return prev;
        });
      } else if (name === "price" || name === "foodCost") {
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

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Recipe name is required";
    if (formData.price <= 0)
      newErrors.price = "Price must be greater than zero";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Add ingredient
  const addIngredient = useCallback(() => {
    if (!ingredientState.name.trim()) {
      toast.error("Please enter an ingredient name");
      return;
    }

    setFormData((prev: RecipeFormData) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ingredientId: ingredientState.name,
          quantity: ingredientState.quantity,
          unit: ingredientState.unit,
        },
      ],
      _ingredientNames: {
        ...(prev._ingredientNames || {}),
        [ingredientState.name]: ingredientState.name,
      },
    }));

    // Reset ingredient state
    setIngredientState({
      name: "",
      quantity: 1,
      unit: "g",
    });
  }, [ingredientState]);

  // Remove ingredient
  const removeIngredient = useCallback((index: number) => {
    setFormData((prev) => {
      const updatedIngredients = [...prev.ingredients];
      updatedIngredients.splice(index, 1);

      return {
        ...prev,
        ingredients: updatedIngredients,
      };
    });
  }, []);

  // Submit form
  const handleSubmit = useCallback(
    async (
      e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>
    ) => {
      // Prevent default form submission behavior
      e.preventDefault();

      // Validate form
      if (!validateForm()) {
        toast.error("Please fix the errors in the form");
        return;
      }

      setIsSubmitting(true);
      const toastId = toast.loading("Creating your recipe...");

      try {
        // Check authentication
        const { user, error: authError } = await getCurrentUser();

        if (authError || !user) {
          toast.dismiss(toastId);
          toast.error("Authentication failed. Please try logging in again.");
          onClose();
          return;
        }

        // Remove internal tracking field and rename it to avoid unused variable warning
        const { _ingredientNames: _unused, ...recipeToSend } = formData;
        // Explicitly mark as unused to satisfy linter
        void _unused;

        // Create recipe
        console.log("Creating recipe with data:", recipeToSend);
        const result = await recipeService.addRecipe({
          ...recipeToSend,
          category: recipeToSend.category || "",
          description: recipeToSend.description || "",
          isArchived: false,
          popularity: 0,
        });

        console.log("Recipe creation result:", result);
        if (!result) {
          throw new Error("Failed to create recipe");
        }

        toast.dismiss(toastId);
        toast.success("Recipe created successfully!");

        // First call success callback to trigger the refetch
        console.log("Calling onSuccess to refresh recipe list");
        onSuccess();

        // Reset form state
        setFormData(defaultFormData);

        // Then close the modal
        console.log("Closing modal after successful creation");
        onClose();
      } catch (error: unknown) {
        console.error("Recipe creation failed:", error);
        toast.dismiss(toastId);

        // Type guard for error with message property
        if (error instanceof Error) {
          toast.error(error.message || "Failed to create recipe");
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, onClose, onSuccess]
  );

  // Reset state when closing
  const handleClose = useCallback(() => {
    setFormData(defaultFormData);
    setErrors({});
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-lg max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
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

        {/* Form */}
        <div className="overflow-y-auto flex-grow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipe Name */}
            <FormField label="Recipe Name" error={errors.name} required>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.name ? "border-red-300" : "border-neutral-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500`}
                placeholder="Enter recipe name"
              />
            </FormField>

            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Price" error={errors.price} required>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    kr
                  </span>
                  <input
                    type="number"
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
              </FormField>

              <FormField label="Category">
                <input
                  type="text"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  placeholder="e.g., Appetizer, Main Course"
                />
              </FormField>
            </div>

            {/* Food Cost and Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Food Cost">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    kr
                  </span>
                  <input
                    type="number"
                    name="foodCost"
                    value={formData.foodCost || ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    placeholder="0.00"
                  />
                </div>
              </FormField>

              <FormField label="Image URL">
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  placeholder="https://example.com/image.jpg"
                />
              </FormField>
            </div>

            {/* Description */}
            <FormField label="Description">
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
                placeholder="Enter recipe description"
              />
            </FormField>

            {/* Preparation Time and Serving Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Preparation Time (minutes)">
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime || ""}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  placeholder="45"
                />
              </FormField>

              <FormField label="Serving Size">
                <input
                  type="number"
                  name="servingSize"
                  value={formData.servingSize || ""}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  placeholder="1"
                />
              </FormField>
            </div>

            {/* Cooking Instructions */}
            <FormField label="Cooking Instructions">
              <textarea
                name="instructions"
                value={formData.instructions || ""}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
                placeholder="Enter step-by-step cooking instructions"
              />
            </FormField>

            {/* Nutrition Information */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-neutral-700">
                  Nutrition Information (per serving)
                </label>
                <span className="text-xs text-neutral-500">Optional</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["calories", "protein", "carbs", "fat"].map((nutrient) => (
                  <div key={nutrient}>
                    <label className="block text-xs text-neutral-600 mb-1">
                      {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                    </label>
                    <input
                      type="number"
                      name={`nutritionInfo.${nutrient}`}
                      value={
                        formData.nutritionInfo[
                          nutrient as keyof typeof formData.nutritionInfo
                        ] || ""
                      }
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                      placeholder={nutrient === "calories" ? "kcal" : "g"}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients Note */}
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Adding ingredients enables advanced
                features like inventory tracking and cost calculation.
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
                    <label className="block text-xs text-neutral-600 mb-1">
                      Ingredient Name
                    </label>
                    <input
                      type="text"
                      value={ingredientState.name}
                      onChange={(e) =>
                        setIngredientState((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                      placeholder="e.g., Tomato"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-xs text-neutral-600 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={ingredientState.quantity}
                      onChange={(e) =>
                        setIngredientState((prev) => ({
                          ...prev,
                          quantity: parseFloat(e.target.value) || 0,
                        }))
                      }
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-xs text-neutral-600 mb-1">
                      Unit
                    </label>
                    <select
                      value={ingredientState.unit}
                      onChange={(e) =>
                        setIngredientState((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm bg-white"
                    >
                      {["g", "kg", "ml", "l", "pcs", "tbsp", "tsp"].map(
                        (unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        )
                      )}
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
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 flex justify-end gap-3 bg-neutral-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e: MouseEvent<HTMLButtonElement>) => handleSubmit(e)}
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
