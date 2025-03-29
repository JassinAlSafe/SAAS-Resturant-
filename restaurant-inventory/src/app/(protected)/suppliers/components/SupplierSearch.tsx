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
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
        <FiSearch className="h-4 w-4" />
      </div>
      <Input
        placeholder="Search suppliers by name, email, or phone..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-11 border-orange-200 bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 rounded-lg w-full"
      />
    </div>
  );
}
