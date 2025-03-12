"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FiUsers } from "react-icons/fi";

export default function SupplierLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <FiUsers className="h-6 w-6 text-blue-500 opacity-60" />
          </div>
          <div>
            <Skeleton className="h-8 w-64 mb-2 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <Skeleton className="h-11 w-28 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden p-4">
          <Skeleton className="h-11 w-full max-w-md rounded-lg" />
        </div>
      </div>

      <div className="bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 flex items-center gap-2 border-b border-gray-100">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-1">
                  <Skeleton className="h-6 w-6 rounded-md" />
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-40 mb-2 rounded-md" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                  <div className="w-32 hidden sm:block">
                    <Skeleton className="h-6 w-28 mb-1 rounded-md" />
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-md hidden sm:block" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
