"use client";

import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { FiSearch } from "react-icons/fi";

interface RecipeSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function RecipeSearch({
  searchTerm,
  onSearchChange,
}: RecipeSearchProps) {
  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </Card>
  );
}
