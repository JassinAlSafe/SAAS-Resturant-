"use client";

import { useEffect, useRef } from "react";
import { ShoppingListItem } from "@/lib/types";
import { announcer } from "./helpers";

interface AccessibilityHelpersProps {
  items: ShoppingListItem[];
  onItemSelect: (item: ShoppingListItem) => void;
  onItemPurchase: (params: { id: string; isPurchased: boolean }) => unknown;
}

export default function AccessibilityHelpers({
  items,
  onItemSelect,
  onItemPurchase,
}: AccessibilityHelpersProps) {
  const announcedRef = useRef(false);

  // Announce item count on initial load
  useEffect(() => {
    if (items.length > 0 && !announcedRef.current) {
      const pendingCount = items.filter((item) => !item.isPurchased).length;
      const purchasedCount = items.filter((item) => item.isPurchased).length;

      announcer.announce(
        `Shopping list loaded with ${items.length} total items. ${pendingCount} items to purchase, ${purchasedCount} items purchased.`
      );

      announcedRef.current = true;
    }
  }, [items]);

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle global keyboard shortcuts
      if (e.altKey && e.key === "a") {
        e.preventDefault();
        announcer.announce("Opening add item form");
        // Cannot directly call handleAddItem here
      }

      // Keyboard shortcut to view first item details
      if (e.altKey && e.key === "v" && items.length > 0) {
        e.preventDefault();
        const firstItem = items[0];
        announcer.announce(`Viewing details for ${firstItem.name}`);
        onItemSelect(firstItem);
      }

      // Toggle purchase status of focused item
      // This is just an example; actual implementation would require focus tracking
      if (e.altKey && e.key === "p" && items.length > 0) {
        // For example purposes only - would need proper focus management
        const firstPendingItem = items.find((item) => !item.isPurchased);
        if (firstPendingItem) {
          e.preventDefault();
          announcer.announce(`Marking ${firstPendingItem.name} as purchased`);
          onItemPurchase({ id: firstPendingItem.id, isPurchased: true });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, onItemSelect, onItemPurchase]);

  // Hidden screen reader content that doesn't affect visual layout
  return (
    <>
      <div className="sr-only" aria-live="polite" id="sr-announcer"></div>
      <div className="sr-only" role="status">
        {items.length > 0 ? (
          <p>
            Your shopping list has {items.length} items. Press Tab to navigate
            through the list and Space to toggle purchased status.
          </p>
        ) : (
          <p>Your shopping list is empty. Add items to get started.</p>
        )}
      </div>
    </>
  );
}
