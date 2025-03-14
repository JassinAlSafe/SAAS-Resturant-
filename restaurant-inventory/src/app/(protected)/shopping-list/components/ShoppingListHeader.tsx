"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, RefreshCw } from "lucide-react";

interface ShoppingListHeaderProps {
  onAddItem: () => void;
  onGenerateList: () => Promise<void>;
  isGenerating: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  totalEstimatedCost: number;
}

export default function ShoppingListHeader({
  onAddItem,
  onGenerateList,
  isGenerating,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalEstimatedCost,
}: ShoppingListHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shopping List</h1>
          <p className="text-sm text-muted-foreground">
            Total Estimated Cost: ${totalEstimatedCost.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <Button
            onClick={onGenerateList}
            disabled={isGenerating}
            variant="outline"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Generate List
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sm:max-w-[300px]"
        />
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="sm:max-w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
