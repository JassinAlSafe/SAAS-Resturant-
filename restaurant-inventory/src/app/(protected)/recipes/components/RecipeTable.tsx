"use client";

import { Dish } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiEdit2, FiTrash2, FiList } from "react-icons/fi";

interface RecipeTableProps {
  recipes: Dish[];
  onEditClick: (recipe: Dish) => void;
  onDeleteClick: (recipe: Dish) => void;
  onViewIngredientsClick?: (recipe: Dish) => void;
}

export default function RecipeTable({
  recipes,
  onEditClick,
  onDeleteClick,
  onViewIngredientsClick,
}: RecipeTableProps) {
  // Get currency formatter
  const { formatCurrency } = useCurrency();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipe Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Ingredients Count</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-8 text-muted-foreground"
              >
                No recipes found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell className="font-medium">{recipe.name}</TableCell>
                <TableCell>{formatCurrency(recipe.price)}</TableCell>
                <TableCell>{recipe.ingredients.length}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    {onViewIngredientsClick && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600"
                        onClick={() => onViewIngredientsClick(recipe)}
                        title="View ingredients"
                      >
                        <FiList className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600"
                      onClick={() => onEditClick(recipe)}
                      title="Edit recipe"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => onDeleteClick(recipe)}
                      title="Delete recipe"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
