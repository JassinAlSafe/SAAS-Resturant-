"use client";

import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { FiShoppingCart, FiPlus } from "react-icons/fi";

interface EmptyShoppingListProps {
  onAddClick: () => void;
  onRefreshClick: () => void;
}

export default function EmptyShoppingList({
  onAddClick,
  onRefreshClick,
}: EmptyShoppingListProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <FiShoppingCart className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        Your Shopping List is Empty
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Add items to your shopping list manually or refresh to generate a list
        based on low inventory items.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" onClick={onRefreshClick}>
          <FiShoppingCart className="mr-2" />
          Generate from Inventory
        </Button>
        <Button onClick={onAddClick}>
          <FiPlus className="mr-2" />
          Add Item Manually
        </Button>
      </div>
    </Card>
  );
}
