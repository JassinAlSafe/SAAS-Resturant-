"use client";

import { FiShoppingCart } from "react-icons/fi";
import { ApiError } from "@/components/ui/api-error";

interface ShoppingListHeaderProps {
  error?: string;
  retry?: () => void;
}

export default function ShoppingListHeader({
  error,
  retry,
}: ShoppingListHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FiShoppingCart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Shopping List</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Manage items to purchase for your inventory
      </p>

      {error && retry && (
        <ApiError title="Shopping List Error" message={error} onRetry={retry} />
      )}
    </div>
  );
}
