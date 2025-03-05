"use client";

import { FiShoppingCart } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface ShoppingListHeaderProps {
  error?: string;
  retry?: () => void;
}

export default function ShoppingListHeader({
  error,
  retry,
}: ShoppingListHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
        <FiShoppingCart className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
        <p className="text-sm text-gray-500">
          Track items to purchase for your restaurant
        </p>
        {error && retry && (
          <div className="mt-2">
            <Button variant="destructive" size="sm" onClick={retry}>
              Retry Loading
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
