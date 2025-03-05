"use client";

import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { FiPlus, FiBook } from "react-icons/fi";

interface EmptyRecipesProps {
  onAddClick: () => void;
}

export default function EmptyRecipes({ onAddClick }: EmptyRecipesProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-20 px-6 text-center border border-gray-100 shadow-sm rounded-lg">
      <div className="bg-blue-50 p-8 rounded-full mb-8 shadow-inner">
        <FiBook className="h-14 w-14 text-blue-600" />
      </div>
      <h2 className="text-2xl font-semibold mb-3 text-gray-800">
        Your Recipe Book is Empty
      </h2>
      <p className="text-gray-500 max-w-md mb-8 text-base leading-relaxed">
        Start by adding your restaurant's recipes. You'll be able to track
        ingredients, calculate costs, and manage your menu more efficiently.
      </p>
      <Button
        onClick={onAddClick}
        size="lg"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
      >
        <FiPlus className="mr-2 h-5 w-5" />
        Create Your First Recipe
      </Button>
      <p className="mt-6 text-sm text-gray-400">
        You can also import recipes from a spreadsheet or other systems.
      </p>
    </Card>
  );
}
