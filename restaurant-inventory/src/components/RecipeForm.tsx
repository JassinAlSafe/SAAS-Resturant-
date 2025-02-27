"use client";

import { useState, useEffect } from "react";
import { Dish, Ingredient, DishIngredient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card } from "@/components/ui/card";

interface RecipeFormProps {
  dish?: Dish;
  ingredients: Ingredient[];
  onSave: (dish: Dish) => void;
  onCancel: () => void;
}

export default function RecipeForm({
  dish,
  ingredients,
  onSave,
  onCancel,
}: RecipeFormProps) {
  const [name, setName] = useState(dish?.name || "");
  const [price, setPrice] = useState(dish?.price.toString() || "");
  const [recipeIngredients, setRecipeIngredients] = useState<DishIngredient[]>(
    dish?.ingredients || []
  );

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

  // Function to update an ingredient's quantity
  const updateIngredientQuantity = (index: number, quantity: number) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients[index].quantity = quantity;
    setRecipeIngredients(updatedIngredients);
  };

  // Function to update an ingredient's id
  const updateIngredientId = (index: number, ingredientId: string) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients[index].ingredientId = ingredientId;
    setRecipeIngredients(updatedIngredients);
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name || !price || recipeIngredients.length === 0) {
      alert(
        "Please fill in all required fields and add at least one ingredient."
      );
      return;
    }

    // Create dish object
    const updatedDish: Dish = {
      id: dish?.id || `temp-${Date.now()}`, // In a real app, this would be handled by the backend
      name,
      price: parseFloat(price),
      ingredients: recipeIngredients,
      createdAt: dish?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedDish);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Dish Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter dish name"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="price"
                className="text-sm font-medium text-slate-700"
              >
                Price ($)
              </label>
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
              <h3 className="text-lg font-medium text-slate-800">
                Ingredients
              </h3>
              <Button
                type="button"
                onClick={addIngredient}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
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
                        className="text-center py-6 text-slate-500"
                      >
                        No ingredients added yet. Click "Add Ingredient" to
                        start.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recipeIngredients.map((recipeIngredient, index) => {
                      const ingredient = ingredients.find(
                        (ing) => ing.id === recipeIngredient.ingredientId
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
                                {ingredients.map((ing) => (
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

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <FiSave className="mr-2 h-4 w-4" />
              Save Recipe
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
