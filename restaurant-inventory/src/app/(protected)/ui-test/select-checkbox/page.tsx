"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FiTag } from "react-icons/fi";

export default function SelectCheckboxTestPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isChecked, setIsChecked] = useState<boolean>(false);

  // Sample categories
  const categories = ["Meat", "Dairy", "Produce", "Bakery", "Seafood"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Select & Checkbox Components Test
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Select Component Test */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Select Component
          </h2>

          <div className="space-y-6">
            {/* Default Select */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Default Select
              </h3>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Styled Select */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Custom Styled Select
              </h3>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full border-gray-200">
                  <div className="flex items-center">
                    <FiTag className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Select a category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Value Display */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Selected Value:
              </h3>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {selectedCategory === "all"
                  ? "All Categories"
                  : categories.find(
                      (c) => c.toLowerCase() === selectedCategory
                    ) || selectedCategory}
              </Badge>
            </div>
          </div>
        </div>

        {/* Checkbox Component Test */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Checkbox Component
          </h2>

          <div className="space-y-6">
            {/* Default Checkbox */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Default Checkbox
              </h3>
              <div className="flex items-center space-x-2">
                <CustomCheckbox
                  id="default-checkbox"
                  checked={isChecked}
                  onCheckedChange={setIsChecked}
                />
                <Label htmlFor="default-checkbox">Show purchased items</Label>
              </div>
            </div>

            {/* Custom Styled Checkbox */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Purchased Style Checkbox
              </h3>
              <div className="flex items-center space-x-2">
                <CustomCheckbox
                  id="custom-checkbox"
                  variant="purchased"
                  checked={true}
                  disabled
                />
                <Label htmlFor="custom-checkbox" className="text-gray-700">
                  Purchased item (disabled)
                </Label>
              </div>
            </div>

            {/* Checkbox State */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Checkbox State:
              </h3>
              <Badge
                className={
                  isChecked
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }
              >
                {isChecked ? "Checked" : "Unchecked"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Category Badges Test */}
      <div className="bg-white p-6 rounded-lg border shadow-sm mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Category Badges
        </h2>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={`cursor-pointer text-xs py-1.5 px-3 rounded-full ${
              selectedCategory === "all"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : "bg-gray-50"
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className={`cursor-pointer text-xs py-1.5 px-3 rounded-full ${
                selectedCategory === category.toLowerCase()
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-gray-50"
              }`}
              onClick={() => setSelectedCategory(category.toLowerCase())}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
