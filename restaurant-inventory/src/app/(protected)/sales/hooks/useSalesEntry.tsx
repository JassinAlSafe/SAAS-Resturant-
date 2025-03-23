"use client";

import { useState, useEffect, useCallback } from "react";
import { Dish } from "@/lib/types";
import { format } from "date-fns";

export function useSalesEntry(initialDishes: Dish[]) {
  // Store dishes in state so they can be updated
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);

  // Add logging for dishes
  useEffect(() => {
    console.log("useSalesEntry dishes:", dishes);
  }, [dishes]);

  // Form state
  const [salesEntries, setSalesEntries] = useState<{ [key: string]: number }>(
    {}
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateString, setDateString] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInventoryImpact, setShowInventoryImpact] = useState(false);
  const [previousDayEntries, setPreviousDayEntries] = useState<{
    [key: string]: number;
  } | null>(null);

  // Update selectedDate when dateString changes
  useEffect(() => {
    setSelectedDate(new Date(dateString));
  }, [dateString]);

  // Reset the form
  const resetForm = () => {
    setSalesEntries({});
    setShowInventoryImpact(false);
    // Store current entries as previous day entries before clearing
    if (Object.keys(salesEntries).some((id) => salesEntries[id] > 0)) {
      setPreviousDayEntries({ ...salesEntries });
    }
  };

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (dishId: string, quantity: number) => {
      console.log("Handling quantity change:", {
        dishId,
        quantity,
        dishExists: dishes.some((d) => d.id === dishId),
        dish: dishes.find((d) => d.id === dishId),
      });

      setSalesEntries((prev) => {
        const newEntries = {
          ...prev,
          [dishId]: quantity,
        };

        // Calculate new total immediately
        const newTotal = Object.entries(newEntries).reduce((sum, [id, qty]) => {
          const dish = dishes.find((d) => d.id === id);
          if (!dish) return sum;
          return sum + dish.price * qty;
        }, 0);

        console.log("New total after quantity change:", {
          newEntries,
          newTotal,
          dishes: dishes.map((d) => ({
            id: d.id,
            name: d.name,
            price: d.price,
          })),
        });

        return newEntries;
      });
    },
    [dishes]
  );

  // Calculate total for all entries
  const calculateTotal = useCallback(() => {
    if (!dishes.length) {
      console.warn("No dishes available for total calculation");
      return 0;
    }

    console.log("Calculating total with:", {
      entries: salesEntries,
      availableDishes: dishes.map((d) => ({
        id: d.id,
        name: d.name,
        price: d.price,
      })),
    });

    let runningTotal = 0;
    for (const [dishId, quantity] of Object.entries(salesEntries)) {
      const dish = dishes.find((d) => d.id === dishId);
      if (!dish) {
        console.warn(`Dish not found for id: ${dishId}`);
        continue;
      }

      const dishTotal = dish.price * quantity;
      runningTotal += dishTotal;

      console.log("Added to total:", {
        dishName: dish.name,
        price: dish.price,
        quantity,
        dishTotal,
        runningTotal,
      });
    }

    console.log("Final total:", runningTotal);
    return runningTotal;
  }, [dishes]);

  // Toggle inventory impact visibility
  const toggleInventoryImpact = () => {
    setShowInventoryImpact(!showInventoryImpact);
  };

  // Load previous day\'s data as a template
  const loadPreviousDayTemplate = () => {
    if (previousDayEntries) {
      setSalesEntries(previousDayEntries);
    }
  };

  // Bulk update quantities
  const bulkUpdateQuantities = (
    updateFn: (dishId: string, currentQty: number) => number
  ) => {
    const updatedEntries = { ...salesEntries };

    dishes.forEach((dish) => {
      const currentQty = salesEntries[dish.id] || 0;
      updatedEntries[dish.id] = updateFn(dish.id, currentQty);
    });

    setSalesEntries(updatedEntries);
  };

  // Clear all quantities
  const clearAllQuantities = () => {
    setSalesEntries({});
  };

  // Increment all quantities by a percentage
  const adjustQuantitiesByPercentage = (percentage: number) => {
    bulkUpdateQuantities((_, currentQty) => {
      if (currentQty === 0) return 0;
      const newQty = Math.round(currentQty * (1 + percentage / 100));
      return Math.max(0, newQty); // Ensure we don\'t go below 0
    });
  };

  return {
    salesEntries,
    selectedDate,
    dateString,
    setDateString,
    isSubmitting,
    setIsSubmitting,
    showInventoryImpact,
    handleQuantityChange,
    calculateTotal,
    toggleInventoryImpact,
    resetForm,
    loadPreviousDayTemplate,
    bulkUpdateQuantities,
    clearAllQuantities,
    adjustQuantitiesByPercentage,
    hasPreviousDayTemplate: !!previousDayEntries,
    updateDishes: (newDishes: Dish[]) => {
      console.log("Updating dishes in useSalesEntry:", newDishes.length);
      if (newDishes.length > 0) {
        setDishes(newDishes);
      }
    },
    dishes,
  };
}
