"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import Card from "@/components/Card";
import { Ingredient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Simulate fetching data from API
  useEffect(() => {
    // In a real app, this would be an API call to Supabase
    setTimeout(() => {
      setIngredients([
        {
          id: "1",
          name: "Tomatoes",
          category: "Produce",
          quantity: 2,
          unit: "kg",
          reorderLevel: 5,
          cost: 3.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Chicken Breast",
          category: "Meat",
          quantity: 1.5,
          unit: "kg",
          reorderLevel: 3,
          cost: 8.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Mozzarella Cheese",
          category: "Dairy",
          quantity: 0.5,
          unit: "kg",
          reorderLevel: 2,
          cost: 6.49,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Olive Oil",
          category: "Pantry",
          quantity: 0.2,
          unit: "L",
          reorderLevel: 1,
          cost: 12.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Basil",
          category: "Herbs",
          quantity: 0.1,
          unit: "kg",
          reorderLevel: 0.2,
          cost: 4.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "6",
          name: "Flour",
          category: "Pantry",
          quantity: 8,
          unit: "kg",
          reorderLevel: 5,
          cost: 2.49,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "7",
          name: "Eggs",
          category: "Dairy",
          quantity: 24,
          unit: "pcs",
          reorderLevel: 12,
          cost: 4.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "8",
          name: "Onions",
          category: "Produce",
          quantity: 3,
          unit: "kg",
          reorderLevel: 2,
          cost: 1.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  // Get unique categories
  const categories = [
    "all",
    ...new Set(ingredients.map((item) => item.category)),
  ];

  // Filter ingredients based on search term and category
  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = ingredient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Inventory Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your restaurant ingredients
          </p>
        </div>

        <Button className="mt-4 md:mt-0" size="sm">
          <FiPlus className="mr-2" />
          Add Ingredient
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              className="pl-10"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Ingredients Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIngredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">
                    {ingredient.name}
                  </TableCell>
                  <TableCell>{ingredient.category}</TableCell>
                  <TableCell
                    className={
                      ingredient.quantity <= ingredient.reorderLevel
                        ? "text-red-600 font-medium"
                        : ""
                    }
                  >
                    {ingredient.quantity} {ingredient.unit}
                  </TableCell>
                  <TableCell>
                    {ingredient.reorderLevel} {ingredient.unit}
                  </TableCell>
                  <TableCell>${ingredient.cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
