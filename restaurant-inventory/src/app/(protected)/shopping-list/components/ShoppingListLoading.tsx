"use client";

import { ShoppingCart } from "lucide-react";

export default function ShoppingListLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 w-16 h-16 rounded-lg"></div>
            <div>
              <div className="bg-gray-200 h-8 w-64 mb-2 rounded"></div>
              <div className="bg-gray-200 h-4 w-32 rounded"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-gray-200 h-10 w-24 rounded-md"></div>
            <div className="bg-orange-100 h-10 w-24 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="bg-gray-200 h-4 w-24 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-8 w-16 rounded"></div>
                </div>
                <div className="bg-orange-100 w-10 h-10 rounded-full"></div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-200 h-2 w-full rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search/Filter Bar Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 animate-pulse">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gray-200 h-12 w-full sm:w-2/3 rounded"></div>
            <div className="bg-gray-200 h-12 w-full sm:w-1/3 rounded"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table Skeleton */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
            <div className="p-0">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between mb-1">
                  <div className="bg-gray-200 h-4 w-32 rounded"></div>
                  <div className="bg-orange-100 h-4 w-16 rounded"></div>
                </div>
                <div className="bg-gray-200 h-4 w-full mt-2 rounded"></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3">
                        <div className="bg-gray-200 h-4 w-4 rounded"></div>
                      </th>
                      <th className="p-3 text-left">
                        <div className="bg-gray-200 h-4 w-32 rounded"></div>
                      </th>
                      <th className="p-3 text-left">
                        <div className="bg-gray-200 h-4 w-12 rounded"></div>
                      </th>
                      <th className="p-3 text-left">
                        <div className="bg-gray-200 h-4 w-20 rounded"></div>
                      </th>
                      <th className="p-3 text-left">
                        <div className="bg-gray-200 h-4 w-16 rounded"></div>
                      </th>
                      <th className="p-3 text-left">
                        <div className="bg-gray-200 h-4 w-12 rounded"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`row-${i}`} className="border-b border-gray-100">
                        <td className="p-3 text-center">
                          <div className="bg-gray-200 h-4 w-4 rounded mx-auto"></div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="bg-gray-200 h-4 w-40 mb-1 rounded"></div>
                            <div className="bg-gray-200 h-3 w-24 rounded"></div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="bg-gray-200 h-6 w-12 rounded-full"></div>
                        </td>
                        <td className="p-3">
                          <div className="bg-orange-100 h-6 w-16 rounded-full"></div>
                        </td>
                        <td className="p-3">
                          <div className="bg-gray-200 h-4 w-12 rounded"></div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
                            <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between">
                  <div className="bg-gray-200 h-4 w-32 rounded"></div>
                  <div className="bg-gray-200 h-4 w-24 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
            <div className="p-5">
              <div className="bg-gray-200 h-6 w-40 mb-6 rounded"></div>

              <div className="space-y-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`stat-mini-${i}`} className="p-3 bg-gray-50 rounded-lg">
                    <div className="bg-gray-200 h-4 w-16 mb-2 rounded"></div>
                    <div className="bg-gray-200 h-6 w-12 rounded"></div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-200 h-4 w-32 mb-2 rounded"></div>
              <div className="bg-gray-200 h-4 w-full mb-4 rounded"></div>

              <div className="bg-gray-200 h-6 w-40 mb-4 rounded"></div>
              <div className="bg-orange-100 h-10 w-full mb-3 rounded-md"></div>
              <div className="bg-gray-200 h-10 w-full rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}