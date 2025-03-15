"use client";

import { Button } from "@/components/ui/button";
import { FiPlus, FiRefreshCw, FiShoppingCart } from "react-icons/fi";

interface EmptyShoppingListProps {
  onAddClick: () => void;
  onRefreshClick: () => void;
}

export default function EmptyShoppingList({
  onAddClick,
  onRefreshClick,
}: EmptyShoppingListProps) {
  return (
    <div className="bg-white border rounded-lg shadow-xs flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-blue-50 p-6 rounded-full mb-6 border border-blue-100">
        <FiShoppingCart className="h-12 w-12 text-blue-600" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-gray-900">
        Your Shopping List is Empty
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        Add items to your shopping list to keep track of what you need to
        purchase. You can add items manually or generate them from low inventory
        items.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-xs"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Item Manually
        </Button>
        <Button
          onClick={onRefreshClick}
          variant="outline"
          className="border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Generate from Inventory
        </Button>
      </div>
    </div>
  );
}
