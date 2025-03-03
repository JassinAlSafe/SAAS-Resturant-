"use client";

import { Dish, Ingredient, DishIngredient } from "@/lib/types";
import { useRecipeForm } from "../hooks/useRecipeForm";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/lib/currency-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";

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
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            {initialRecipe ? "Edit Recipe" : "Create New Recipe"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Recipe Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter recipe name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ({currency.symbol})</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Ingredients</h3>
              <Button
                type="button"
                onClick={addIngredient}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                disabled={availableIngredients.length === 0}
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipeIngredients.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No ingredients added yet. Click "Add Ingredient" to
                        start.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recipeIngredients.map((recipeIngredient, index) => {
                      const ingredient = getIngredient(
                        recipeIngredient.ingredientId
                      );

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={recipeIngredient.ingredientId}
                              onValueChange={(value) =>
                                updateIngredientId(index, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select ingredient" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value={recipeIngredient.ingredientId}
                                >
                                  {ingredient?.name || "Unknown"}
                                </SelectItem>
                                {availableIngredients.map((ing) => (
                                  <SelectItem key={ing.id} value={ing.id}>
                                    {ing.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
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
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>{ingredient?.unit || ""}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Recipe"}
              {!isSaving && <FiSave className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
