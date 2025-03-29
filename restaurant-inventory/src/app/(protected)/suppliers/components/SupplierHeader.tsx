"use client";

import { FiUsers, FiDownload, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Supplier, SupplierCategory } from "@/lib/types";
import SupplierSearch from "./SupplierSearch";

interface SupplierHeaderProps {
  onAddClick: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: SupplierCategory | null;
  onCategoryChange: (category: SupplierCategory | null) => void;
  isExporting?: boolean;
  onExportClick: () => void;
}

export default function SupplierHeader({
  onAddClick,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  isExporting,
  onExportClick,
}: SupplierHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            Supplier Management
            <div className="ml-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium rounded-md">
              Dashboard
            </div>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your suppliers and vendor relationships in one place
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={onExportClick}
            disabled={isExporting}
          >
            <FiDownload className="h-4 w-4 mr-1.5" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            onClick={onAddClick}
          >
            <FiPlus className="h-4 w-4 mr-1.5" />
            Add Supplier
          </Button>
        </div>
      </div>

      <SupplierSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />

      <div className="flex flex-wrap gap-2 mt-4">
        {Object.values(SupplierCategory).map((category) => (
          <button
            key={category}
            onClick={() =>
              onCategoryChange(selectedCategory === category ? null : category)
            }
            className={`btn btn-sm ${
              selectedCategory === category
                ? "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            } rounded-full px-3 py-1 text-xs font-medium transition-colors`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
