"use client";

import React, { useState } from "react";
import { Supplier, SupplierCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Trash } from "lucide-react";
import { FiEdit2, FiTrash2, FiMail, FiPhone, FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format, isValid } from "date-fns";
import { BatchOperations, BatchAction } from "@/components/ui/batch-operations/batch-operations";

// Define category colors for badges
const categoryColors: Record<SupplierCategory, string> = {
  [SupplierCategory.MEAT]:
    "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  [SupplierCategory.DAIRY]:
    "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  [SupplierCategory.VEGETABLES]:
    "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  [SupplierCategory.FRUITS]:
    "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  [SupplierCategory.BEVERAGES]:
    "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  [SupplierCategory.BAKERY]:
    "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
  [SupplierCategory.SEAFOOD]:
    "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200",
  [SupplierCategory.DRY_GOODS]:
    "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  [SupplierCategory.OTHER]:
    "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
};

interface SupplierTableProps {
  suppliers: Supplier[];
  onEditClick: (supplier: Supplier) => void;
  onDeleteClick: (supplier: Supplier) => void;
  onBulkAction: (action: string, suppliers: Supplier[]) => Promise<void>;
  isLoading?: boolean;
  isDeleting?: boolean;
  isBulkDeleting?: boolean;
  isExporting?: boolean;
}

export default function SupplierTable({
  suppliers,
  onEditClick,
  onDeleteClick,
  onBulkAction,
  isDeleting,
  isBulkDeleting,
  isExporting,
}: SupplierTableProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination values
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, suppliers.length);
  const currentItems = suppliers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(suppliers.length / itemsPerPage);

  // Handle selection of a supplier
  const handleSelectSupplier = (id: string) => {
    const newSelected = new Set(selectedSuppliers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSuppliers(newSelected);
  };

  // Handle select all suppliers
  const handleSelectAll = () => {
    if (selectedSuppliers.size === suppliers.length) {
      setSelectedSuppliers(new Set());
    } else {
      const allIds = suppliers.map((supplier) => supplier.id);
      setSelectedSuppliers(new Set(allIds));
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedSuppliers(new Set());
  };

  // Define batch actions
  const batchActions: BatchAction[] = [
    {
      id: "export",
      label: "Export",
      icon: Download,
      variant: "outline",
      onClick: async (selectedIds) => {
        if (isExporting) return; // Prevent action if export is in progress
        const selectedSupplierObjects = suppliers.filter((supplier) => 
          selectedIds.includes(supplier.id)
        );
        await onBulkAction("export", selectedSupplierObjects);
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash,
      variant: "error",
      requireConfirmation: true,
      confirmationProps: {
        title: "Delete Selected Suppliers",
        description: `Are you sure you want to delete ${selectedSuppliers.size} supplier${selectedSuppliers.size > 1 ? "s" : ""}? This action cannot be undone.`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      },
      onClick: async (selectedIds) => {
        if (isBulkDeleting) return; // Prevent action if bulk delete is in progress
        const selectedSupplierObjects = suppliers.filter((supplier) => 
          selectedIds.includes(supplier.id)
        );
        await onBulkAction("delete", selectedSupplierObjects);
      },
    },
  ];

  // Format date safely
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    if (!isValid(date)) return "Invalid date";
    
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="space-y-4">
      {/* Batch Operations */}
      <BatchOperations
        selectedIds={Array.from(selectedSuppliers)}
        actions={batchActions}
        onClearSelection={clearSelection}
        selectionLabel="Supplier"
        position="bottom"
        className="z-40"
      />

      {/* Main table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={
                    suppliers.length > 0 &&
                    selectedSuppliers.size === suppliers.length
                  }
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((supplier) => (
              <TableRow
                key={supplier.id}
                className={
                  selectedSuppliers.has(supplier.id)
                    ? "bg-orange-50"
                    : "hover:bg-gray-50"
                }
              >
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={selectedSuppliers.has(supplier.id)}
                    onChange={() => handleSelectSupplier(supplier.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-orange-100 text-orange-800 rounded-full w-10 h-10 flex items-center justify-center">
                        <span className="text-lg font-medium">
                          {supplier.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-xs text-gray-500">
                        Added {formatDate(supplier.createdAt)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {supplier.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        <span>{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <FiPhone className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {supplier.categories && supplier.categories.length > 0 && (
                    <Badge
                      className={`${
                        categoryColors[supplier.categories[0]]
                      } border px-2.5 py-0.5 text-xs font-medium`}
                    >
                      {supplier.categories[0].replace("_", " ")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="badge badge-success gap-1">
                      <FiCheck className="h-3 w-3" />
                      Active
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-orange-600"
                      onClick={() => onEditClick(supplier)}
                    >
                      <FiEdit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() => onDeleteClick(supplier)}
                      disabled={isDeleting}
                    >
                      <FiTrash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{endIndex} of {suppliers.length} suppliers
          </div>
          <div className="join">
            <Button
              variant="outline"
              size="sm"
              className="join-item"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={`join-item ${
                  currentPage === page
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="join-item"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
