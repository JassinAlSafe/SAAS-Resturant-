"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, LineChart } from "@/components/dashboard/charts";
import {
  FiBarChart2,
  FiDollarSign,
  FiPackage,
  FiPieChart,
  FiTrendingUp,
} from "react-icons/fi";

export default function DashboardOverviewPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Simulate loading state for 2 seconds
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Increment to trigger re-renders of data components
      setRefreshKey((prev) => prev + 1);
    }, 2000);
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Dashboard Overview"
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory"
          value="$24,528.50"
          description="+2.5% from last month"
          icon={<FiPackage />}
          refreshKey={refreshKey}
        />
        <StatCard
          title="Monthly Sales"
          value="$8,623.45"
          description="+12.3% from last month"
          icon={<FiDollarSign />}
          refreshKey={refreshKey}
        />
        <StatCard
          title="Low Stock Items"
          value="12"
          description="3 items need attention"
          icon={<FiBarChart2 />}
          refreshKey={refreshKey}
        />
        <StatCard
          title="Sales Growth"
          value="18.2%"
          description="Compared to last quarter"
          icon={<FiTrendingUp />}
          refreshKey={refreshKey}
        />
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Trend</CardTitle>
              <FiPieChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>
              Monthly sales for the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart key={refreshKey} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory by Category</CardTitle>
              <FiPieChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Distribution of items by category</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart key={refreshKey} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Simple stat card component
function StatCard({
  title,
  value,
  description,
  icon,
  refreshKey,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  refreshKey: number;
}) {
  // This is just to demonstrate the refreshKey triggering an update
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [refreshKey]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
