"use client";

import { ShoppingListItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface ShoppingListChartsProps {
  items: ShoppingListItem[];
}

export default function ShoppingListCharts({ items }: ShoppingListChartsProps) {
  const { formatCurrency } = useCurrency();

  // Generate category data for visualizations
  const categoryData = useMemo(() => {
    const categories: Record<
      string,
      { count: number; cost: number; purchased: number; pending: number }
    > = {};

    items.forEach((item) => {
      // Initialize category if it doesn't exist
      if (!categories[item.category]) {
        categories[item.category] = {
          count: 0,
          cost: 0,
          purchased: 0,
          pending: 0,
        };
      }

      // Update category stats
      categories[item.category].count += 1;
      categories[item.category].cost += item.estimatedCost;

      if (item.isPurchased) {
        categories[item.category].purchased += 1;
      } else {
        categories[item.category].pending += 1;
      }
    });

    // Convert to array for charts
    return Object.entries(categories).map(([name, stats]) => ({
      name,
      ...stats,
    }));
  }, [items]);

  // Calculate spending distribution
  const costDistribution = useMemo(() => {
    // Sort by cost (highest first)
    return [...categoryData]
      .sort((a, b) => b.cost - a.cost)
      .map((category) => ({
        name: category.name,
        value: category.cost,
      }));
  }, [categoryData]);

  // Calculate progress by category
  const progressByCategory = useMemo(() => {
    return categoryData.map((category) => ({
      name: category.name,
      completed: (category.purchased / (category.count || 1)) * 100,
      pending: 100 - (category.purchased / (category.count || 1)) * 100,
    }));
  }, [categoryData]);

  // Prepare colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
  ];

  // Simple tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    if (name === "value") return formatCurrency(value);
    if (name === "completed" || name === "pending")
      return `${value.toFixed(0)}%`;
    return value;
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-base-content/70">
          No data available for visualization
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Spending by Category</h2>
          <p className="text-sm text-base-content/70 mb-4">
            See where your budget is being allocated
          </p>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name}: ${formatCurrency(value)}`
                  }
                >
                  {costDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Shopping Progress by Category</h2>
          <p className="text-sm text-base-content/70 mb-4">
            See your shopping completion status across categories
          </p>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={progressByCategory}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 30,
                  left: 60,
                  bottom: 5,
                }}
              >
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" />
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="#82ca9d"
                  name="Purchased"
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="#ffc658"
                  name="Pending"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Item Count by Category</h2>
          <p className="text-sm text-base-content/70 mb-4">
            Distribution of items across categories
          </p>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Total Items" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
