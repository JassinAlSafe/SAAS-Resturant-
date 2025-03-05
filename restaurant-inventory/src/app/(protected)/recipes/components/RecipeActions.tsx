"use client";

import { Button } from "@/components/ui/button";
import { CurrencySelector } from "@/components/currency-selector";
import { FiPlus, FiDownload, FiUpload } from "react-icons/fi";

interface RecipeActionsProps {
  onAddClick: () => void;
}

export default function RecipeActions({ onAddClick }: RecipeActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <CurrencySelector />

      <div className="hidden md:flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <FiDownload className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <FiUpload className="mr-2 h-4 w-4" />
          Import
        </Button>
      </div>

      <Button
        size="sm"
        onClick={onAddClick}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
      >
        <FiPlus className="mr-2 h-4 w-4" />
        Add Recipe
      </Button>
    </div>
  );
}
