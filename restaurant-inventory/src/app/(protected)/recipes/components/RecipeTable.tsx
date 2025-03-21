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
import { FiEdit2, FiTrash2, FiCopy, FiArchive, FiList, FiMoreHorizontal } from "react-icons/fi";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

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

  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={tableVariants}
      className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-950"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
            <TableHead className="w-[300px] bg-slate-50/50 dark:bg-slate-900/30 font-medium text-slate-600 dark:text-slate-400 text-sm">
              Recipe Name
            </TableHead>
            <TableHead className="bg-slate-50/50 dark:bg-slate-900/30 font-medium text-slate-600 dark:text-slate-400 text-sm">
              Category
            </TableHead>
            <TableHead className="bg-slate-50/50 dark:bg-slate-900/30 font-medium text-slate-600 dark:text-slate-400 text-sm">
              Price
            </TableHead>
            <TableHead className="bg-slate-50/50 dark:bg-slate-900/30 font-medium text-slate-600 dark:text-slate-400 text-sm">
              Food Cost
            </TableHead>
            <TableHead className="bg-slate-50/50 dark:bg-slate-900/30 font-medium text-slate-600 dark:text-slate-400 text-sm">
              Margin
            </TableHead>
            <TableHead className="bg-slate-50/50 dark:bg-slate-900/30 font-medium text-slate-600 dark:text-slate-400 text-sm">
              Allergens
            </TableHead>
            <TableHead className="w-10 bg-slate-50/50 dark:bg-slate-900/30 font-medium text-slate-600 dark:text-slate-400 text-sm text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecipes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <FiList className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                    {showArchivedRecipes
                      ? "No archived recipes found"
                      : "No recipes found"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
                <motion.tr
                  key={recipe.id}
                  variants={rowVariants}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors border-slate-200 dark:border-slate-800"
                >
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-slate-200">
                        {recipe.name}
                      </span>
                      {recipe.description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px] mt-0.5">
                          {recipe.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {recipe.category ? (
                      <Badge
                        variant="secondary"
                        className="font-normal text-xs bg-slate-100/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-0 px-2 py-0.5"
                      >
                        {recipe.category}
                      </Badge>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                    {formatCurrency(recipe.price)}
                  </TableCell>
                  <TableCell>
                    {recipe.foodCost ? (
                      <span className="text-slate-600 dark:text-slate-400 text-sm">
                        {formatCurrency(recipe.foodCost)}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
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
                        className={`font-normal text-xs px-2 py-0.5 ${
                          parseFloat(margin) > 30
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-0"
                            : parseFloat(margin) > 15
                            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-0"
                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-0"
                        }`}
                      >
                        {margin}
                      </Badge>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {recipe.allergies && recipe.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {recipe.allergies.length <= 2 ? (
                          recipe.allergies.map((allergen) => (
                            <Badge
                              key={allergen}
                              variant="outline"
                              className="font-normal text-xs bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0"
                            >
                              {allergen}
                            </Badge>
                          ))
                        ) : (
                          <>
                            <Badge
                              variant="outline"
                              className="font-normal text-xs bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0"
                            >
                              {recipe.allergies[0]}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="font-normal text-xs bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0 cursor-default"
                                  >
                                    +{recipe.allergies.length - 1}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex flex-col gap-1">
                                    {recipe.allergies.slice(1).map((allergen) => (
                                      <span key={allergen} className="text-xs">
                                        {allergen}
                                      </span>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="p-0 pr-2">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                          >
                            <FiMoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => onEdit(recipe)}
                            className="cursor-pointer"
                          >
                            <FiEdit2 className="h-4 w-4 mr-2" />
                            <span>Edit recipe</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDuplicate(recipe)}
                            className="cursor-pointer"
                          >
                            <FiCopy className="h-4 w-4 mr-2" />
                            <span>Duplicate recipe</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onArchive(recipe)}
                            className="cursor-pointer"
                          >
                            <FiArchive className="h-4 w-4 mr-2" />
                            <span>{recipe.isArchived ? "Unarchive" : "Archive"} recipe</span>
                          </DropdownMenuItem>
                          {!recipe.isArchived && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(recipe)}
                                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                              >
                                <FiTrash2 className="h-4 w-4 mr-2" />
                                <span>Delete recipe</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
}
