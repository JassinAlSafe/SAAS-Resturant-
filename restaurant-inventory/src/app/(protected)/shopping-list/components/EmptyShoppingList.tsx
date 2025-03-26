"use client";

import { Plus, RefreshCw, ShoppingBag } from "lucide-react";

interface EmptyShoppingListProps {
  onAddClick: () => void;
  onRefreshClick: () => void;
}

export default function EmptyShoppingList({
  onAddClick,
  onRefreshClick,
}: EmptyShoppingListProps) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body items-center text-center py-16">
        <div className="avatar placeholder mb-6">
          <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
            <ShoppingBag className="h-12 w-12" />
          </div>
        </div>
        <h2 className="card-title text-xl mb-2">Your Shopping List is Empty</h2>
        <p className="text-base-content/70 max-w-md mb-8">
          Add items to your shopping list to keep track of what you need to
          purchase. You can add items manually or generate them from low
          inventory items.
        </p>
        <div className="card-actions justify-center flex-wrap gap-4">
          <button onClick={onAddClick} className="btn btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Item Manually
          </button>
          <button onClick={onRefreshClick} className="btn btn-outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate from Inventory
          </button>
        </div>
      </div>
    </div>
  );
}
