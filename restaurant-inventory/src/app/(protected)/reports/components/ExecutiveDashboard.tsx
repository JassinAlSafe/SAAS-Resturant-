import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ExecutiveDashboardProps {
  salesData: {
    currentSales: number;
    previousSales: number;
    salesGrowth: number;
    profitMargin: number;
  };
  inventoryData: {
    lowStockCount: number;
    outOfStockCount: number;
    criticalItems: Array<{
      name: string;
      depletion: string;
      depleted: boolean;
      warning: boolean;
    }>;
  };
  topDishes: string[];
  formatCurrency: (value: number) => string;
}

export function ExecutiveDashboard({
  salesData,
  inventoryData,
  topDishes,
  formatCurrency,
}: ExecutiveDashboardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Executive Dashboard</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary/10 p-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-primary flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold">
              {formatCurrency(salesData.currentSales)}
            </div>
            <div className="flex items-center mt-1">
              {salesData.salesGrowth >= 0 ? (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-0"
                >
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {salesData.salesGrowth.toFixed(1)}%
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-0"
                >
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  {Math.abs(salesData.salesGrowth).toFixed(1)}%
                </Badge>
              )}
              <span className="text-xs ml-2 text-muted-foreground">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profit Margin Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-green-100 dark:bg-green-900/20 p-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-400 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold">
              {salesData.profitMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on cost and revenue analysis
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-amber-100 dark:bg-amber-900/20 p-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-400 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold">
              {inventoryData.lowStockCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <Link
                href="/inventory?filter=low-stock"
                className="flex items-center hover:underline"
              >
                View low stock items
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-red-100 dark:bg-red-900/20 p-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-400 flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Out of Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold">
              {inventoryData.outOfStockCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <Link
                href="/shopping-list"
                className="flex items-center hover:underline"
              >
                Go to Shopping List
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Critical Inventory Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryData.criticalItems.length > 0 ? (
              <div className="space-y-4">
                {inventoryData.criticalItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-background rounded-md"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Depleted in {item.depletion}
                      </div>
                    </div>
                    <Link
                      href={`/inventory?search=${encodeURIComponent(
                        item.name
                      )}`}
                    >
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <Link href="/inventory?filter=critical">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All Critical Items
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No critical inventory items
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Dishes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Top Selling Dishes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topDishes.length > 0 ? (
              <div className="space-y-4">
                {topDishes.map((dish, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-background rounded-md"
                  >
                    <div>
                      <div className="font-medium">{dish}</div>
                      <div className="text-sm text-muted-foreground">
                        #{index + 1} best seller
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-0"
                      >
                        Popular
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <Link href="/sales">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Sales Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <Button variant="outline" asChild>
          <Link href="/inventory" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Manage Inventory
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/sales/new" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Record Sales
          </Link>
        </Button>
      </div>
    </div>
  );
}
