"use client";

import { useCallback, useMemo } from "react";
import { useInventoryManager } from "@/app/(protected)/inventory/hooks/useInventoryStore";
import { InventoryRow } from "./InventoryRow";
import { InventoryItem } from "@/lib/types";

interface ConnectedInventoryRowProps {
  itemId: string;
  onClick?: (item: InventoryItem) => void;
}

export const ConnectedInventoryRow = ({
  itemId,
  onClick,
}: ConnectedInventoryRowProps) => {
  const { items } = useInventoryManager();

  const item = useMemo(() => {
    return items.find((i) => i.id === itemId);
  }, [items, itemId]);

  const handleClick = useCallback(() => {
    if (onClick && item) onClick(item);
  }, [onClick, item]);

  if (!item) return null;

  // Calculate depletion status
  const depleted = item.quantity <= 0;
  const warning = !depleted && item.quantity <= item.reorder_level;

  // Calculate depletion text
  let depletionText = "In Stock";
  if (depleted) {
    depletionText = "Out of Stock";
  } else if (warning) {
    depletionText = "Low Stock";
  }

  return (
    <InventoryRow
      name={item.name}
      stock={`${item.quantity} ${item.unit}`}
      usage={`${item.reorder_level} ${item.unit}`}
      depletion={depletionText}
      depleted={depleted}
      warning={warning}
      onClick={handleClick}
    />
  );
};
