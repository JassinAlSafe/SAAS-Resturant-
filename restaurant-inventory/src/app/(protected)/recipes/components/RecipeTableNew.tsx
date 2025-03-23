"use client";

import React from "react";
import { Dish } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import Image from "next/image";

interface RecipeTableProps {
  recipes: Dish[];
  showArchivedRecipes?: boolean;
  onEdit?: (recipe: Dish) => void;
  onDelete?: (recipe: Dish) => void;
  onDuplicate?: (recipe: Dish) => void;
  onArchive?: (recipe: Dish) => Promise<void>;
  onRowClick?: (recipe: Dish) => void;
}

export default function RecipeTableNew({
  recipes,
  showArchivedRecipes = false,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onRowClick,
}: RecipeTableProps) {
  const { formatCurrency } = useCurrency();
  
  // Filter recipes based on archived status
  const filteredRecipes = recipes.filter(
    (recipe) => recipe.isArchived === showArchivedRecipes
  );

  // Define columns for the DataTable
  const columns: Column<Dish>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
      cell: (recipe) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                No img
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{recipe.name}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {recipe.description?.substring(0, 30)}
              {recipe.description && recipe.description.length > 30 ? "..." : ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "price",
      sortable: true,
      cell: (recipe) => (
        <div className="font-medium">
          {formatCurrency(recipe.price)}
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (recipe) => (
        <div className="font-medium">{recipe.category || "General"}</div>
      ),
    },
    {
      id: "popularity",
      header: "Popularity",
      accessorKey: "popularity",
      sortable: true,
      cell: (recipe) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Popularity
            </span>
            <span className="text-xs font-medium">
              {recipe.popularity ? `${recipe.popularity}%` : 'N/A'}
            </span>
          </div>
          <Progress
            value={recipe.popularity || 0}
            className="h-2 bg-slate-200 dark:bg-slate-700"
          />
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      cell: (recipe) => (
        <div>
          {recipe.isArchived ? (
            <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
              Archived
            </Badge>
          ) : (
            <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-50">
              Active
            </Badge>
          )}
        </div>
      ),
    },
  ];

  // Define expanded content for each row
  const expandedContent = (recipe: Dish) => (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-1">Description</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {recipe.description || "No description available"}
        </p>
      </div>
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-1">Ingredients</h4>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.ingredientId} - {ingredient.quantity} {ingredient.unit || ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <DataTable
      data={filteredRecipes}
      columns={columns}
      keyField="id"
      expandable={true}
      expandedContent={expandedContent}
      selectable={true}
      onRowClick={onRowClick}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onArchive={onArchive}
      isArchived={showArchivedRecipes}
      emptyMessage={
        showArchivedRecipes
          ? "No archived recipes found"
          : "No recipes found"
      }
      className="w-full"
    />
  );
}
