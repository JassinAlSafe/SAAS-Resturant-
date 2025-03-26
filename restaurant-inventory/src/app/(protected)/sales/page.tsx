"use client";

import { useState, useCallback, Suspense } from "react";
import { Receipt, FileBarChart2, Calendar } from "lucide-react";
import dynamic from "next/dynamic";

// Add SalesPageData type
interface SalesPageData {
  sales: Array<{ id: string; date: string; total_amount: number }>;
}

// Dynamically import the components to improve initial page load performance
const SalesPage = dynamic(() => import("./components/SalesPage"), {
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center">
      <span className="loading loading-spinner loading-md text-primary"></span>
    </div>
  ),
});

const SalesHistoryView = dynamic(
  () => import("./components/SalesHistoryView"),
  {
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    ),
  }
);

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("daily");
  const [salesData, setSalesData] = useState<SalesPageData>({ sales: [] });

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
    <div className="h-full flex-1 bg-white">
      <header className="border-b border-neutral-100 bg-white py-6 px-8">
        <div className="flex flex-col gap-5">
          {/* Top section with logo and title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                <FileBarChart2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  {salesData.sales.length > 0 && (
                    <span className="text-2xl font-bold">
                      {salesData.sales.length}
                    </span>
                  )}
                  <h1 className="text-2xl font-semibold text-neutral-800">
                    Sales Management
                  </h1>
                </div>
                <p className="text-sm text-neutral-500">
                  Record and analyze your restaurant&apos;s sales data
                </p>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-neutral-100 -mb-6 -mx-8 px-8">
            <button
              onClick={() => setActiveTab("daily")}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "daily"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Daily Sales
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Receipt className="h-4 w-4" />
              Sales Analytics
            </button>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-9rem)] bg-white">
        {activeTab === "daily" ? (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <span className="loading loading-spinner loading-md text-primary"></span>
              </div>
            }
          >
            <SalesPage
              onAnalyticsView={() => setActiveTab("history")}
              onDataUpdate={handleSalesDataUpdate}
            />
          </Suspense>
        ) : (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <span className="loading loading-spinner loading-md text-primary"></span>
              </div>
            }
          >
            <SalesHistoryView />
          </Suspense>
        )}
      </main>
    </div>
  );
}
