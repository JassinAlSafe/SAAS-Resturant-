"use client";

import { useState, useEffect, useCallback } from "react";
import { Dish } from "@/lib/types";
import { format } from "date-fns";

export function useSalesEntry(dishes: Dish[]) {
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
      setSalesEntries((prev) => ({
        ...prev,
        [dishId]: quantity,
      }));
    },
    []
  );

  // Calculate total for all entries
  const calculateTotal = useCallback(() => {
    return Object.entries(salesEntries).reduce((total, [dishId, quantity]) => {
      const dish = dishes.find((d) => d.id === dishId);
      return total + (dish ? dish.price * quantity : 0);
    }, 0);
  }, [salesEntries, dishes]);

  // Toggle inventory impact visibility
  const toggleInventoryImpact = () => {
    setShowInventoryImpact(!showInventoryImpact);
  };

  // Load previous day's data as a template
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
      return Math.max(0, newQty); // Ensure we don't go below 0
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
  };
}
