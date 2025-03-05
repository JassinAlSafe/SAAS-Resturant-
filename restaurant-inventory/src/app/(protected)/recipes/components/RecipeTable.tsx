"use client";

import { useState } from "react";
import { Dish, Ingredient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/currency-context";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FiEdit2,
  FiTrash2,
  FiList,
  FiCopy,
  FiEye,
  FiAlertTriangle,
  FiStar,
  FiDollarSign,
} from "react-icons/fi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

interface RecipeTableProps {
  recipes: Dish[];
  ingredients?: Ingredient[];
  onEditClick: (recipe: Dish) => void;
  onDeleteClick: (recipe: Dish) => void;
  onViewIngredientsClick?: (recipe: Dish) => void;
  onDuplicateClick?: (recipe: Dish) => void;
  onBulkAction?: (action: string, recipes: Dish[]) => void;
}

export default function RecipeTable({
  recipes,
  ingredients = [],
  onEditClick,
  onDeleteClick,
  onViewIngredientsClick,
  onDuplicateClick,
  onBulkAction,
}: RecipeTableProps) {
  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // State for bulk selection
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(
    new Set()
  );
  const [showIngredientsFor, setShowIngredientsFor] = useState<string | null>(
    null
  );

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRecipes.size === recipes.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(recipes.map((recipe) => recipe.id)));
    }
  };

  // Handle select recipe
  const handleSelectRecipe = (recipeId: string) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId);
    } else {
      newSelected.add(recipeId);
    }
    setSelectedRecipes(newSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (onBulkAction && selectedRecipes.size > 0) {
      const selectedRecipesList = recipes.filter((recipe) =>
        selectedRecipes.has(recipe.id)
      );
      onBulkAction("delete", selectedRecipesList);
      setSelectedRecipes(new Set());
    }
  };

  // Handle bulk export
  const handleBulkExport = () => {
    if (onBulkAction && selectedRecipes.size > 0) {
      const selectedRecipesList = recipes.filter((recipe) =>
        selectedRecipes.has(recipe.id)
      );
      onBulkAction("export", selectedRecipesList);
    }
  };

  // Calculate profit margin
  const calculateProfitMargin = (price: number, foodCost: number = 0) => {
    if (foodCost <= 0) return null;
    const margin = ((price - foodCost) / price) * 100;
    return margin.toFixed(1) + "%";
  };

  // Get ingredient name by ID
  const getIngredientName = (ingredientId: string) => {
    const ingredient = ingredients.find((ing) => ing.id === ingredientId);
    return ingredient ? ingredient.name : "Unknown Ingredient";
  };

  // Render allergen badges
  const renderAllergens = (allergens: string[] | null = []) => {
    if (!allergens || !allergens.length)
      return <span className="text-gray-400">None</span>;

    return (
      <div className="flex flex-wrap gap-1">
        {allergens.map((allergen) => (
          <Badge
            key={allergen}
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 text-xs"
          >
            {allergen}
          </Badge>
        ))}
      </div>
    );
  };

  // Render popularity stars
  const renderPopularity = (popularity: number = 0) => {
    const stars = [];
    const maxStars = 5;
    const filledStars = Math.round(popularity * maxStars);

    for (let i = 0; i < maxStars; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`h-4 w-4 ${
            i < filledStars
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300"
          }`}
        />
      );
    }

    return <div className="flex">{stars}</div>;
  };

  return (
    <div>
      {/* Bulk actions */}
      {selectedRecipes.size > 0 && onBulkAction && (
        <div className="flex items-center justify-between gap-3 p-4 mb-6 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-blue-700">
            {selectedRecipes.size} recipe{selectedRecipes.size > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
              className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
            >
              Export Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="bg-white hover:bg-red-50 border-red-200 text-red-700"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              {onBulkAction && (
                <TableHead className="w-[50px] py-3">
                  <CustomCheckbox
                    checked={
                      selectedRecipes.size === recipes.length &&
                      recipes.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    disabled={recipes.length === 0}
                  />
                </TableHead>
              )}
              <TableHead className="min-w-[200px] py-3 font-semibold text-gray-700">
                Recipe
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">
                Category
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">
                Price
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">
                Food Cost
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">
                Margin
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">
                Ingredients
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">
                Allergens
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">
                Popularity
              </TableHead>
              <TableHead className="py-3 text-right font-semibold text-gray-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={onBulkAction ? 10 : 9}
                  className="text-center py-12 text-muted-foreground"
                >
                  No recipes found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              recipes.map((recipe) => (
                <TableRow
                  key={recipe.id}
                  className="group border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                >
                  {onBulkAction && (
                    <TableCell className="py-4">
                      <CustomCheckbox
                        checked={selectedRecipes.has(recipe.id)}
                        onCheckedChange={() => handleSelectRecipe(recipe.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      {recipe.imageUrl ? (
                        <div className="relative h-12 w-12 rounded-md overflow-hidden shadow-sm">
                          <Image
                            src={recipe.imageUrl}
                            alt={recipe.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 shadow-sm">
                          <FiList className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {recipe.name}
                        </div>
                        {recipe.description && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px] mt-1">
                            {recipe.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {recipe.category ? (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 px-2.5 py-1"
                      >
                        {recipe.category}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Uncategorized
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 font-medium text-gray-900">
                    {formatCurrency(recipe.price)}
                  </TableCell>
                  <TableCell className="py-4">
                    {recipe.foodCost ? (
                      <span className="text-gray-700">
                        {formatCurrency(recipe.foodCost)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">
                        Not calculated
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    {recipe.foodCost ? (
                      <Badge
                        variant="outline"
                        className={`px-2.5 py-1 ${
                          (recipe.price - recipe.foodCost) / recipe.price > 0.3
                            ? "bg-green-50 text-green-700 border-green-200"
                            : (recipe.price - recipe.foodCost) / recipe.price >
                              0.15
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {calculateProfitMargin(recipe.price, recipe.foodCost)}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 rounded-full"
                          onClick={() => setShowIngredientsFor(recipe.id)}
                        >
                          <span className="font-medium mr-1">
                            {recipe.ingredients.length}
                          </span>
                          <span className="text-xs">View</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            Ingredients for {recipe.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto py-4">
                          {recipe.ingredients.length === 0 ? (
                            <p className="text-gray-500">
                              No ingredients added to this recipe.
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {recipe.ingredients.map((ingredient) => (
                                <li
                                  key={ingredient.ingredientId}
                                  className="flex justify-between items-center p-3 rounded-md border border-gray-100 hover:bg-gray-50"
                                >
                                  <span className="font-medium">
                                    {getIngredientName(ingredient.ingredientId)}
                                  </span>
                                  <span className="text-gray-600">
                                    {ingredient.quantity} units
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="py-4">
                    {renderAllergens(recipe.allergens)}
                  </TableCell>
                  <TableCell className="py-4">
                    {renderPopularity(recipe.popularity)}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-100 rounded-full"
                              onClick={() =>
                                onViewIngredientsClick &&
                                onViewIngredientsClick(recipe)
                              }
                            >
                              <FiEye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View recipe details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-100 rounded-full"
                              onClick={() => onEditClick(recipe)}
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit recipe</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {onDuplicateClick && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:bg-green-100 rounded-full"
                                onClick={() => onDuplicateClick(recipe)}
                              >
                                <FiCopy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Duplicate recipe</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-100 rounded-full"
                              onClick={() => onDeleteClick(recipe)}
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete recipe</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
