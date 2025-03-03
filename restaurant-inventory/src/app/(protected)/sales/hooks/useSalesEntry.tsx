"use client";

import { useState, useEffect } from "react";
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

  // Update selectedDate when dateString changes
  useEffect(() => {
    setSelectedDate(new Date(dateString));
  }, [dateString]);

  // Reset the form
  const resetForm = () => {
    setSalesEntries({});
    setShowInventoryImpact(false);
  };

  // Handle quantity change
  const handleQuantityChange = (dishId: string, quantity: number) => {
    setSalesEntries({
      ...salesEntries,
      [dishId]: quantity,
    });
  };

  // Calculate total for all entries
  const calculateTotal = () => {
    return Object.entries(salesEntries).reduce((total, [dishId, quantity]) => {
      const dish = dishes.find((d) => d.id === dishId);
      return total + (dish ? dish.price * quantity : 0);
    }, 0);
  };

  // Toggle inventory impact visibility
  const toggleInventoryImpact = () => {
    setShowInventoryImpact(!showInventoryImpact);
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
  };
}
