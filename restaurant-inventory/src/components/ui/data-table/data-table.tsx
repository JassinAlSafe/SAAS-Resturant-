"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableHeader } from "./data-table-header";
import { DataTableActions } from "./data-table-actions";
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
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    const newSelectedRows = {
      ...selectedRows,
      [id]: !selectedRows[id]
    };
    setSelectedRows(newSelectedRows);
    
    if (onSelectionChange) {
      const selectedItems = data.filter(
        item => newSelectedRows[String(item[keyField])]
      );
      onSelectionChange(selectedItems);
    }
  };

  // Toggle all rows selection
  const toggleAllRows = () => {
    const allSelected = paginatedData.every(
      item => selectedRows[String(item[keyField])]
    );
    
    const newSelectedRows = { ...selectedRows };
    
    paginatedData.forEach(item => {
      newSelectedRows[String(item[keyField])] = !allSelected;
    });
    
    setSelectedRows(newSelectedRows);
    
    if (onSelectionChange) {
      const selectedItems = data.filter(
        item => newSelectedRows[String(item[keyField])]
      );
      onSelectionChange(selectedItems);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every(
                        item => selectedRows[String(item[keyField])]
                      )
                    }
                    onCheckedChange={toggleAllRows}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {expandable && <TableHead className="w-12" />}
              {columns.map(column => (
                <TableHead key={column.id}>
                  <DataTableHeader
                    label={column.header}
                    field={column.id}
                    sortable={column.sortable ?? false}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </TableHead>
              ))}
              {(onEdit || onDelete || onDuplicate || onArchive) && (
                <TableHead className="w-24 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (expandable ? 1 : 0) +
                    ((onEdit || onDelete || onDuplicate || onArchive) ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => {
                const id = String(item[keyField]);
                const isExpanded = expandedRows[id] || false;
                
                return (
                  <React.Fragment key={id}>
                    <TableRow
                      className={cn(
                        "group hover:bg-slate-50 dark:hover:bg-slate-900/50",
                        rowClassName && rowClassName(item)
                      )}
                      onClick={onRowClick ? () => onRowClick(item) : undefined}
                    >
                      {selectable && (
                        <TableCell
                          className="w-12"
                          onClick={e => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedRows[id] || false}
                            onCheckedChange={() => toggleRowSelection(id)}
                            aria-label={`Select row ${index + 1}`}
                          />
                        </TableCell>
                      )}
                      {expandable && (
                        <TableCell
                          className="w-12 cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            toggleRowExpansion(id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                      )}
                      {columns.map(column => (
                        <TableCell key={column.id}>
                          {column.cell
                            ? column.cell(item)
                            : column.accessorKey
                            ? String(item[column.accessorKey] || "")
                            : ""}
                        </TableCell>
                      ))}
                      {(onEdit || onDelete || onDuplicate || onArchive) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100">
                            <DataTableActions
                              item={item}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onDuplicate={onDuplicate}
                              onArchive={onArchive}
                              isArchived={isArchived}
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                    {expandable && isExpanded && expandedContent && (
                      <TableRow className="bg-slate-50/50 dark:bg-slate-900/20">
                        <TableCell
                          colSpan={
                            columns.length +
                            (selectable ? 1 : 0) +
                            1 + // Expansion column
                            ((onEdit || onDelete || onDuplicate || onArchive) ? 1 : 0)
                          }
                          className="p-4"
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
      <DataTablePagination
        currentPage={currentPage}
        totalItems={sortedData.length}
        pageSize={itemsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setItemsPerPage}
      />
    </div>
  );
}
