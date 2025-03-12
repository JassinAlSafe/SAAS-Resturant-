"use client";

import { Input } from "@/components/ui/input";
import { FiSearch, FiFilter } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface SupplierSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SupplierSearch({
  searchTerm,
  onSearchChange,
}: SupplierSearchProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FiSearch className="h-4 w-4" />
          </div>
          <Input
            placeholder="Search suppliers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 rounded-lg w-full"
          />
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <FiFilter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
