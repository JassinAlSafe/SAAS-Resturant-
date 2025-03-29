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
  Eye,
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
  showArchived?: boolean;
  onAction?: (
    recipe: Dish,
    action: "view" | "edit" | "delete" | "archive"
  ) => void;
  onUnarchive?: (id: string) => Promise<void>;
  isLoading?: boolean;
  onRowClick?: (recipe: Dish) => void;
}

export default function RecipeTableNew({
  recipes,
  showArchived = false,
  onAction,
  onUnarchive,
  isLoading = false,
  onRowClick,
}: RecipeTableProps) {
  const { formatCurrency } = useCurrency();
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Function to get the color based on the popularity percentage
  const getPopularityColor = (popularity?: number) => {
    if (!popularity) return "bg-neutral-100";
    if (popularity < 30) return "bg-red-100";
    if (popularity < 70) return "bg-amber-100";
    return "bg-green-100";
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-800"></div>
          <p className="text-neutral-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-neutral-100 mb-4 p-4 rounded-full">
            <Utensils className="h-8 w-8 text-neutral-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-neutral-900">
            {showArchived ? "No archived recipes found" : "No recipes found"}
          </h3>
          <p className="text-neutral-500 max-w-md">
            {showArchived
              ? "You don't have any archived recipes yet."
              : "Add your first recipe to get started with your menu."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow className="border-b border-neutral-200">
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-600 font-medium">
              Name
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-600 font-medium">
              Price
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-600 font-medium">
              Category
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-600 font-medium">
              Popularity
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-600 font-medium">
              Status
            </TableHead>
            <TableHead className="py-4 text-xs uppercase tracking-wider text-neutral-600 font-medium text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.map((recipe) => (
            <React.Fragment key={recipe.id}>
              <TableRow
                className="hover:bg-neutral-50 cursor-pointer border-b border-neutral-200 transition-colors"
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
                          className="h-6 w-6 text-neutral-500"
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
                  <span className="font-medium text-neutral-800">
                    {formatCurrency(recipe.price)}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700">
                    {recipe.category || "General"}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 ${getPopularityColor(
                          recipe.popularity
                        )}`}
                        style={{
                          width: `${recipe.popularity || 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-neutral-600">
                      {recipe.popularity ? `${recipe.popularity}%` : "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {recipe.isArchived ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700">
                      <Archive className="h-3 w-3 mr-1" />
                      Archived
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                      <Star className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex items-center justify-end space-x-1">
                    {showArchived ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnarchive?.(recipe.id);
                        }}
                        className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                        title="Unarchive"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction?.(recipe, "view");
                          }}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction?.(recipe, "edit");
                          }}
                          className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction?.(recipe, "delete");
                          }}
                          className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction?.(recipe, "archive");
                          }}
                          className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {expandedRecipeId === recipe.id && !onRowClick && (
                <TableRow className="bg-neutral-50 border-b border-neutral-200">
                  <TableCell colSpan={6} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-neutral-900">
                          Recipe Details
                        </h3>
                        <div className="bg-white p-4 rounded-md border border-neutral-200">
                          <dl className="grid grid-cols-2 gap-4">
                            <div>
                              <dt className="text-xs text-neutral-500">
                                Food Cost
                              </dt>
                              <dd className="text-sm font-medium text-neutral-800">
                                {recipe.foodCost
                                  ? formatCurrency(recipe.foodCost)
                                  : "Not set"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-neutral-500">
                                Profit Margin
                              </dt>
                              <dd className="text-sm font-medium text-neutral-800">
                                {recipe.foodCost && recipe.price
                                  ? `${Math.round(
                                      ((recipe.price - recipe.foodCost) /
                                        recipe.price) *
                                        100
                                    )}%`
                                  : "Not set"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-neutral-500">
                                Preparation Time
                              </dt>
                              <dd className="text-sm font-medium text-neutral-800">
                                {recipe.preparationTime
                                  ? `${recipe.preparationTime} min`
                                  : "Not set"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-neutral-500">
                                Serving Size
                              </dt>
                              <dd className="text-sm font-medium text-neutral-800">
                                {recipe.servingSize
                                  ? `${recipe.servingSize} servings`
                                  : "Not set"}
                              </dd>
                            </div>
                          </dl>

                          {recipe.instructions && (
                            <div className="mt-4 pt-3 border-t border-neutral-100">
                              <dt className="text-xs text-neutral-500 mb-1">
                                Cooking Instructions
                              </dt>
                              <dd className="text-sm text-neutral-700">
                                {recipe.instructions.length > 100
                                  ? `${recipe.instructions.substring(
                                      0,
                                      100
                                    )}...`
                                  : recipe.instructions}
                              </dd>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-neutral-900">
                          Ingredients
                        </h3>
                        {recipe.ingredients && recipe.ingredients.length > 0 ? (
                          <div className="bg-white p-4 rounded-md border border-neutral-200">
                            <ul className="space-y-2">
                              {recipe.ingredients.map((ingredient, index) => (
                                <li
                                  key={index}
                                  className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded"
                                >
                                  <span className="text-sm font-medium text-neutral-700">
                                    {ingredient.ingredientId}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-neutral-600 font-medium">
                                      {ingredient.quantity}
                                    </span>
                                    <span className="text-xs text-neutral-500">
                                      {ingredient.unit || "units"}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>

                            {/* Show relationship data details */}
                            <div className="mt-4 pt-3 border-t border-neutral-100">
                              <p className="text-xs text-neutral-500">
                                <span className="font-semibold">
                                  Recipe-Dish Relationship:
                                </span>{" "}
                                This recipe has full relational features enabled
                                via its dish_id connection.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-md border border-neutral-200">
                            <div className="text-center py-4">
                              <span className="text-sm text-neutral-500">
                                No ingredients listed
                              </span>
                              <p className="text-xs text-neutral-400 mt-1">
                                This recipe exists in the recipes table but
                                doesn&apos;t have a corresponding dish record
                                yet.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
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
