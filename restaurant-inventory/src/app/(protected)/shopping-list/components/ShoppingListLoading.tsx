"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FiShoppingCart } from "react-icons/fi";

export default function ShoppingListLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FiShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="bg-white p-6 rounded-lg border shadow-xs mb-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white p-4 rounded-lg border shadow-xs mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Skeleton className="h-10 w-full md:w-2/3 rounded-md" />
          <Skeleton className="h-10 w-full md:w-1/3 rounded-md" />
        </div>
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-40 rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border shadow-xs overflow-hidden">
        <div className="p-4">
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-40 mb-1 rounded-md" />
                </div>
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
