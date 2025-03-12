"use client";

import { useSales } from "./useSales";
import { useSalesEntry } from "./useSalesEntry";
import { useSalesFilter } from "./useSalesFilter";
import { useSaleNotes } from "./useSaleNotes";
import { Recipe, InventoryImpactItem } from "../types";
import { Dish } from "@/lib/types";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { salesService } from "@/lib/services/sales-service";

// Re-export all hooks from a single file for more convenient imports
export { useSales, useSalesEntry, useSalesFilter, useSaleNotes };

// Export a combined hook for the sales page
export function useSalesPage(initialDishes: Dish[] = []) {
  // Ref to track initialization and prevent duplicate loading
  const hasInitialized = useRef(false);
  const isComponentMounted = useRef(true);

  // Initialize salesHook first since other hooks depend on it
  const salesHook = useSales();

  // Add state for recipes
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  // Custom dishes state for adding from recipes
  const [customDishes, setCustomDishes] = useState<Dish[]>([]);

  // State for low stock alerts
  const [lowStockAlerts, setLowStockAlerts] = useState<string[]>([]);

  // Initialize derived hooks with clean arrays at first to avoid dependency issues
  const entryHook = useSalesEntry(initialDishes);
  const filterHook = useSalesFilter(salesHook.sales, initialDishes);
  const notesHook = useSaleNotes();

  // Destructure methods that will be used in callbacks to avoid dependency issues
  const { handleQuantityChange } = entryHook;

  // Helper function to add a dish (would normally be in the API)
  const addDish = useCallback((dish: Dish) => {
    setCustomDishes((prev) => [...prev, dish]);
  }, []);

  // Add dish from recipe - wrap in useCallback to prevent recreation on each render
  const handleAddDishFromRecipe = useCallback(
    (recipeId: string) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe) return;

      // Create a dish from the recipe
      const newDish: Dish = {
        id: `dish-${recipeId}-${Date.now()}`, // Create a unique ID
        name: recipe.name,
        price: recipe.price,
        category: recipe.category,
        ingredients: recipe.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add the dish to the list
      addDish(newDish);

      // Set an initial quantity of 1 for the new dish
      handleQuantityChange(newDish.id, 1);

      toast.success(`Added ${recipe.name} to sales entry`, {
        description: "The dish has been added with a quantity of 1.",
      });
    },
    [recipes, addDish, handleQuantityChange]
  );

  // Component cleanup effect
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Initialize data only once
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function initializeData() {
      if (!isComponentMounted.current) return;

      setIsLoadingRecipes(true);
      try {
        const fetchedRecipes = await salesHook.fetchRecipes();
        if (isComponentMounted.current) {
          // Fix type issue by ensuring fetchedRecipes is of type Recipe[]
          setRecipes(Array.isArray(fetchedRecipes) ? fetchedRecipes : []);
        }
      } catch (error) {
        if (isComponentMounted.current) {
          console.error("Error loading recipes:", error);
          toast.error("Failed to load recipes", {
            description: "There was an error loading menu items.",
          });
        }
      } finally {
        if (isComponentMounted.current) {
          setIsLoadingRecipes(false);
        }
      }
    }

    // Simple timeout to ensure all hooks are properly set up first
    setTimeout(initializeData, 100);
  }, [salesHook]); // Add salesHook to dependencies to fix any potential lint warnings

  // Update the dishes after the salesHook dishes have loaded
  useEffect(() => {
    if (salesHook.dishes.length === 0) return;

    // This effect only updates when salesHook.dishes actually changes
    // It doesn't run on every render because we're using it in the dependency array
  }, [salesHook.dishes]);

  // Function to check for low stock after sales entry - wrap in useCallback
  const checkLowStockAlerts = useCallback(async () => {
    const entriesWithQuantities = Object.entries(entryHook.salesEntries).filter(
      ([, quantity]) => quantity > 0
    );

    if (entriesWithQuantities.length === 0) return [];

    // Get inventory impact for each dish
    const impacts = entriesWithQuantities.flatMap(([dishId, quantity]) => {
      return salesHook.calculateInventoryImpact(dishId, quantity);
    });

    // Fetch current inventory levels
    try {
      const ingredientIds = Array.from(
        new Set(impacts.map((i) => i.ingredientId))
      );

      // Use the service directly instead of through salesHook
      const inventoryItems = await salesService.getIngredientDetails(
        ingredientIds
      );

      // Create a map of current stock levels
      const stockLevels = new Map<
        string,
        {
          name: string;
          currentStock: number;
          minStock: number;
          unit: string;
        }
      >();

      // Handle the type issue with inventory items
      interface ExtendedInventoryItem {
        id: string;
        name: string;
        unit: string;
        current_stock?: number;
        minimum_stock?: number;
      }

      inventoryItems.forEach((item: ExtendedInventoryItem) => {
        stockLevels.set(item.id, {
          name: item.name,
          currentStock: item.current_stock || 0,
          minStock: item.minimum_stock || 0,
          unit: item.unit,
        });
      });

      // Aggregate impacts by ingredient
      const aggregatedImpacts: Record<string, InventoryImpactItem> =
        impacts.reduce((acc, impact) => {
          const { ingredientId } = impact;
          if (!acc[ingredientId]) {
            acc[ingredientId] = { ...impact };
          } else {
            acc[ingredientId].quantityUsed += impact.quantityUsed;
          }
          return acc;
        }, {} as Record<string, InventoryImpactItem>);

      // Check for low stock alerts
      const alerts: string[] = [];
      for (const [ingredientId, impact] of Object.entries(aggregatedImpacts)) {
        const inventory = stockLevels.get(ingredientId);
        if (inventory) {
          const remainingStock = Math.max(
            0,
            inventory.currentStock - impact.quantityUsed
          );
          if (remainingStock < inventory.minStock) {
            alerts.push(
              `${inventory.name} (${remainingStock.toFixed(1)} ${
                inventory.unit
              } remaining)`
            );
          }
        }
      }

      setLowStockAlerts(alerts);
      return alerts;
    } catch (error) {
      console.error("Error checking low stock:", error);
      return [];
    }
  }, [entryHook.salesEntries, salesHook]);

  // Handle submitting sales entries - wrap in useCallback
  const handleSubmitSales = useCallback(async () => {
    entryHook.setIsSubmitting(true);
    try {
      // Validate that we have at least one item with quantity > 0
      const hasItems = Object.values(entryHook.salesEntries).some(
        (qty) => qty > 0
      );
      if (!hasItems) {
        toast.error("No items to submit", {
          description:
            "Please add at least one item with a quantity greater than zero.",
        });
        return false;
      }

      // Validate the date
      if (!entryHook.selectedDate || isNaN(entryHook.selectedDate.getTime())) {
        toast.error("Invalid date", {
          description: "Please select a valid date for the sales entry.",
        });
        return false;
      }

      // Check for low stock before submitting
      const lowStockItems = await checkLowStockAlerts();

      const success = await salesHook.addSalesEntries(
        entryHook.salesEntries,
        entryHook.selectedDate
      );
      if (success) {
        // Show success message with low stock alerts if any
        if (lowStockItems.length > 0) {
          toast.warning("Sales submitted with low stock alerts", {
            description: `The following items are now below minimum stock levels: ${lowStockItems.join(
              ", "
            )}`,
            duration: 6000,
          });
        } else {
          toast.success("Sales submitted successfully");
        }

        // Refresh the sales list
        await salesHook.fetchSalesAndDishes();
        entryHook.resetForm();
        return true;
      } else {
        toast.error("Failed to submit sales");
        return false;
      }
    } catch (error) {
      console.error("Error in handleSubmitSales:", error);
      toast.error("Submission error", {
        description:
          "An unexpected error occurred while submitting sales. Please try again.",
      });
      return false;
    } finally {
      entryHook.setIsSubmitting(false);
    }
  }, [entryHook, salesHook, checkLowStockAlerts]);

  return {
    // Data
    sales: salesHook.sales,
    dishes: [...salesHook.dishes, ...customDishes],
    recipes: recipes,
    salesEntries: entryHook.salesEntries,
    filteredSales: filterHook.filteredSales,
    selectedSale: notesHook.selectedSale,
    dateString: entryHook.dateString,
    lowStockAlerts,

    // States
    isLoading: salesHook.isLoading || isLoadingRecipes,
    error: salesHook.error,
    isSubmitting: entryHook.isSubmitting,
    showInventoryImpact: entryHook.showInventoryImpact,
    isNotesModalOpen: notesHook.isNotesModalOpen,

    // Actions
    handleQuantityChange: entryHook.handleQuantityChange,
    setDateString: entryHook.setDateString,
    calculateTotal: entryHook.calculateTotal,
    toggleInventoryImpact: entryHook.toggleInventoryImpact,
    resetForm: entryHook.resetForm,
    clearAllQuantities: entryHook.clearAllQuantities,
    loadPreviousDayTemplate: entryHook.loadPreviousDayTemplate,
    hasPreviousDayTemplate: entryHook.hasPreviousDayTemplate,
    onAddDishFromRecipe: handleAddDishFromRecipe,
    checkLowStockAlerts,

    // Search and filtering
    searchTerm: filterHook.searchTerm,
    setSearchTerm: filterHook.setSearchTerm,
    filterDate: filterHook.selectedDate,
    setFilterDate: filterHook.setSelectedDate,
    resetFilters: filterHook.resetFilters,

    // Notes
    openNotesModal: notesHook.openNotesModal,
    closeNotesModal: notesHook.closeNotesModal,

    // API operations
    fetchSalesAndDishes: salesHook.fetchSalesAndDishes,
    calculateInventoryImpact: salesHook.calculateInventoryImpact,
    handleSubmitSales,
  };
}
