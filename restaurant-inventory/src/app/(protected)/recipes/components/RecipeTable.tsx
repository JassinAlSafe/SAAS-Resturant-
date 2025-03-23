"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/lib/currency";
import { Dish } from "@/lib/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Copy, Archive, ArchiveRestore, Trash2 } from "lucide-react";

interface RecipeTableProps {
  recipes: Dish[];
  showArchivedRecipes?: boolean;
  onEdit?: (recipe: Dish) => void;
  onDelete?: (recipe: Dish) => void;
  onDuplicate?: (recipe: Dish) => void;
  onArchive?: (recipe: Dish) => Promise<void>;
}

export default function RecipeTable({
  recipes,
  showArchivedRecipes = false,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
}: RecipeTableProps) {
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { formatCurrency } = useCurrency();
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(recipes.length / itemsPerPage);
  
  // Filter recipes based on archived status
  const filteredRecipes = recipes.filter(
    (recipe) => recipe.isArchived === showArchivedRecipes
  );
  
  // Calculate paginated recipes
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);
  
  // Handle select all recipes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecipes(paginatedRecipes.map((recipe) => recipe.id));
    } else {
      setSelectedRecipes([]);
    }
  };
  
  // Handle select single recipe
  const handleSelectRecipe = (recipeId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipes([...selectedRecipes, recipeId]);
    } else {
      setSelectedRecipes(selectedRecipes.filter((id) => id !== recipeId));
    }
  };
  
  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Logic to show limited pagination items with ellipsis
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Complex pagination with ellipsis
      if (currentPage <= 3) {
        // Near start
        for (let i = 1; i <= 4; i++) {
          items.push(i);
        }
        items.push("ellipsis");
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end
        items.push(1);
        items.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        // Middle
        items.push(1);
        items.push("ellipsis");
        items.push(currentPage - 1);
        items.push(currentPage);
        items.push(currentPage + 1);
        items.push("ellipsis");
        items.push(totalPages);
      }
    }
    
    return items;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 dark:border-slate-700">
              <TableHead className="w-[50px] py-3">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={
                      paginatedRecipes.length > 0 &&
                      selectedRecipes.length === paginatedRecipes.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all recipes"
                    className="rounded-sm border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                </div>
              </TableHead>
              <TableHead className="min-w-[250px] py-3 font-medium">Recipe</TableHead>
              <TableHead className="w-[120px] py-3 font-medium">Price</TableHead>
              <TableHead className="w-[150px] py-3 font-medium">Category</TableHead>
              <TableHead className="w-[150px] py-3 font-medium">Popularity</TableHead>
              <TableHead className="w-[120px] py-3 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecipes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-500 dark:text-slate-400"
                >
                  No recipes found
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecipes.map((recipe) => (
                <TableRow 
                  key={recipe.id} 
                  className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedRecipes.includes(recipe.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRecipe(recipe.id, !!checked)
                        }
                        aria-label={`Select ${recipe.name}`}
                        className="rounded-sm border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {recipe.imageUrl ? (
                          <Image
                            src={recipe.imageUrl}
                            alt={recipe.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            No img
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {recipe.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          ID: {recipe.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-medium">
                      {formatCurrency(recipe.price)}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-medium">{recipe.category || "General"}</div>
                  </TableCell>
                  <TableCell className="py-4">
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
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(recipe)}
                        className="h-8 w-8"
                        title="Edit recipe"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDuplicate?.(recipe)}
                        className="h-8 w-8"
                        title="Duplicate recipe"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {showArchivedRecipes ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onArchive?.(recipe)}
                          className="h-8 w-8"
                          title="Restore recipe"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onArchive?.(recipe)}
                          className="h-8 w-8"
                          title="Archive recipe"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete?.(recipe)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete recipe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {filteredRecipes.length > 0 && (
        <div className="py-4 sm:px-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(endIndex, filteredRecipes.length)}
              </span>{" "}
              of <span className="font-medium">{filteredRecipes.length}</span>{" "}
              recipes
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Previous
              </button>
              
              {generatePaginationItems().map((item, index) => (
                <button
                  key={index}
                  onClick={() => typeof item === "number" && setCurrentPage(item)}
                  className={`px-3 py-1 rounded-md ${
                    item === currentPage
                      ? "bg-blue-500 text-white"
                      : item === "ellipsis"
                      ? "cursor-default"
                      : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  disabled={item === "ellipsis"}
                >
                  {item === "ellipsis" ? "..." : item}
                </button>
              ))}
              
              <button
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
