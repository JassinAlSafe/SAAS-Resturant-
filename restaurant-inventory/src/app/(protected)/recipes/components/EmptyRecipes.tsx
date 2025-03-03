"use client";

import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { FiPlus, FiBook } from "react-icons/fi";

interface EmptyRecipesProps {
  onAddClick: () => void;
}

export default function EmptyRecipes({ onAddClick }: EmptyRecipesProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <FiBook className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Your Recipe Book is Empty</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Start by adding your restaurant's recipes. You'll be able to track
        ingredients, calculate costs, and manage your menu more efficiently.
      </p>
      <Button onClick={onAddClick}>
        <FiPlus className="mr-2" />
        Create Your First Recipe
      </Button>
    </Card>
  );
}
