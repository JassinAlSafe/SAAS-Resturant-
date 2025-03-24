"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FiShoppingCart } from "react-icons/fi";

export default function ShoppingListLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"
            aria-hidden="true"
          >
            <FiShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </header>

      {/* Summary Cards */}
      <section className="bg-white p-6 rounded-lg border shadow-sm mb-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`summary-card-${i}`}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Skeleton className="h-10 w-full md:w-2/3 rounded-md" />
          <Skeleton className="h-10 w-full md:w-1/3 rounded-md" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={`filter-chip-${i}`}
              className="h-6 w-16 rounded-full"
            />
          ))}
        </div>
        <Skeleton className="h-5 w-40 rounded-md" />
      </section>

      {/* Table/List Section */}
      <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-7 gap-2 pb-3 border-b border-gray-100 font-medium text-sm text-gray-500">
            <div className="col-span-1">
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-6 w-32 rounded-md" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="space-y-4 mt-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`item-row-${index}`}
                className="grid grid-cols-2 md:grid-cols-7 gap-2 py-2 items-center border-b border-gray-100 last:border-0"
              >
                <div className="col-span-1 flex items-center">
                  <Skeleton className="h-5 w-5 rounded-md" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Skeleton className="h-5 w-full max-w-xs rounded-md" />
                  <Skeleton className="h-4 w-24 mt-1 md:hidden" />
                </div>
                <div className="hidden md:block md:col-span-1">
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
                <div className="hidden md:block md:col-span-1">
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <div className="hidden md:block md:col-span-1">
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <div className="col-span-1 flex justify-end md:justify-between">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between items-center">
            <Skeleton className="h-5 w-32 rounded-md" />
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={`page-${i}`} className="h-8 w-8 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
