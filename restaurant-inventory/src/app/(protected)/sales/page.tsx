"use client";

import { useState, useCallback, Suspense } from "react";
import { Receipt, Calendar } from "lucide-react";
import dynamic from "next/dynamic";

// Add SalesPageData type
interface SalesPageData {
  sales: Array<{ id: string; date: string; total_amount: number }>;
}

// Dynamically import the components to improve initial page load performance
const SalesPage = dynamic(() => import("./components/SalesPage"), {
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
    </div>
  ),
});

const SalesHistoryView = dynamic(
  () => import("./components/SalesHistoryView"),
  {
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
      </div>
    ),
  }
);

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("daily");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_salesData, setSalesData] = useState<SalesPageData>({ sales: [] });

  const handleSalesDataUpdate = useCallback(
    (data: {
      sales: Array<{ id: string; date: string; total_amount: number }>;
    }) => {
      setSalesData((prev) => {
        // Only update if the data has actually changed
        if (JSON.stringify(prev.sales) !== JSON.stringify(data.sales)) {
          return data;
        }
        return prev;
      });
    },
    []
  );

  return (
    <div className="container mx-auto py-6 max-w-6xl px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Sales Management
        </h1>
        <p className="text-gray-600">
          Record and analyze your restaurant&apos;s sales data
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full p-1 bg-gray-100 border-0 shadow-sm">
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm rounded-full transition-colors ${
              activeTab === "daily"
                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
                : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/50"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Daily Sales
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm rounded-full transition-colors ${
              activeTab === "history"
                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
                : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/50"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Sales Analytics
          </button>
        </div>
      </div>

      {/* Main content container */}
      <div className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
        {activeTab === "daily" ? (
          <Suspense
            fallback={
              <div className="flex h-[500px] w-full items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
              </div>
            }
          >
            <SalesPage onDataUpdate={handleSalesDataUpdate} />
          </Suspense>
        ) : (
          <Suspense
            fallback={
              <div className="flex h-[500px] w-full items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
              </div>
            }
          >
            <SalesHistoryView />
          </Suspense>
        )}
      </div>
    </div>
  );
}
