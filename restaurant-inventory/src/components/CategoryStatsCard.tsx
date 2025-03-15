"use client";

import { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiMoreHorizontal,
  FiFilter,
} from "react-icons/fi";
import Card from "./Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  count: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface CategoryStatsCardProps {
  title: string;
  categories: Category[];
  onViewAll?: () => void;
}

export default function CategoryStatsCard({
  title,
  categories,
  onViewAll,
}: CategoryStatsCardProps) {
  const [sortBy, setSortBy] = useState<"name" | "count" | "change">("count");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: "name" | "count" | "change") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "count") {
      return sortDirection === "asc" ? a.count - b.count : b.count - a.count;
    } else {
      return sortDirection === "asc"
        ? a.change - b.change
        : b.change - a.change;
    }
  });

  return (
    <Card className="shadow-xs hover:shadow-md transition-all">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex items-center justify-center"
              >
                <FiFilter className="h-4 w-4" />
                <span className="sr-only">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <span>Category Name</span>
                {sortBy === "name" && (
                  <span>
                    {sortDirection === "asc" ? (
                      <FiChevronUp className="h-4 w-4" />
                    ) : (
                      <FiChevronDown className="h-4 w-4" />
                    )}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleSort("count")}
              >
                <span>Item Count</span>
                {sortBy === "count" && (
                  <span>
                    {sortDirection === "asc" ? (
                      <FiChevronUp className="h-4 w-4" />
                    ) : (
                      <FiChevronDown className="h-4 w-4" />
                    )}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleSort("change")}
              >
                <span>Change</span>
                {sortBy === "change" && (
                  <span>
                    {sortDirection === "asc" ? (
                      <FiChevronUp className="h-4 w-4" />
                    ) : (
                      <FiChevronDown className="h-4 w-4" />
                    )}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex items-center justify-center"
              >
                <FiMoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewAll}>
                View all categories
              </DropdownMenuItem>
              <DropdownMenuItem>Export data</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {sortedCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center",
                    category.color
                  )}
                >
                  {category.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {category.count} items
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "text-sm font-medium flex items-center",
                  category.change > 0
                    ? "text-green-600"
                    : category.change < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
                )}
              >
                {category.change > 0 ? (
                  <FiChevronUp className="h-4 w-4 mr-0.5" />
                ) : category.change < 0 ? (
                  <FiChevronDown className="h-4 w-4 mr-0.5" />
                ) : null}
                {Math.abs(category.change)}%
              </div>
            </div>
          ))}
        </div>
      </div>
      {onViewAll && (
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={onViewAll}
          >
            View All Categories
          </Button>
        </div>
      )}
    </Card>
  );
}
