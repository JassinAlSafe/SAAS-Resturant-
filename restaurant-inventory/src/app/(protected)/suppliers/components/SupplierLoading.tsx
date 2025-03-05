"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FiUsers } from "react-icons/fi";

export default function SupplierLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FiUsers className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <Skeleton className="h-10 w-full max-w-md rounded-md" />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-40 mb-2 rounded-md" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
                <div className="w-32">
                  <Skeleton className="h-5 w-28 mb-1 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
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
