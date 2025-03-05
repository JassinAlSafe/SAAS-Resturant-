"use client";

import { Input } from "@/components/ui/input";
import { FiSearch } from "react-icons/fi";

interface SupplierSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SupplierSearch({
  searchTerm,
  onSearchChange,
}: SupplierSearchProps) {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex items-center">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search suppliers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
