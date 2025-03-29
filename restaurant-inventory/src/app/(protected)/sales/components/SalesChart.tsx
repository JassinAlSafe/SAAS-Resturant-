"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCurrency } from "@/lib/currency";
import { useEffect } from "react";

interface SalesChartProps {
  data: Array<{
    date: string;
    total: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  const { formatCurrency } = useCurrency();

  // Use an effect to remove any borders from recharts elements via direct DOM manipulation
  useEffect(() => {
    const chartSvg = document.querySelector(".recharts-wrapper svg");
    if (chartSvg) {
      chartSvg.setAttribute("style", "outline: none; border: none;");
    }
  }, [data]);

  return (
    <div className="h-full outline-none border-0" style={{ border: "none" }}>
      <style jsx global>{`
        .recharts-wrapper,
        .recharts-surface {
          outline: none !important;
          border: none !important;
        }
      `}</style>
      <ResponsiveContainer width="100%" height="100%" className="outline-none">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          style={{ outline: "none", border: "none" }}
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="#a3a3a3"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            stroke="#a3a3a3"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCurrency(value).split(".")[0]}
            width={70}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg bg-white p-3 shadow-sm border border-neutral-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs uppercase text-neutral-500 font-medium tracking-wider">
                          Date
                        </span>
                        <span className="font-medium text-neutral-800 mt-1">
                          {payload[0].payload.date}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase text-neutral-500 font-medium tracking-wider">
                          Sales
                        </span>
                        <span className="font-medium text-orange-600 mt-1">
                          {formatCurrency(payload[0].value as number)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#salesGradient)"
            activeDot={{
              r: 6,
              fill: "#f97316",
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
