"use client";

import { useState, useEffect } from "react";
import { Sale, Dish } from "@/lib/types";
import { salesService } from "@/lib/services/sales-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import { format } from "date-fns";

export function useSales() {
  // State
  const [sales, setSales] = useState<Sale[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingredientDetails, setIngredientDetails] = useState<{
    [key: string]: { name: string; unit: string };
  }>({});

  // Notifications
  const { success, error: showError } = useNotificationHelpers();

  // Fetch sales and dishes
  const fetchSalesAndDishes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch sales
      const fetchedSales = await salesService.getSales();
      setSales(fetchedSales);

      // Fetch dishes
      const fetchedDishes = await salesService.getDishes();
      setDishes(fetchedDishes);

      // Get all unique ingredient IDs from dishes
      const ingredientIds = Array.from(
        new Set(
          fetchedDishes.flatMap((dish) =>
            dish.ingredients.map((ing) => ing.ingredientId)
          )
        )
      );

      // Fetch ingredient details
      if (ingredientIds.length > 0) {
        const ingredients = await salesService.getIngredientDetails(
          ingredientIds
        );

        // Create a map for easier access
        const detailsMap: { [key: string]: { name: string; unit: string } } =
          {};
        ingredients.forEach((ing) => {
          detailsMap[ing.id] = {
            name: ing.name,
            unit: ing.unit,
          };
        });

        setIngredientDetails(detailsMap);
      }
    } catch (err) {
      console.error("Error fetching sales and dishes:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to load sales and dishes. ${errorMessage}`);
      showError(
        "Failed to load data",
        "There was an error loading sales and dishes."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sales for a specific date
  const fetchSalesByDate = async (date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSales = await salesService.getSalesByDate(date);
      setSales(fetchedSales);
    } catch (err) {
      console.error("Error fetching sales by date:", err);
      showError(
        "Failed to load sales",
        "There was an error loading sales for the selected date."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add new sales entries
  const addSalesEntries = async (
    entries: { [dishId: string]: number },
    date: Date
  ) => {
    try {
      // Convert entries to array format
      const formattedDate = format(date, "yyyy-MM-dd");
      const salesEntries: Omit<Sale, "id" | "createdAt">[] = [];

      for (const [dishId, quantity] of Object.entries(entries)) {
        if (quantity <= 0) continue;

        const dish = dishes.find((d) => d.id === dishId);
        if (!dish) continue;

        salesEntries.push({
          dishId,
          dishName: dish.name,
          quantity,
          totalAmount: quantity * dish.price,
          date: formattedDate,
        });
      }

      if (salesEntries.length === 0) {
        showError(
          "No Sales to Add",
          "Please enter valid quantities for at least one dish."
        );
        return false;
      }

      // Add sales
      const addedSales = await salesService.addSales(salesEntries);

      if (addedSales.length > 0) {
        // Update the sales list
        setSales((prev) => [...prev, ...addedSales]);

        // Update inventory (in a real app, this would reduce ingredient quantities)
        await salesService.updateInventoryFromSales(addedSales);

        success(
          "Sales Recorded",
          `${addedSales.length} sales entries have been added.`
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error adding sales entries:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      showError(
        "Failed to add sales",
        `There was an error adding sales entries: ${errorMessage}`
      );
      return false;
    }
  };

  // Calculate inventory impact for a dish
  const calculateInventoryImpact = (dishId: string, quantity: number) => {
    const dish = dishes.find((d) => d.id === dishId);
    if (!dish) return [];

    return dish.ingredients.map((ingredient) => {
      const name =
        ingredientDetails[ingredient.ingredientId]?.name ||
        "Unknown Ingredient";
      const unit = ingredientDetails[ingredient.ingredientId]?.unit || "unit";

      return {
        ingredientId: ingredient.ingredientId,
        name,
        quantityUsed: ingredient.quantity * quantity,
        unit,
      };
    });
  };

  // Load data on initial render
  useEffect(() => {
    fetchSalesAndDishes();
  }, []);

  return {
    sales,
    dishes,
    isLoading,
    error,
    ingredientDetails,
    fetchSalesAndDishes,
    fetchSalesByDate,
    addSalesEntries,
    calculateInventoryImpact,
  };
}
