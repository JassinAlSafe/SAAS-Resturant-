"use client";

import { useState, useEffect } from "react";
import { Dish, Ingredient, DishIngredient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

// Common food allergies
const COMMON_ALLERGIES = [
  "Dairy",
  "Eggs",
  "Peanuts",
  "Tree Nuts",
  "Fish",
  "Shellfish",
  "Wheat",
  "Soy",
  "Sesame",
  "Gluten",
];

// Recipe categories
const RECIPE_CATEGORIES = [
  "Appetizer",
  "Main Course",
  "Dessert",
  "Beverage",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Salad",
  "Soup",
  "Side Dish",
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
];

interface RecipeFormProps {
  dish?: Dish;
  ingredients: Ingredient[];
  onSave: (dish: Dish) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function RecipeForm({
  dish,
  ingredients = [],
  onSave,
  onCancel,
  isLoading = false,
}: RecipeFormProps) {
  const [name, setName] = useState(dish?.name || "");
  const [description, setDescription] = useState(dish?.description || "");
  const [price, setPrice] = useState(dish?.price?.toString() || "");
  const [foodCost, setFoodCost] = useState(dish?.foodCost?.toString() || "");
  const [category, setCategory] = useState<string>(dish?.category || "");
  const [allergies, setAllergies] = useState<string[]>(dish?.allergies || []);
  const [popularity, setPopularity] = useState<number>(dish?.popularity || 0);
  const [recipeIngredients, setRecipeIngredients] = useState<DishIngredient[]>(
    dish?.ingredients || []
  );
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Get currency from context
  const { currency } = useCurrency();

  // Format currency display
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "0,00 kr";
    return `${numValue.toFixed(2).replace(".", ",")} kr`;
  };

  // Calculate profit margin
  const calculateProfitMargin = () => {
    if (!price || !foodCost) return "0%";

    const priceValue = parseFloat(price);
    const costValue = parseFloat(foodCost);

    if (
      isNaN(priceValue) ||
      isNaN(costValue) ||
      costValue <= 0 ||
      priceValue <= 0
    ) {
      return "0%";
    }

    const margin = ((priceValue - costValue) / priceValue) * 100;
    return margin.toFixed(1) + "%";
  };

  // Function to add a new ingredient to the recipe
  const addIngredient = () => {
    if (!ingredients || ingredients.length === 0) return;

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
    if (index < 0 || index >= recipeIngredients.length) return;

    const updatedIngredients = [...recipeIngredients];
    updatedIngredients[index].ingredientId = ingredientId;
    setRecipeIngredients(updatedIngredients);
  };

  // Function to toggle an allergy
  const toggleAllergy = (allergy: string) => {
    if (!allergy) return;

    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter((a) => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      alert("Please fill in all required fields.");
      return;
    }

    const priceValue = parseFloat(price) || 0;
    const foodCostValue = foodCost ? parseFloat(foodCost) : undefined;

    const updatedDish: Dish = {
      id: dish?.id || `temp-${Date.now()}`,
      name,
      description,
      price: priceValue,
      foodCost: foodCostValue,
      category: category || undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
      popularity,
      ingredients: recipeIngredients,
      createdAt: dish?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: dish?.isArchived || false,
    };

    onSave(updatedDish);
  };

  // Calculate total food cost based on ingredients
  useEffect(() => {
    // This would be more accurate with actual ingredient costs
    // For now, we'll just set it to a percentage of the price for demonstration
    if (price && !foodCost) {
      const estimatedCost = parseFloat(price) * 0.4; // 40% of price as default
      setFoodCost(estimatedCost.toFixed(2));
    }
  }, [price, foodCost]);

  return (
    <form onSubmit={handleSubmit} className="h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full flex flex-col"
      >
        <div className="border-b bg-gray-50/80">
          <div className="px-6">
            <TabsList className="w-full h-14 bg-transparent gap-8 p-0">
              <TabsTrigger
                value="basic"
                className="relative h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-2 pb-4 pt-3 font-medium text-gray-500 data-[state=active]:text-blue-600 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] data-[state=active]:before:bg-blue-600"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="ingredients"
                className="relative h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-2 pb-4 pt-3 font-medium text-gray-500 data-[state=active]:text-blue-600 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] data-[state=active]:before:bg-blue-600"
              >
                Ingredients
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="relative h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-2 pb-4 pt-3 font-medium text-gray-500 data-[state=active]:text-blue-600 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] data-[state=active]:before:bg-blue-600"
              >
                Additional Details
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-6">
            <TabsContent value="basic" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Dish Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter dish name"
                    required
                    className="border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <Select
                    value={category || "none"}
                    onValueChange={(value) =>
                      setCategory(value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger className="border-gray-200 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {RECIPE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Textarea
                    value={description || ""}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description of the dish"
                    rows={3}
                    className="border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Price <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0,00"
                      required
                      className="pr-12 border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      kr
                    </span>
                  </div>
                  {price && (
                    <p className="text-sm text-gray-500">
                      {formatCurrency(price)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Food Cost
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={foodCost}
                      onChange={(e) => setFoodCost(e.target.value)}
                      placeholder="0,00"
                      className="pr-12 border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      kr
                    </span>
                  </div>
                  {foodCost && (
                    <p className="text-sm text-gray-500">
                      {formatCurrency(foodCost)}
                    </p>
                  )}
                  {price && foodCost && (
                    <p className="text-sm text-gray-500 mt-1">
                      Profit Margin: {calculateProfitMargin()}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingredients" className="m-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      Recipe Ingredients
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add ingredients and specify their quantities
                    </p>
                  </div>
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

                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50/80">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-medium">
                          Ingredient
                        </TableHead>
                        <TableHead className="font-medium">Quantity</TableHead>
                        <TableHead className="font-medium">Unit</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipeIngredients.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="h-24 text-center text-gray-500"
                          >
                            No ingredients added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        recipeIngredients.map((recipeIngredient, index) => {
                          const ingredient = ingredients.find(
                            (i) => i.id === recipeIngredient.ingredientId
                          );

                          return (
                            <TableRow
                              key={`${recipeIngredient.ingredientId}-${index}`}
                              className="hover:bg-gray-50/50"
                            >
                              <TableCell className="font-medium">
                                <Select
                                  value={recipeIngredient.ingredientId}
                                  onValueChange={(value) =>
                                    updateIngredientId(index, value)
                                  }
                                >
                                  <SelectTrigger className="border-gray-200 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                    <SelectValue>
                                      {ingredient?.name || "Select ingredient"}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ingredients
                                      .filter(
                                        (ing) =>
                                          ing.id ===
                                            recipeIngredient.ingredientId ||
                                          !recipeIngredients.some(
                                            (ri) => ri.ingredientId === ing.id
                                          )
                                      )
                                      .map((ing) => (
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
                                  className="w-24 border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                              </TableCell>
                              <TableCell className="text-gray-500">
                                {ingredient?.unit || ""}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  onClick={() => removeIngredient(index)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:bg-red-50"
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
            </TabsContent>

            <TabsContent value="details" className="m-0">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Allergies
                    </label>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Select all allergies present in this dish
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_ALLERGIES.map((allergy) => (
                      <Badge
                        key={allergy}
                        variant={
                          allergies.includes(allergy) ? "default" : "outline"
                        }
                        className="cursor-pointer transition-colors hover:bg-gray-100"
                        onClick={() => toggleAllergy(allergy)}
                      >
                        {allergy}
                        {allergies.includes(allergy) && (
                          <FiX className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Popularity
                    </label>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Set the popularity level of this dish
                    </p>
                  </div>
                  <div className="pt-2">
                    <Slider
                      value={[popularity]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => setPopularity(value[0])}
                      className="py-1"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50/80">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="text-gray-700"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Recipe"}
          </Button>
        </div>
      </Tabs>
    </form>
  );
}
