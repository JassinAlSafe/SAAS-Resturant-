"use client";

import { ShoppingCart } from "lucide-react";

export default function ShoppingListLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="skeleton w-16 h-16 rounded-lg"></div>
            <div>
              <div className="skeleton h-8 w-64 mb-2"></div>
              <div className="skeleton h-4 w-32"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="skeleton h-10 w-24 rounded-md"></div>
            <div className="skeleton h-10 w-24 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="skeleton h-4 w-24 mb-2"></div>
                  <div className="skeleton h-8 w-16"></div>
                </div>
                <div className="skeleton w-10 h-10 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search/Filter Bar Skeleton */}
      <div className="card bg-base-100 shadow mb-6 animate-pulse">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="skeleton h-12 w-full sm:w-2/3 rounded"></div>
            <div className="skeleton h-12 w-full sm:w-1/3 rounded"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table Skeleton */}
        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow animate-pulse">
            <div className="card-body p-0">
              <div className="p-4 border-b">
                <div className="flex justify-between mb-1">
                  <div className="skeleton h-4 w-32"></div>
                  <div className="skeleton h-4 w-16"></div>
                </div>
                <div className="skeleton h-4 w-full"></div>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <div className="skeleton h-4 w-4"></div>
                      </th>
                      <th>
                        <div className="skeleton h-4 w-32"></div>
                      </th>
                      <th>
                        <div className="skeleton h-4 w-12"></div>
                      </th>
                      <th>
                        <div className="skeleton h-4 w-20"></div>
                      </th>
                      <th>
                        <div className="skeleton h-4 w-16"></div>
                      </th>
                      <th>
                        <div className="skeleton h-4 w-12"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`row-${i}`}>
                        <td>
                          <div className="skeleton h-4 w-4"></div>
                        </td>
                        <td>
                          <div>
                            <div className="skeleton h-4 w-40 mb-1"></div>
                            <div className="skeleton h-3 w-24"></div>
                          </div>
                        </td>
                        <td>
                          <div className="skeleton h-6 w-12 rounded-full"></div>
                        </td>
                        <td>
                          <div className="skeleton h-6 w-16 rounded-full"></div>
                        </td>
                        <td>
                          <div className="skeleton h-4 w-12"></div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <div className="skeleton h-8 w-8 rounded"></div>
                            <div className="skeleton h-8 w-8 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t">
                <div className="flex justify-between">
                  <div className="skeleton h-4 w-32"></div>
                  <div className="skeleton h-4 w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card Skeleton */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow animate-pulse">
            <div className="card-body">
              <div className="skeleton h-6 w-40 mb-4"></div>

              <div className="stats stats-vertical bg-base-200 w-full mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`stat-mini-${i}`} className="stat">
                    <div className="skeleton h-4 w-16 mb-1"></div>
                    <div className="skeleton h-6 w-12"></div>
                  </div>
                ))}
              </div>

              <div className="skeleton h-4 w-32 mb-2"></div>
              <div className="skeleton h-4 w-full mb-4"></div>

              <div className="skeleton h-6 w-40 mb-3"></div>
              <div className="skeleton h-10 w-full mb-2"></div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
