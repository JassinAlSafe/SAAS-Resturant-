"use client";

import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { FiSearch, FiFilter } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface RecipeSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function RecipeSearch({
  searchQuery,
  onSearchChange,
}: RecipeSearchProps) {
  return (
    <Card className="mb-6 border border-gray-100 shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search recipes by name, category, or ingredients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md"
          />
        </div>
        <div className="hidden md:flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}
