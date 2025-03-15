"use client";

import { Dish } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FiEdit2, FiTrash2, FiCopy, FiArchive, FiList } from "react-icons/fi";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useCurrency } from "@/lib/currency";

interface RecipeTableProps {
  recipes: Dish[];
  showArchivedRecipes?: boolean;
  onEdit: (recipe: Dish) => void;
  onDelete: (recipe: Dish) => void;
  onDuplicate: (recipe: Dish) => void;
  onArchive: (recipe: Dish) => void;
}

export default function RecipeTable({
  recipes,
  showArchivedRecipes = false,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
}: RecipeTableProps) {
  const { formatCurrency } = useCurrency();

  // Calculate profit margin
  const calculateProfitMargin = (price: number, foodCost: number = 0) => {
    if (!price || !foodCost || foodCost <= 0) return null;
    const margin = ((price - foodCost) / price) * 100;
    return margin.toFixed(1) + "%";
  };

  // Filter recipes based on archive status
  const filteredRecipes = recipes.filter(
    (recipe) => recipe.isArchived === showArchivedRecipes
  );

  return (
    <div className="rounded-lg border border-gray-100 shadow-xs overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-gray-100">
            <TableHead className="w-[300px] bg-gray-50/50 font-medium">
              Recipe Name
            </TableHead>
            <TableHead className="bg-gray-50/50 font-medium">
              Category
            </TableHead>
            <TableHead className="bg-gray-50/50 font-medium">Price</TableHead>
            <TableHead className="bg-gray-50/50 font-medium">
              Food Cost
            </TableHead>
            <TableHead className="bg-gray-50/50 font-medium">Margin</TableHead>
            <TableHead className="bg-gray-50/50 font-medium">
              Allergens
            </TableHead>
            <TableHead className="bg-gray-50/50 font-medium text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecipes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <FiList className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {showArchivedRecipes
                      ? "No archived recipes found"
                      : "No recipes found"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {showArchivedRecipes
                      ? "Archive a recipe to see it here"
                      : "Add a new recipe to get started"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredRecipes.map((recipe) => {
              const margin = calculateProfitMargin(
                recipe.price,
                recipe.foodCost
              );

              return (
                <TableRow
                  key={recipe.id}
                  className="group hover:bg-gray-50/50 transition-colors border-gray-100"
                >
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {recipe.name}
                      </span>
                      {recipe.description && (
                        <span className="text-sm text-gray-500 truncate max-w-[280px] mt-0.5">
                          {recipe.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {recipe.category ? (
                      <Badge
                        variant="secondary"
                        className="font-normal bg-gray-100 text-gray-700 border-0"
                      >
                        {recipe.category}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(recipe.price)}
                  </TableCell>
                  <TableCell>
                    {recipe.foodCost ? (
                      <span className="text-gray-600">
                        {formatCurrency(recipe.foodCost)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {margin ? (
                      <Badge
                        variant={
                          parseFloat(margin) > 30
                            ? "default"
                            : parseFloat(margin) > 15
                            ? "warning"
                            : "destructive"
                        }
                        className="font-normal"
                      >
                        {margin}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {recipe.allergies && recipe.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {recipe.allergies.map((allergen) => (
                          <Badge
                            key={allergen}
                            variant="outline"
                            className="font-normal text-xs bg-transparent"
                          >
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-900"
                              onClick={() => onEdit(recipe)}
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit recipe</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-900"
                              onClick={() => onDuplicate(recipe)}
                            >
                              <FiCopy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate recipe</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-900"
                              onClick={() => onArchive(recipe)}
                            >
                              <FiArchive className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {recipe.isArchived ? "Unarchive" : "Archive"} recipe
                          </TooltipContent>
                        </Tooltip>

                        {!recipe.isArchived && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onDelete(recipe)}
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete recipe</TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
