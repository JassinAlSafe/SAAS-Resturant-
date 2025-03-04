"use client";

import Card from "@/components/Card";
import { Bar, Pie } from "react-chartjs-2";
import { SalesAnalyticsViewProps } from "../types";
import { SalesMetricCard } from "./SalesMetricCard";

export const SalesAnalyticsView = ({
  salesData,
  topDishesData,
  formatCurrency,
}: SalesAnalyticsViewProps) => (
  <div className="space-y-6">
    {/* Metrics Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <SalesMetricCard
        title="Total Sales"
        value={formatCurrency(10500)}
        change="+12%"
        positive={true}
      />
      <SalesMetricCard
        title="Average Daily Sales"
        value={formatCurrency(1500)}
        change="+8%"
        positive={true}
      />
      <SalesMetricCard
        title="Total Orders"
        value="420"
        change="+15%"
        positive={true}
      />
      <SalesMetricCard
        title="Average Order Value"
        value={formatCurrency(25)}
        change="-3%"
        positive={false}
      />
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/40">
        <h3 className="text-sm font-medium mb-4">Daily Sales</h3>
        <div className="h-[280px] md:h-[320px]">
          <Bar
            data={salesData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top" as const,
                  display: true,
                  labels: {
                    boxWidth: 12,
                    font: {
                      size: 11,
                    },
                    usePointStyle: true,
                    pointStyle: "circle",
                  },
                },
                title: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    font: {
                      size: 10,
                    },
                    maxRotation: 45,
                    minRotation: 45,
                  },
                },
                y: {
                  grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                  },
                  ticks: {
                    font: {
                      size: 10,
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/40">
        <h3 className="text-sm font-medium mb-4">Top Selling Dishes</h3>
        <div className="h-[280px] md:h-[320px] flex items-center justify-center">
          <div className="w-full max-w-[240px]">
            <Pie
              data={topDishesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                    display: true,
                    labels: {
                      boxWidth: 12,
                      font: {
                        size: 11,
                      },
                      padding: 10,
                      usePointStyle: true,
                      pointStyle: "circle",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
