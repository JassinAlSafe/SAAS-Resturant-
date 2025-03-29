"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableHeader } from "@/components/ui/data-table/data-table-header";
import { DataTableActions } from "@/components/ui/data-table/data-table-actions";
import {
  ChevronDown,
  ChevronRight,
  Package,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onDuplicate?: (item: T) => void;
  onArchive?: (item: T) => Promise<void>;
  expandable?: boolean;
  expandedContent?: (item: T) => React.ReactNode;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  isArchived?: boolean;
  className?: string;
  emptyMessage?: string;
  rowClassName?: (item: T) => string;
  tableHeaderClassName?: string;
  tableCellClassName?: string;
  tableBodyClassName?: string;
  checkboxClassName?: string;
  paginationClassName?: string;
  actionButtonsClassName?: string;
  title?: string;
  description?: string;
  lowStockIndicator?: (item: T) => boolean;
  lowStockMessage?: string;
  statCards?: React.ReactNode;
  filterOptions?: {
    field: keyof T;
    label: string;
    countField?: keyof T;
  };
  compactMode?: boolean;
  onCompactModeChange?: (isCompact: boolean) => void;
  searchComponent?: React.ReactNode;
  extraControls?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  onRowClick,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  expandable = false,
  expandedContent,
  selectable = false,
  onSelectionChange,
  isArchived = false,
  className,
  emptyMessage = "No data available",
  rowClassName,
  tableHeaderClassName,
  tableCellClassName,
  tableBodyClassName,
  checkboxClassName,
  paginationClassName,
  actionButtonsClassName,
  title = "Data Overview",
  description,
  lowStockIndicator,
  lowStockMessage = "Some items need attention",
  statCards,
  filterOptions,
  compactMode: externalCompactMode,
  onCompactModeChange,
  searchComponent,
  extraControls,
}: DataTableProps<T>) {
  // State for sorting
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // State for selected rows
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // State for compact mode if not controlled externally
  const [internalCompactMode, setInternalCompactMode] = useState(false);
  const compactMode =
    externalCompactMode !== undefined
      ? externalCompactMode
      : internalCompactMode;

  // State for filter
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField as keyof T];
      const bValue = b[sortField as keyof T];

      if (aValue === bValue) return 0;

      // Handle null or undefined values
      if (aValue == null) return sortDirection === "asc" ? -1 : 1;
      if (bValue == null) return sortDirection === "asc" ? 1 : -1;

      // Compare based on type
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Numeric comparison
      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [data, sortField, sortDirection]);

  // Filter data
  const filteredData = React.useMemo(() => {
    if (!filterOptions || !activeFilter) return sortedData;

    return sortedData.filter(
      (item) => String(item[filterOptions.field]) === activeFilter
    );
  }, [sortedData, filterOptions, activeFilter]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    const newSelectedRows = {
      ...selectedRows,
      [id]: !selectedRows[id],
    };
    setSelectedRows(newSelectedRows);

    if (onSelectionChange) {
      const selectedItems = data.filter(
        (item) => newSelectedRows[String(item[keyField])]
      );
      onSelectionChange(selectedItems);
    }
  };

  // Toggle all rows selection
  const toggleAllRows = () => {
    const allSelected = paginatedData.every(
      (item) => selectedRows[String(item[keyField])]
    );

    const newSelectedRows = { ...selectedRows };

    paginatedData.forEach((item) => {
      newSelectedRows[String(item[keyField])] = !allSelected;
    });

    setSelectedRows(newSelectedRows);

    if (onSelectionChange) {
      const selectedItems = data.filter(
        (item) => newSelectedRows[String(item[keyField])]
      );
      onSelectionChange(selectedItems);
    }
  };

  // Calculate filter options if provided
  const filterItems = React.useMemo(() => {
    if (!filterOptions) return [];

    const uniqueValues = [
      ...new Set(data.map((item) => String(item[filterOptions.field]))),
    ].sort();

    return uniqueValues.map((value) => ({
      value,
      label: value,
      count: data.filter((item) => String(item[filterOptions.field]) === value)
        .length,
    }));
  }, [data, filterOptions]);

  // Check for low stock items if indicator provided
  const lowStockItems = React.useMemo(() => {
    if (!lowStockIndicator) return [];
    return data.filter((item) => lowStockIndicator(item));
  }, [data, lowStockIndicator]);

  const hasLowStockItems = lowStockItems.length > 0;

  // Handle compact mode change
  const handleCompactModeChange = (isCompact: boolean) => {
    if (onCompactModeChange) {
      onCompactModeChange(isCompact);
    } else {
      setInternalCompactMode(isCompact);
    }
  };

  // Render sort indicator function for headers
  const renderSortIndicator = (columnId: string) => {
    if (sortField !== columnId) return null;

    return sortDirection === "asc" ? (
      <ChevronDown className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1 transform rotate-180" />
    );
  };

  // Empty state
  if (data.length === 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16 bg-base-100 rounded-lg border border-base-300"
          role="alert"
          aria-live="polite"
        >
          <Package
            className="mx-auto h-16 w-16 text-base-content/50"
            aria-hidden="true"
          />
          <h3 className="mt-6 text-xl font-medium">{emptyMessage}</h3>
          <p className="mt-2 text-sm text-base-content max-w-md mx-auto">
            No items match your current filters. Try adjusting your search
            criteria or selection.
          </p>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className={cn("w-full h-full flex flex-col space-y-4", className)}>
      <div className="grid grid-cols-1 gap-8 rounded-lg border border-gray-200 bg-white p-6">
        {/* Section 1: Summary Statistics (Top Area) */}
        <section className="w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-2 flex items-center justify-between"
          >
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {description && (
              <div className="text-sm text-gray-500">{description}</div>
            )}
          </motion.div>

          {/* Low stock warning banner */}
          <AnimatePresence>
            {hasLowStockItems && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-center gap-2"
                role="alert"
              >
                <AlertTriangle
                  className="h-5 w-5 text-amber-500"
                  aria-hidden="true"
                />
                <span className="text-amber-800">
                  <strong>{lowStockItems.length}</strong>{" "}
                  {lowStockItems.length === 1 ? "item" : "items"}{" "}
                  {lowStockMessage}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Cards */}
          {statCards && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {statCards}
            </motion.div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 w-full my-1" />

        {/* Section 2: Data Table (Bottom Area) */}
        <section className="w-full">
          <div className="flex flex-col gap-4">
            {/* Table Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col md:flex-row md:justify-between gap-3"
            >
              <div className="flex flex-wrap gap-2">
                {searchComponent}

                {/* Filter buttons */}
                {filterOptions && filterItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveFilter(null)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-md border",
                        activeFilter === null
                          ? "bg-gray-100 border-gray-300"
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      All
                      <span className="ml-2 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                        {data.length}
                      </span>
                    </button>

                    {filterItems.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setActiveFilter(item.value)}
                        className={cn(
                          "px-3 py-1 text-sm rounded-md border",
                          activeFilter === item.value
                            ? "bg-gray-100 border-gray-300"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {item.label}
                        <span className="ml-2 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                          {item.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Compact mode toggle */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="compact-mode"
                    className="text-sm text-gray-500"
                  >
                    Compact
                  </label>
                  <input
                    id="compact-mode"
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => handleCompactModeChange(e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                </div>

                {extraControls}
              </div>
            </motion.div>

            {/* Full-width Table with traditional styling */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="overflow-hidden flex-1 rounded-lg border border-neutral-100"
            >
              <Table>
                <TableHeader
                  className={cn("bg-neutral-50", tableHeaderClassName)}
                >
                  <TableRow className="border-b border-neutral-100">
                    {selectable && (
                      <TableHead className="w-12 py-3">
                        <CustomCheckbox
                          checked={
                            paginatedData.length > 0 &&
                            paginatedData.every(
                              (item) => selectedRows[String(item[keyField])]
                            )
                          }
                          onCheckedChange={toggleAllRows}
                          aria-label="Select all"
                          className={cn("justify-center", checkboxClassName)}
                        />
                      </TableHead>
                    )}
                    {expandable && <TableHead className="w-12 py-3" />}
                    {columns.map((column) => (
                      <TableHead
                        key={column.id}
                        className="py-3 px-4 text-neutral-600 text-xs uppercase font-medium tracking-wider"
                      >
                        <DataTableHeader
                          label={column.header}
                          field={column.id}
                          sortable={column.sortable ?? false}
                          sortField={sortField}
                          sortDirection={sortDirection}
                          handleSort={handleSort}
                          className="text-left"
                        />
                      </TableHead>
                    ))}
                    {(onEdit || onDelete || onDuplicate || onArchive) && (
                      <TableHead className="w-[80px] py-3 px-4 text-neutral-600 text-xs uppercase font-medium tracking-wider">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody
                  className={cn(
                    "divide-y divide-neutral-100",
                    tableBodyClassName
                  )}
                >
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          columns.length +
                          (selectable ? 1 : 0) +
                          (expandable ? 1 : 0) +
                          (onEdit || onDelete || onDuplicate || onArchive
                            ? 1
                            : 0)
                        }
                        className="h-24 text-center text-neutral-500"
                      >
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((item) => {
                      const rowKey = String(item[keyField]);
                      const isExpanded = expandedRows[rowKey];
                      const isSelected = selectedRows[rowKey];
                      const isLowStock = lowStockIndicator
                        ? lowStockIndicator(item)
                        : false;

                      return (
                        <React.Fragment key={rowKey}>
                          <TableRow
                            className={cn(
                              "transition-colors hover:bg-neutral-50/80",
                              isSelected && "bg-blue-50/50",
                              isLowStock && "bg-amber-50/30",
                              compactMode ? "h-10" : "",
                              typeof rowClassName === "function" &&
                                rowClassName(item)
                            )}
                            onClick={
                              onRowClick ? () => onRowClick(item) : undefined
                            }
                          >
                            {selectable && (
                              <TableCell
                                className={cn("p-3", compactMode && "py-1")}
                              >
                                <CustomCheckbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    toggleRowSelection(rowKey)
                                  }
                                  aria-label={`Select row ${rowKey}`}
                                  className={checkboxClassName}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                            )}
                            {expandable && (
                              <TableCell
                                className={cn("p-3", compactMode && "py-1")}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpansion(rowKey);
                                  }}
                                  className="p-1 rounded-full hover:bg-neutral-100"
                                  aria-label={
                                    isExpanded ? "Collapse row" : "Expand row"
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-neutral-500" />
                                  )}
                                </button>
                              </TableCell>
                            )}
                            {columns.map((column) => (
                              <TableCell
                                key={`${rowKey}-${column.id}`}
                                className={cn(
                                  "px-4 py-3",
                                  compactMode && "py-1",
                                  tableCellClassName
                                )}
                              >
                                {column.cell
                                  ? column.cell(item)
                                  : column.accessorKey
                                  ? String(item[column.accessorKey] || "")
                                  : ""}
                              </TableCell>
                            ))}
                            {(onEdit ||
                              onDelete ||
                              onDuplicate ||
                              onArchive) && (
                              <TableCell
                                className={cn(
                                  "p-1 text-right",
                                  compactMode && "py-1"
                                )}
                              >
                                <DataTableActions
                                  onEdit={
                                    onEdit ? () => onEdit(item) : undefined
                                  }
                                  onDelete={
                                    onDelete ? () => onDelete(item) : undefined
                                  }
                                  onDuplicate={
                                    onDuplicate
                                      ? () => onDuplicate(item)
                                      : undefined
                                  }
                                  onArchive={
                                    onArchive
                                      ? () => onArchive(item)
                                      : undefined
                                  }
                                  isArchived={isArchived}
                                  className={actionButtonsClassName}
                                />
                              </TableCell>
                            )}
                          </TableRow>
                          {expandable && isExpanded && expandedContent && (
                            <TableRow className="bg-neutral-50/80">
                              <TableCell
                                colSpan={
                                  columns.length +
                                  (selectable ? 1 : 0) +
                                  (expandable ? 1 : 0) +
                                  (onEdit ||
                                  onDelete ||
                                  onDuplicate ||
                                  onArchive
                                    ? 1
                                    : 0)
                                }
                                className="p-0"
                              >
                                <div className="p-4 border-t border-neutral-100">
                                  {expandedContent(item)}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </motion.div>

            {/* Pagination */}
            {data.length > 0 && (
              <DataTablePagination
                currentPage={currentPage}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                className={paginationClassName}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
