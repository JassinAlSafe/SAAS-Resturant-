"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { SalesEntryHeader } from "./SalesEntryHeader";
import { SalesEntryRow } from "./SalesEntryRow";
import { SalesEntryFooter } from "./SalesEntryFooter";
import type { SalesEntryFormProps } from "../types";
import { useCurrency } from "@/lib/currency";

interface FormValues {
  date: Date | undefined;
  entries: Record<string, number>;
}

export default function SalesEntryForm({
  dishes,
  salesEntries,
  dateString,
  onDateChange,
  onQuantityChange,
  onSubmit,
  isSubmitting,
  onToggleInventoryImpact,
  showInventoryImpact,
  calculateInventoryImpact,
  onClearAll,
  onViewHistory,
}: SalesEntryFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateString ? new Date(dateString) : undefined
  );
  const { formatCurrency } = useCurrency();

  const { handleSubmit: formHandleSubmit } = useForm<FormValues>({
    defaultValues: {
      date: selectedDate,
      entries: salesEntries,
    },
  });

  // Calculate total using memoization
  const calculateTotal = useCallback(() => {
    return Object.entries(salesEntries).reduce((total, [dishId, quantity]) => {
      const dish = dishes.find((d) => d.id === dishId);
      return total + (dish ? dish.price * quantity : 0);
    }, 0);
  }, [salesEntries, dishes]);

  const localTotal = useMemo(() => calculateTotal(), [calculateTotal]);

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        setSelectedDate(date);
        onDateChange(format(date, "MMM d, yyyy"));
      }
    },
    [onDateChange]
  );

  const onSubmitForm = async () => {
    if (isSubmitting || localTotal === 0 || !selectedDate) return;

    try {
      await onSubmit();
    } catch (error) {
      toast.error("Failed to save sales entry", {
        description:
          "There was a problem saving your sales data. Please try again.",
        icon: "❌",
      });
      console.error("Error submitting sales:", error);
    }
  };

  const handleFormSubmit = formHandleSubmit(onSubmitForm);

  const hasSalesEntries = Object.values(salesEntries).some(
    (quantity) => quantity > 0
  );

  const onToggleInventoryImpactCallback = useCallback(() => {
    if (onToggleInventoryImpact) {
      onToggleInventoryImpact();
    }
  }, [onToggleInventoryImpact]);

  const onClearAllCallback = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    }
  }, [onClearAll]);

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full flex flex-col bg-transparent"
    >
      <div className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
        <SalesEntryHeader
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          showInventoryImpact={showInventoryImpact}
          onToggleInventoryImpact={onToggleInventoryImpactCallback}
          onClearAll={onClearAllCallback}
          hasSalesEntries={hasSalesEntries}
          onViewHistory={onViewHistory}
        />

        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-medium text-neutral-800">Menu Items</h3>
            <p className="text-sm text-orange-500">
              Enter quantities sold for today&apos;s sales
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6 pb-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
            <div className="col-span-6">Dish</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Total</div>
          </div>
        </div>

        <div
          className="flex-1 overflow-auto px-4 pb-4"
          style={{ maxHeight: "calc(100vh - 350px)" }}
        >
          {dishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 bg-orange-50/30 rounded-xl text-orange-600 p-6 text-center">
              <svg
                className="w-8 h-8 mb-3 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              No menu items found. Add recipes to your menu to record sales.
            </div>
          ) : (
            <div className="space-y-2">
              {dishes.map((dish) => (
                <SalesEntryRow
                  key={dish.id}
                  dish={dish}
                  quantity={salesEntries[dish.id] || 0}
                  onQuantityChange={onQuantityChange}
                  showInventoryImpact={showInventoryImpact}
                  inventoryImpact={calculateInventoryImpact(
                    dish.id,
                    salesEntries[dish.id] || 0
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <SalesEntryFooter
          total={localTotal}
          isSubmitting={isSubmitting}
          isDisabled={!selectedDate || localTotal === 0}
        />
      </div>
    </form>
  );
}
