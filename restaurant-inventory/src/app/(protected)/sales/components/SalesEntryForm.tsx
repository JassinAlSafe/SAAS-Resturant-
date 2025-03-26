"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { SalesEntryHeader } from "./SalesEntryHeader";
import { SalesEntryRow } from "./SalesEntryRow";
import { SalesEntryFooter } from "./SalesEntryFooter";
import type { SalesEntryFormProps } from "../types";

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
      toast.success("Sales entry saved successfully");
    } catch (error) {
      toast.error("Failed to save sales entry");
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
      className="w-full h-full flex flex-col bg-transparent"
    >
      <SalesEntryHeader
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        showInventoryImpact={showInventoryImpact}
        onToggleInventoryImpact={onToggleInventoryImpactCallback}
        onClearAll={onClearAllCallback}
        hasSalesEntries={hasSalesEntries}
        onViewHistory={onViewHistory}
      />

      <div className="px-2 pt-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-medium text-neutral-800">Menu Items</h3>
          <p className="text-sm text-neutral-500">
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

      <div className="flex-1 overflow-auto px-2">
        {dishes.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-neutral-500">
            No menu items found. Add recipes to your menu to record sales.
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      <SalesEntryFooter
        total={localTotal}
        isSubmitting={isSubmitting}
        isDisabled={!selectedDate || localTotal === 0}
      />
    </form>
  );
}
