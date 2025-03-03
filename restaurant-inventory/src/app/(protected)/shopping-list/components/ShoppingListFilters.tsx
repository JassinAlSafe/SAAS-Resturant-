"use client";

import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { FiSearch, FiFilter } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ShoppingListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  showPurchased: boolean;
  onShowPurchasedChange: (value: boolean) => void;
  categories: string[];
}

export default function ShoppingListFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showPurchased,
  onShowPurchasedChange,
  categories,
}: ShoppingListFiltersProps) {
  return (
    <Card className="mb-6">
      <div className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search shopping list..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 flex-1"
            />
          </div>

          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full md:w-48">
              <div className="flex items-center">
                <FiFilter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </div>
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showPurchased"
            checked={showPurchased}
            onCheckedChange={(checked) =>
              onShowPurchasedChange(checked as boolean)
            }
          />
          <Label htmlFor="showPurchased" className="cursor-pointer">
            Show purchased items
          </Label>
        </div>
      </div>
    </Card>
  );
}
