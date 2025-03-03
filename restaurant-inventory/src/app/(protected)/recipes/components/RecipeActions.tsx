"use client";

import { Button } from "@/components/ui/button";
import { CurrencySelector } from "@/components/currency-selector";
import { FiPlus } from "react-icons/fi";

interface RecipeActionsProps {
  onAddClick: () => void;
}

export default function RecipeActions({ onAddClick }: RecipeActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <CurrencySelector />

      <Button size="sm" onClick={onAddClick}>
        <FiPlus className="mr-2" />
        Add Recipe
      </Button>
    </div>
  );
}
