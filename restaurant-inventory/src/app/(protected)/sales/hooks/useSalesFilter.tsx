"use client";

import { useState, useMemo } from "react";
import { Sale, Dish } from "@/lib/types";
import { format } from "date-fns";

export function useSalesFilter(sales: Sale[], dishes: Dish[]) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filtered sales based on search term and date
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Filter by search term
      const matchesSearch = sale.dishName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filter by date if selected
      const matchesDate =
        !selectedDate ||
        format(new Date(sale.date), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd");

      return matchesSearch && matchesDate;
    });
  }, [sales, searchTerm, selectedDate]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDate(null);
  };

  // Get sales for a specific date
  const getSalesByDate = (date: Date) => {
    return sales.filter(
      (sale) =>
        format(new Date(sale.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  // Calculate total sales by dish
  const calculateSalesByDish = () => {
    const dishSales: { [key: string]: { quantity: number; amount: number } } =
      {};

    filteredSales.forEach((sale) => {
      if (!dishSales[sale.dishId]) {
        dishSales[sale.dishId] = { quantity: 0, amount: 0 };
      }

      dishSales[sale.dishId].quantity += sale.quantity;
      dishSales[sale.dishId].amount += sale.totalAmount;
    });

    return Object.entries(dishSales).map(([dishId, data]) => {
      const dish = dishes.find((d) => d.id === dishId);
      return {
        dishId,
        dishName: dish?.name || "Unknown Dish",
        quantity: data.quantity,
        amount: data.amount,
      };
    });
  };

  // Calculate total sales
  const calculateTotalSales = () => {
    return filteredSales.reduce((total, sale) => total + sale.totalAmount, 0);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedDate,
    setSelectedDate,
    filteredSales,
    resetFilters,
    getSalesByDate,
    calculateSalesByDish,
    calculateTotalSales,
  };
}
