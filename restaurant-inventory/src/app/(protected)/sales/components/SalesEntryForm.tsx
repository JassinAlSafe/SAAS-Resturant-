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
  onLoadPreviousDay,
  hasPreviousDayTemplate,
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

  const onLoadPreviousDayCallback = useCallback(() => {
    if (onLoadPreviousDay) {
      onLoadPreviousDay();
    }
  }, [onLoadPreviousDay]);

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full h-full flex flex-col bg-white relative"
    >
      <SalesEntryHeader
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        showInventoryImpact={showInventoryImpact}
        onToggleInventoryImpact={onToggleInventoryImpactCallback}
        onClearAll={onClearAllCallback}
        hasSalesEntries={hasSalesEntries}
        onLoadPreviousDay={onLoadPreviousDayCallback}
        hasPreviousDayTemplate={hasPreviousDayTemplate || false}
      />

      <div className="grid grid-cols-12 gap-6 px-8 py-3 bg-slate-50 border-y border-slate-200 sticky top-[73px] z-10">
        <div className="col-span-6 text-sm font-medium text-slate-600">
          Dish
        </div>
        <div className="col-span-2 text-sm font-medium text-slate-600">
          Price
        </div>
        <div className="col-span-2 text-sm font-medium text-slate-600">
          Quantity
        </div>
        <div className="col-span-2 text-sm font-medium text-slate-600">
          Total
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {dishes.length === 0 ? (
          <div className="px-8 py-12 text-center text-slate-500">
            No menu items found. Add recipes to your menu to record sales.
          </div>
        ) : (
          <div>
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
    </form>
  );
}
