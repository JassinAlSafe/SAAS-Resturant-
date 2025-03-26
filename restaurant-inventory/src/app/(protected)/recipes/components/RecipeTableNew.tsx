"use client";

import React, { useState } from "react";
import { Dish } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import Image from "next/image";
import {
  Utensils,
  ChefHat,
  Star,
  Edit,
  Trash2,
  Archive,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface RecipeTableProps {
  recipes: Dish[];
  showArchivedRecipes?: boolean;
  onEdit?: (recipe: Dish) => void;
  onDelete?: (recipe: Dish) => void;
  onArchive?: (recipe: Dish) => Promise<void>;
  onRowClick?: (recipe: Dish) => void;
}

export default function RecipeTableNew({
  recipes,
  showArchivedRecipes = false,
  onEdit,
  onDelete,
  onArchive,
  onRowClick,
}: RecipeTableProps) {
  const { formatCurrency } = useCurrency();
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Empty state
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <Utensils className="h-16 w-16 text-neutral-300" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-neutral-900 mt-4">
          {showArchivedRecipes
            ? "No archived recipes found"
            : "No recipes found"}
        </h3>
        <p className="text-neutral-500 max-w-md mt-2">
          {showArchivedRecipes
            ? "You don't have any archived recipes. Archived recipes will appear here."
            : "Start creating recipes to build your menu."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
              Name
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
              Price
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
              Category
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
              Popularity
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
              Status
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.map((recipe) => (
            <React.Fragment key={recipe.id}>
              <TableRow
                className="hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 transition-colors"
                onClick={() => {
                  if (onRowClick) {
                    onRowClick(recipe);
                  } else {
                    setExpandedRecipeId(
                      expandedRecipeId === recipe.id ? null : recipe.id
                    );
                  }
                }}
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-neutral-100 rounded-md flex items-center justify-center">
                      {recipe.imageUrl ? (
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.name}
                          width={48}
                          height={48}
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <ChefHat
                          className="h-6 w-6 text-neutral-400"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-neutral-900 flex items-center gap-2">
                        {recipe.name}
                        {!onRowClick && (
                          <span className="text-neutral-400">
                            {expandedRecipeId === recipe.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                      {recipe.description && (
                        <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                          {recipe.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-medium text-orange-600">
                    {formatCurrency(recipe.price)}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                    {recipe.category || "General"}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1 w-32">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="text-neutral-500">Popularity</span>
                      </span>
                      <span className="font-medium text-neutral-800">
                        {recipe.popularity ? `${recipe.popularity}%` : "N/A"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(
                          recipe.popularity || 0
                        )}`}
                        style={{ width: `${recipe.popularity || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {recipe.isArchived ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Archived
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex items-center justify-end space-x-1">
                    {showArchivedRecipes ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive?.(recipe);
                        }}
                        className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Unarchive"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(recipe);
                          }}
                          className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(recipe);
                          }}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {expandedRecipeId === recipe.id && (
                <TableRow className="border-b border-neutral-100">
                  <TableCell colSpan={6} className="bg-neutral-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-md">
                        <h4 className="text-sm font-semibold text-neutral-900 mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-neutral-600">
                          {recipe.description || "No description available"}
                        </p>
                      </div>

                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div className="bg-white p-4 rounded-md">
                          <h4 className="text-sm font-semibold text-neutral-900 mb-2">
                            Ingredients
                          </h4>
                          <ul className="divide-y divide-neutral-100">
                            {recipe.ingredients.map((ingredient, index) => (
                              <li
                                key={index}
                                className="py-2 flex justify-between"
                              >
                                <span className="text-sm text-neutral-800">
                                  {ingredient.ingredientId}
                                </span>
                                <span className="text-sm text-neutral-500">
                                  {ingredient.quantity} {ingredient.unit || ""}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper function to get the right progress color based on value
function getProgressColor(value: number): string {
  if (value < 30) return "bg-red-500";
  if (value < 70) return "bg-amber-500";
  return "bg-green-500";
}
