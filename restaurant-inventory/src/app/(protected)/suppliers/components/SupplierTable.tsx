"use client";

import { useState } from "react";
import { Supplier, SupplierCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiEdit2, FiTrash2, FiMail, FiPhone, FiStar } from "react-icons/fi";
import { format } from "date-fns";
import Image from "next/image";

// Define category colors for badges
const categoryColors: Record<SupplierCategory, string> = {
  [SupplierCategory.MEAT]: "bg-red-100 text-red-800 border-red-200",
  [SupplierCategory.DAIRY]: "bg-blue-100 text-blue-800 border-blue-200",
  [SupplierCategory.VEGETABLES]: "bg-green-100 text-green-800 border-green-200",
  [SupplierCategory.FRUITS]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [SupplierCategory.BEVERAGES]:
    "bg-purple-100 text-purple-800 border-purple-200",
  [SupplierCategory.BAKERY]: "bg-amber-100 text-amber-800 border-amber-200",
  [SupplierCategory.SEAFOOD]: "bg-cyan-100 text-cyan-800 border-cyan-200",
  [SupplierCategory.DRY_GOODS]:
    "bg-orange-100 text-orange-800 border-orange-200",
  [SupplierCategory.OTHER]: "bg-gray-100 text-gray-800 border-gray-200",
};

interface SupplierTableProps {
  suppliers: Supplier[];
  onEditClick: (supplier: Supplier) => void;
  onDeleteClick: (supplier: Supplier) => void;
  onBulkAction?: (action: string, suppliers: Supplier[]) => void;
  selectedCategory?: SupplierCategory | null;
  onCategoryFilterChange?: (category: SupplierCategory | null) => void;
}

export default function SupplierTable({
  suppliers,
  onEditClick,
  onDeleteClick,
  onBulkAction,
  selectedCategory,
  onCategoryFilterChange,
}: SupplierTableProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(
    new Set()
  );

  const handleSelectAll = () => {
    if (selectedSuppliers.size === suppliers.length) {
      setSelectedSuppliers(new Set());
    } else {
      setSelectedSuppliers(new Set(suppliers.map((s) => s.id)));
    }
  };

  const handleSelectSupplier = (supplierId: string) => {
    const newSelected = new Set(selectedSuppliers);
    if (newSelected.has(supplierId)) {
      newSelected.delete(supplierId);
    } else {
      newSelected.add(supplierId);
    }
    setSelectedSuppliers(newSelected);
  };

  const handleBulkAction = (action: string) => {
    const selectedSuppliersList = suppliers.filter((s) =>
      selectedSuppliers.has(s.id)
    );
    onBulkAction?.(action, selectedSuppliersList);
  };

  // Get unique categories from all suppliers for filtering
  const uniqueCategories = Array.from(
    new Set(suppliers.flatMap((s) => s.categories))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Bulk actions bar */}
      {selectedSuppliers.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-blue-700">
            {selectedSuppliers.size} supplier
            {selectedSuppliers.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("export")}
              className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
            >
              Export Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("delete")}
              className="bg-white hover:bg-red-50 border-red-200 text-red-600"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Category filters */}
      {uniqueCategories.length > 0 && onCategoryFilterChange && (
        <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Filter by category:
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryFilterChange(null)}
                className={`rounded-full px-4 ${
                  selectedCategory === null
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
              >
                All
              </Button>
              {uniqueCategories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className={`cursor-pointer text-xs py-1.5 px-3 rounded-full transition-all ${
                    selectedCategory === category
                      ? `${
                          categoryColors[category as SupplierCategory]
                        } font-medium shadow-sm`
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    onCategoryFilterChange(category as SupplierCategory)
                  }
                >
                  {category.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[50px] py-3">
                <CustomCheckbox
                  checked={selectedSuppliers.size === suppliers.length}
                  onCheckedChange={handleSelectAll}
                  className="ml-2"
                />
              </TableHead>
              <TableHead className="min-w-[200px] py-3 font-medium text-gray-700">
                Name
              </TableHead>
              <TableHead className="py-3 font-medium text-gray-700">
                Categories
              </TableHead>
              <TableHead className="py-3 font-medium text-gray-700">
                Contact
              </TableHead>
              <TableHead className="py-3 font-medium text-gray-700">
                Status
              </TableHead>
              <TableHead className="py-3 font-medium text-gray-700">
                Last Order Date
              </TableHead>
              <TableHead className="py-3 text-center font-medium text-gray-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-gray-500"
                >
                  No suppliers found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="py-4">
                    <CustomCheckbox
                      checked={selectedSuppliers.has(supplier.id)}
                      onCheckedChange={() => handleSelectSupplier(supplier.id)}
                      className="ml-2"
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      {supplier.logo ? (
                        <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                          <Image
                            src={supplier.logo}
                            alt={supplier.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
                          <span className="text-lg font-medium text-blue-700">
                            {supplier.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-900">
                            {supplier.name}
                          </span>
                          {supplier.isPreferred && (
                            <FiStar
                              className="h-4 w-4 text-yellow-400 fill-current"
                              title="Preferred Supplier"
                            />
                          )}
                        </div>
                        {supplier.contactName && (
                          <span className="text-sm text-gray-500">
                            {supplier.contactName}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {supplier.categories.map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className={`text-xs py-1 px-2 rounded-md ${
                            categoryColors[category as SupplierCategory]
                          }`}
                        >
                          {category.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-2">
                      {supplier.email && (
                        <a
                          href={`mailto:${supplier.email}`}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <FiMail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {supplier.email}
                        </a>
                      )}
                      {supplier.phone && (
                        <a
                          href={`tel:${supplier.phone}`}
                          className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                        >
                          <FiPhone className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {supplier.phone}
                        </a>
                      )}
                      {!supplier.email && !supplier.phone && (
                        <span className="text-sm text-gray-400 italic">
                          No contact info
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={
                        supplier.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        supplier.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-gray-700">
                    {supplier.lastOrderDate
                      ? format(new Date(supplier.lastOrderDate), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => onEditClick(supplier)}
                        title="Edit supplier"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => onDeleteClick(supplier)}
                        title="Delete supplier"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
