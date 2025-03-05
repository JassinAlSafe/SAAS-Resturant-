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

// Common food allergens
const COMMON_ALLERGENS = [
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
}

export default function RecipeForm({
  dish,
  ingredients,
  onSave,
  onCancel,
}: RecipeFormProps) {
  const [name, setName] = useState(dish?.name || "");
  const [description, setDescription] = useState(dish?.description || "");
  const [price, setPrice] = useState(dish?.price.toString() || "");
  const [foodCost, setFoodCost] = useState(dish?.foodCost?.toString() || "");
  const [category, setCategory] = useState(dish?.category || "");
  const [allergens, setAllergens] = useState<string[]>(dish?.allergens || []);
  const [popularity, setPopularity] = useState<number>(dish?.popularity || 0);
  const [imageUrl, setImageUrl] = useState(dish?.imageUrl || "");
  const [recipeIngredients, setRecipeIngredients] = useState<DishIngredient[]>(
    dish?.ingredients || []
  );
  const [activeTab, setActiveTab] = useState("basic");

  // Get currency from context
  const { currency } = useCurrency();

  // Calculate profit margin
  const calculateProfitMargin = () => {
    const priceValue = parseFloat(price);
    const costValue = parseFloat(foodCost);

    if (
      isNaN(priceValue) ||
      isNaN(costValue) ||
      costValue <= 0 ||
      priceValue <= 0
    ) {
      return null;
    }

    const margin = ((priceValue - costValue) / priceValue) * 100;
    return margin.toFixed(1) + "%";
  };

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

  // Function to toggle an allergen
  const toggleAllergen = (allergen: string) => {
    if (allergens.includes(allergen)) {
      setAllergens(allergens.filter((a) => a !== allergen));
    } else {
      setAllergens([...allergens, allergen]);
    }
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name || !price) {
      alert("Please fill in all required fields.");
      return;
    }

    // Create dish object
    const updatedDish: Dish = {
      id: dish?.id || `temp-${Date.now()}`, // In a real app, this would be handled by the backend
      name,
      description,
      price: parseFloat(price),
      foodCost: foodCost ? parseFloat(foodCost) : undefined,
      category: category || undefined,
      allergens: allergens.length > 0 ? allergens : undefined,
      popularity,
      imageUrl: imageUrl || undefined,
      ingredients: recipeIngredients,
      createdAt: dish?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    <Card className="p-0 border-0 shadow-none">
      <form onSubmit={handleSubmit}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-50 rounded-lg">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="ingredients"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md"
            >
              Ingredients
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md"
            >
              Additional Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  Dish Name <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter dish name"
                  required
                  className="border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-gray-200 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECIPE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description of the dish"
                  rows={3}
                  className="border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  Price ({currency.symbol}){" "}
                  <span className="text-red-500 ml-1">*</span>
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
                  className="border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="foodCost"
                  className="text-sm font-medium text-gray-700"
                >
                  Food Cost ({currency.symbol})
                </label>
                <Input
                  id="foodCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={foodCost}
                  onChange={(e) => setFoodCost(e.target.value)}
                  placeholder="0.00"
                  className="border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                {price &&
                  foodCost &&
                  parseFloat(price) > 0 &&
                  parseFloat(foodCost) > 0 && (
                    <div className="text-sm mt-2 p-2 rounded-md bg-gray-50">
                      <span className="text-gray-600">Profit Margin: </span>
                      <span
                        className={`font-medium ${
                          parseFloat(calculateProfitMargin() || "0") > 30
                            ? "text-green-600"
                            : parseFloat(calculateProfitMargin() || "0") > 15
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {calculateProfitMargin()}
                      </span>
                    </div>
                  )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="imageUrl"
                  className="text-sm font-medium text-gray-700"
                >
                  Image URL
                </label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Popularity
                </label>
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

          <TabsContent value="ingredients" className="space-y-4 p-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">Ingredients</h3>
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

            <div className="border border-gray-100 rounded-lg shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="py-3 font-semibold text-gray-700">
                      Ingredient
                    </TableHead>
                    <TableHead className="py-3 font-semibold text-gray-700">
                      Quantity
                    </TableHead>
                    <TableHead className="py-3 font-semibold text-gray-700">
                      Unit
                    </TableHead>
                    <TableHead className="py-3 font-semibold text-gray-700 w-20">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipeIngredients.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        No ingredients added yet. Click &quot;Add
                        Ingredient&quot; to start.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recipeIngredients.map((recipeIngredient, index) => {
                      const ingredient = ingredients.find(
                        (ing) => ing.id === recipeIngredient.ingredientId
                      );

                      return (
                        <TableRow
                          key={index}
                          className="border-b border-gray-100"
                        >
                          <TableCell className="py-4">
                            <Select
                              value={recipeIngredient.ingredientId}
                              onValueChange={(value) =>
                                updateIngredientId(index, value)
                              }
                            >
                              <SelectTrigger className="border-gray-200 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
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
                          <TableCell className="py-4">
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
                          <TableCell className="py-4">
                            {ingredient?.unit || ""}
                          </TableCell>
                          <TableCell className="py-4">
                            <Button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-100 rounded-full"
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
          </TabsContent>

          <TabsContent value="details" className="space-y-6 p-1">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Allergens
              </label>
              <div className="flex flex-wrap gap-2 p-4 border border-gray-100 rounded-lg bg-gray-50">
                {COMMON_ALLERGENS.map((allergen) => (
                  <Badge
                    key={allergen}
                    variant={
                      allergens.includes(allergen) ? "default" : "outline"
                    }
                    className={`cursor-pointer px-3 py-1 ${
                      allergens.includes(allergen)
                        ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                        : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                    }`}
                    onClick={() => toggleAllergen(allergen)}
                  >
                    {allergen}
                    {allergens.includes(allergen) && (
                      <FiX className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-100">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <FiSave className="mr-2 h-4 w-4" />
            Save Recipe
          </Button>
        </div>
      </form>
    </Card>
  );
}
