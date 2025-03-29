"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (pageSize: number) => void;
  className?: string;
}

export function DataTablePagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Calculate range of items being displayed
  const startItem = Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1);
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-4 border-t border-neutral-100",
        className
      )}
    >
      <div className="flex-1 text-sm text-neutral-500">
        {totalItems > 0 ? (
          <p>
            Showing{" "}
            <span className="font-medium text-neutral-700">{startItem}</span> to{" "}
            <span className="font-medium text-neutral-700">{endItem}</span> of{" "}
            <span className="font-medium text-neutral-700">{totalItems}</span>{" "}
            items
          </p>
        ) : (
          <p>No items</p>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-neutral-700">Rows per page</p>
          <select
            value={String(itemsPerPage)}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="select select-bordered select-sm w-[70px] bg-white border-neutral-200 rounded-md focus:border-orange-500 focus:outline-none"
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={String(size)}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium text-neutral-700">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="btn btn-sm btn-outline btn-square hidden lg:flex border-neutral-200 text-neutral-700 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            className="btn btn-sm btn-outline btn-square border-neutral-200 text-neutral-700 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="btn btn-sm btn-outline btn-square border-neutral-200 text-neutral-700 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="btn btn-sm btn-outline btn-square hidden lg:flex border-neutral-200 text-neutral-700 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
