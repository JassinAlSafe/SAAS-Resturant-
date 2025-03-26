"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
// import { Checkbox } from "@/components/ui/checkbox";
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
import { ChevronDown, ChevronRight } from "lucide-react";

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

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

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

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader className={cn("bg-gray-50", tableHeaderClassName)}>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
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
              {expandable && <TableHead className="w-12" />}
              {columns.map((column) => (
                <TableHead key={column.id}>
                  <DataTableHeader
                    label={column.header}
                    field={column.id}
                    sortable={column.sortable ?? false}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                    className={cn("text-left", "py-4", "pl-4")}
                  />
                </TableHead>
              ))}
              {(onEdit || onDelete || onDuplicate || onArchive) && (
                <TableHead className="w-[80px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className={cn("divide-y", "divide-gray-100", tableBodyClassName)}>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (expandable ? 1 : 0) +
                    (onEdit || onDelete || onDuplicate || onArchive ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => {
                const rowKey = String(item[keyField]);
                const isExpanded = expandedRows[rowKey];
                const isSelected = selectedRows[rowKey];

                return (
                  <React.Fragment key={rowKey}>
                    <TableRow
                      className={cn(
                        rowClassName?.(item),
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(item)}
                    >
                      {selectable && (
                        <TableCell className={cn("w-12", tableCellClassName)}>
                          <CustomCheckbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRowSelection(rowKey)}
                            aria-label="Select row"
                            onClick={(e) => e.stopPropagation()}
                            className={cn("justify-center", checkboxClassName)}
                          />
                        </TableCell>
                      )}
                      {expandable && (
                        <TableCell className={cn("w-12", tableCellClassName)}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(rowKey);
                            }}
                            className="p-1"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          className={cn("py-4", "pl-4", tableCellClassName)}
                        >
                          {column.cell
                            ? column.cell(item)
                            : column.accessorKey
                            ? String(item[column.accessorKey] || "")
                            : ""}
                        </TableCell>
                      ))}
                      {(onEdit || onDelete || onDuplicate || onArchive) && (
                        <TableCell
                          className={cn("text-right", "py-4", "pr-4", tableCellClassName)}
                        >
                          {/* Create wrapper functions to handle passing the item to the action handlers */}
                          <DataTableActions
                            onEdit={onEdit ? () => onEdit(item) : undefined}
                            onDelete={onDelete ? () => onDelete(item) : undefined}
                            onDuplicate={onDuplicate ? () => onDuplicate(item) : undefined}
                            onArchive={onArchive ? () => onArchive(item) : undefined}
                            isArchived={isArchived}
                            className={actionButtonsClassName}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                    {expandable && isExpanded && expandedContent && (
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
                          className={cn("p-4", "bg-gray-50", tableCellClassName)}
                        >
                          {expandedContent(item)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {data.length > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={sortedData.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          className={cn("mt-4", paginationClassName)}
        />
      )}
    </div>
  );
}
