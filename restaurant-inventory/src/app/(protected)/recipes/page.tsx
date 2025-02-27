"use client";

import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiChevronLeft,
} from "react-icons/fi";
import Card from "@/components/Card";
import RecipeForm from "@/components/RecipeForm";
import { Dish, Ingredient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RecipesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentDish, setCurrentDish] = useState<Dish | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  // Simulate fetching data from API
  useEffect(() => {
    // In a real app, this would be an API call to Supabase
    setTimeout(() => {
      setDishes([
        {
          id: "1",
          name: "Margherita Pizza",
          price: 12.99,
          ingredients: [
            { ingredientId: "1", quantity: 0.1 }, // Tomatoes
            { ingredientId: "3", quantity: 0.15 }, // Mozzarella
            { ingredientId: "5", quantity: 0.01 }, // Basil
            { ingredientId: "6", quantity: 0.2 }, // Flour
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Spaghetti Bolognese",
          price: 14.99,
          ingredients: [
            { ingredientId: "1", quantity: 0.1 }, // Tomatoes
            { ingredientId: "2", quantity: 0.15 }, // Chicken
            { ingredientId: "8", quantity: 0.05 }, // Onions
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Chicken Alfredo",
          price: 16.99,
          ingredients: [
            { ingredientId: "2", quantity: 0.2 }, // Chicken
            { ingredientId: "3", quantity: 0.1 }, // Mozzarella
            { ingredientId: "7", quantity: 1 }, // Eggs
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Caesar Salad",
          price: 9.99,
          ingredients: [
            { ingredientId: "2", quantity: 0.1 }, // Chicken
            { ingredientId: "5", quantity: 0.02 }, // Basil
            { ingredientId: "7", quantity: 1 }, // Eggs
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      setIngredients([
        {
          id: "1",
          name: "Tomatoes",
          category: "Produce",
          quantity: 2,
          unit: "kg",
          reorderLevel: 5,
          cost: 3.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Chicken Breast",
          category: "Meat",
          quantity: 1.5,
          unit: "kg",
          reorderLevel: 3,
          cost: 8.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Mozzarella Cheese",
          category: "Dairy",
          quantity: 0.5,
          unit: "kg",
          reorderLevel: 2,
          cost: 6.49,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Olive Oil",
          category: "Pantry",
          quantity: 0.2,
          unit: "L",
          reorderLevel: 1,
          cost: 12.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Basil",
          category: "Herbs",
          quantity: 0.1,
          unit: "kg",
          reorderLevel: 0.2,
          cost: 4.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "6",
          name: "Flour",
          category: "Pantry",
          quantity: 8,
          unit: "kg",
          reorderLevel: 5,
          cost: 2.49,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "7",
          name: "Eggs",
          category: "Dairy",
          quantity: 24,
          unit: "pcs",
          reorderLevel: 12,
          cost: 4.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "8",
          name: "Onions",
          category: "Produce",
          quantity: 3,
          unit: "kg",
          reorderLevel: 2,
          cost: 1.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter dishes based on search term
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle adding a new dish
  const handleAddDish = () => {
    setCurrentDish(undefined);
    setIsFormOpen(true);
  };

  // Function to handle editing a dish
  const handleEditDish = (dish: Dish) => {
    setCurrentDish(dish);
    setIsFormOpen(true);
  };

  // Function to handle deleting a dish
  const handleDeleteDish = (dish: Dish) => {
    setDishToDelete(dish);
    setIsDeleteDialogOpen(true);
  };

  // Function to confirm dish deletion
  const confirmDeleteDish = () => {
    if (!dishToDelete) return;

    // In a real app, this would be an API call to Supabase
    const updatedDishes = dishes.filter((dish) => dish.id !== dishToDelete.id);
    setDishes(updatedDishes);
    setIsDeleteDialogOpen(false);
    setDishToDelete(null);
  };

  // Function to save a dish (new or edited)
  const handleSaveDish = (dish: Dish) => {
    // In a real app, this would be an API call to Supabase
    if (currentDish) {
      // Editing existing dish
      const updatedDishes = dishes.map((d) => (d.id === dish.id ? dish : d));
      setDishes(updatedDishes);
    } else {
      // Adding new dish
      setDishes([...dishes, dish]);
    }

    setIsFormOpen(false);
    setCurrentDish(undefined);
  };

  // Function to get ingredient name by id
  const getIngredientName = (id: string) => {
    const ingredient = ingredients.find((ing) => ing.id === id);
    return ingredient ? ingredient.name : "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {isFormOpen ? (
        <div>
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-600 hover:text-slate-900"
            >
              <FiChevronLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
            <h1 className="text-2xl font-bold text-slate-800 mt-2">
              {currentDish ? "Edit Recipe" : "Add New Recipe"}
            </h1>
          </div>

          <RecipeForm
            dish={currentDish}
            ingredients={ingredients}
            onSave={handleSaveDish}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Recipe Management
              </h1>
              <p className="text-sm text-slate-500">
                Manage your restaurant recipes and their ingredients
              </p>
            </div>

            <Button
              className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700"
              onClick={handleAddDish}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Recipe
            </Button>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Recipes Table */}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipe Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Ingredients</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDishes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        No recipes found. Add your first recipe to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDishes.map((dish) => (
                      <TableRow key={dish.id}>
                        <TableCell className="font-medium">
                          {dish.name}
                        </TableCell>
                        <TableCell>${dish.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {dish.ingredients.map((ing, index) => (
                              <span
                                key={ing.ingredientId}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {getIngredientName(ing.ingredientId)}
                                {index < dish.ingredients.length - 1
                                  ? ", "
                                  : ""}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditDish(dish)}
                            className="h-8 w-8 text-blue-600"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDish(dish)}
                            className="h-8 w-8 text-red-500"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the recipe "{dishToDelete?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDish}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
