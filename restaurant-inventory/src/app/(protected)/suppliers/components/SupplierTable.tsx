"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
import {
  FiEdit2,
  FiTrash2,
  FiMail,
  FiPhone,
  FiStar,
  FiUsers,
  FiLayout,
} from "react-icons/fi";
import { format } from "date-fns";
import Image from "next/image";

// Import new components
import { SupplierStatsDashboard } from "./table/SupplierStatsDashboard";
import { SupplierControls } from "./table/SupplierControls";
import { calculateSupplierStats } from "./table/supplierUtils";

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
  selectedCategory: SupplierCategory | null;
  onCategoryFilterChange: (category: SupplierCategory | null) => void;
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
  selectedCategory,
  onCategoryFilterChange,
  isLoading,
}: SupplierTableProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get supplier stats
  const stats = calculateSupplierStats(suppliers, selectedSuppliers);

  // Handle selection
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

  const clearSelection = () => {
    setSelectedSuppliers(new Set());
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedSuppliers.size === 0) return;

    try {
      const selectedSuppliersList = suppliers.filter((s) =>
        selectedSuppliers.has(s.id)
      );
      await onBulkAction(action, selectedSuppliersList);
      if (action === "delete") {
        clearSelection();
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  // Search handling
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      !searchQuery ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredSuppliers.length
  );
  const currentItems = filteredSuppliers.slice(startIndex, endIndex);

  // Empty state
  if (suppliers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-muted"
      >
        <FiUsers className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-6 text-xl font-medium">No suppliers found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          No suppliers match your current filters. Try adjusting your search
          criteria or category selection.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Main content area container with border */}
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs p-5 md:p-6">
        {/* Section 1: Summary Statistics (Top Area) */}
        <section className="w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Supplier Overview
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <FiLayout className="h-4 w-4 mr-2" />
              <span>Showing data for {suppliers.length} suppliers</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SupplierStatsDashboard stats={stats} isLoading={isLoading} />
          </motion.div>
        </section>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800 w-full my-1" />

        {/* Section 2: Data Table (Bottom Area) */}
        <section className="w-full">
          <div className="flex flex-col gap-4">
            {/* Table Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <SupplierControls
                selectedSuppliers={selectedSuppliers}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCategoryFilterChange={onCategoryFilterChange}
                clearSelection={clearSelection}
                onExport={() => handleBulkAction("export")}
                onImport={() => console.log("Import")}
                onPrint={() => console.log("Print")}
                onEmailSelected={() => handleBulkAction("email")}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Category filters */}
            {suppliers.length > 0 && onCategoryFilterChange && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-wrap gap-2 mb-4 pb-1"
                role="group"
                aria-label="Filter suppliers by category"
              >
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => onCategoryFilterChange(null)}
                  className={`rounded-full h-8 px-4 text-sm transition-all duration-200 ${
                    selectedCategory === null
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "bg-white hover:bg-slate-100 text-gray-700 border-slate-200"
                  }`}
                >
                  All
                </Button>
                {Array.from(new Set(suppliers.flatMap((s) => s.categories)))
                  .sort()
                  .map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className={`cursor-pointer py-1.5 px-3 rounded-full transition-all duration-200 ${
                        selectedCategory === category
                          ? `${
                              categoryColors[category as SupplierCategory]
                            } shadow-sm border`
                          : "bg-white hover:bg-slate-100 text-gray-700 border-slate-200"
                      }`}
                      onClick={() =>
                        onCategoryFilterChange(category as SupplierCategory)
                      }
                    >
                      {category.replace("_", " ")}
                    </Badge>
                  ))}
              </motion.div>
            )}

            {/* Suppliers Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl border shadow-xs overflow-hidden relative"
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Processing...
                    </span>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-900/30">
                    <TableRow className="border-b border-slate-200 hover:bg-transparent">
                      <TableHead className="w-[50px] py-4">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={
                              selectedSuppliers.size ===
                                filteredSuppliers.length &&
                              filteredSuppliers.length > 0
                            }
                            onChange={handleSelectAll}
                            aria-label={
                              selectedSuppliers.size ===
                              filteredSuppliers.length
                                ? "Deselect all suppliers"
                                : "Select all suppliers"
                            }
                          />
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[200px] py-4 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                        Name
                      </TableHead>
                      <TableHead className="py-4 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                        Categories
                      </TableHead>
                      <TableHead className="py-4 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                        Contact
                      </TableHead>
                      <TableHead className="py-4 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                        Status
                      </TableHead>
                      <TableHead className="py-4 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                        Last Order Date
                      </TableHead>
                      <TableHead className="py-4 text-center font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-16 text-slate-500"
                        >
                          <div className="flex flex-col items-center">
                            <div className="bg-slate-100 rounded-full h-12 w-12 flex items-center justify-center mb-3">
                              <FiUsers className="h-6 w-6 text-slate-400" />
                            </div>
                            <p>No suppliers found matching your search.</p>
                            <Button
                              variant="link"
                              onClick={() => {
                                setSearchQuery("");
                                if (onCategoryFilterChange) {
                                  onCategoryFilterChange(null);
                                }
                              }}
                              className="mt-2 text-blue-600"
                            >
                              Clear filters
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((supplier) => (
                        <TableRow
                          key={supplier.id}
                          className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                          data-supplier-id={supplier.id}
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={selectedSuppliers.has(supplier.id)}
                                onChange={() =>
                                  handleSelectSupplier(supplier.id)
                                }
                                aria-label={`Select ${supplier.name}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              {supplier.logo ? (
                                <div className="h-11 w-11 rounded-lg overflow-hidden border border-slate-200 shadow-xs shrink-0 bg-white">
                                  <Image
                                    src={supplier.logo}
                                    alt={`${supplier.name} logo`}
                                    width={44}
                                    height={44}
                                    className="object-cover h-full w-full"
                                  />
                                </div>
                              ) : (
                                <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shadow-xs shrink-0">
                                  <span className="text-lg font-semibold text-blue-600">
                                    {supplier.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {supplier.name}
                                  </span>
                                  {supplier.isPreferred && (
                                    <div className="group relative">
                                      <FiStar
                                        className="h-4 w-4 text-yellow-400 fill-current cursor-help"
                                        title="Preferred Supplier"
                                        aria-label="Preferred Supplier"
                                      />
                                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                                        Preferred Supplier
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {supplier.contactName && (
                                  <span className="text-sm text-slate-500">
                                    {supplier.contactName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {supplier.categories
                                .slice(0, 2)
                                .map((category) => (
                                  <Badge
                                    key={category}
                                    variant="outline"
                                    className={`text-xs py-1 px-2 rounded-md ${
                                      categoryColors[
                                        category as SupplierCategory
                                      ]
                                    }`}
                                  >
                                    {category.replace("_", " ")}
                                  </Badge>
                                ))}
                              {supplier.categories.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs py-1 px-2 rounded-md bg-slate-100 text-slate-700 cursor-help"
                                  title={supplier.categories
                                    .slice(2)
                                    .join(", ")
                                    .replace(/_/g, " ")}
                                >
                                  +{supplier.categories.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col gap-2">
                              {supplier.email && (
                                <a
                                  href={`mailto:${supplier.email}`}
                                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                  aria-label={`Send email to ${supplier.email}`}
                                >
                                  <div className="bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                                    <FiMail className="h-3.5 w-3.5 text-blue-600" />
                                  </div>
                                  <span className="truncate max-w-[160px]">
                                    {supplier.email}
                                  </span>
                                </a>
                              )}
                              {supplier.phone && (
                                <a
                                  href={`tel:${supplier.phone}`}
                                  className="flex items-center text-sm text-slate-700 hover:text-slate-900 transition-colors"
                                  aria-label={`Call ${supplier.phone}`}
                                >
                                  <div className="bg-slate-50 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                                    <FiPhone className="h-3.5 w-3.5 text-slate-600" />
                                  </div>
                                  {supplier.phone}
                                </a>
                              )}
                              {!supplier.email && !supplier.phone && (
                                <span className="text-sm text-slate-400 italic">
                                  No contact info
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant={
                                supplier.status === "ACTIVE"
                                  ? "default"
                                  : "secondary"
                              }
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                supplier.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800 border border-green-200 shadow-xs"
                                  : "bg-slate-100 text-slate-800 border border-slate-200"
                              }`}
                            >
                              {supplier.status === "ACTIVE" && (
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1.5"></span>
                              )}
                              {supplier.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-slate-700">
                            {supplier.lastOrderDate
                              ? format(
                                  new Date(supplier.lastOrderDate),
                                  "MMM d, yyyy"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex justify-center space-x-2">
                              <Button
                                variant="ghost"
                                className="h-9 w-9 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                onClick={() => onEditClick(supplier)}
                                title="Edit supplier"
                                aria-label={`Edit ${supplier.name}`}
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                className="h-9 w-9 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                onClick={() => onDeleteClick(supplier)}
                                title="Delete supplier"
                                aria-label={`Delete ${supplier.name}`}
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
            </motion.div>

            {/* Pagination Controls */}
            {filteredSuppliers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex-1">
                  Showing {startIndex + 1} to {endIndex} of{" "}
                  {filteredSuppliers.length} suppliers
                  {selectedSuppliers.size > 0 &&
                    ` (${selectedSuppliers.size} selected)`}
                </div>

                {totalPages > 1 && (
                  <nav
                    className="flex items-center gap-1"
                    aria-label="Pagination"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 border-slate-200"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      aria-label="First page"
                    >
                      <span className="sr-only">First page</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="11 17 6 12 11 7"></polyline>
                        <polyline points="18 17 13 12 18 7"></polyline>
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 border-slate-200"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <span className="sr-only">Previous page</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </Button>

                    <span className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
                      {currentPage} / {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 border-slate-200"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      <span className="sr-only">Next page</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 border-slate-200"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      aria-label="Last page"
                    >
                      <span className="sr-only">Last page</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="13 17 18 12 13 7"></polyline>
                        <polyline points="6 17 11 12 6 7"></polyline>
                      </svg>
                    </Button>

                    <select
                      className="ml-2 h-8 rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 px-2 text-xs text-slate-700 dark:text-slate-300"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      aria-label="Items per page"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </nav>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
