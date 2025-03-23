import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  RefreshCw,
  PackageOpen,
  Filter,
  Download,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  usageRate: number;
  depleteDate: string;
  status: "normal" | "low" | "critical" | "depleted";
  cost: number;
}

interface InventoryUsageViewProps {
  inventoryUsageData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      tension?: number;
    }[];
    inventory: InventoryItem[];
  };
  onRefresh: () => void;
}

// Chart configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.06)",
      },
      ticks: {
        precision: 0,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        boxWidth: 12,
        padding: 16,
        usePointStyle: true,
      },
    },
    tooltip: {
      padding: 12,
      caretSize: 6,
      cornerRadius: 4,
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
    point: {
      radius: 4,
      hitRadius: 6,
      hoverRadius: 6,
    },
  },
};

export function InventoryUsageView({
  inventoryUsageData,
  onRefresh,
}: InventoryUsageViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock categories (would come from actual data in a real scenario)
  const categories = [
    "all",
    "meat",
    "produce",
    "dairy",
    "dry goods",
    "beverages",
    "spices",
    "seafood",
  ];

  // Filter inventory items based on search query and filters
  const filteredInventory = inventoryUsageData.inventory.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get counts for each status
  const statusCounts = inventoryUsageData.inventory.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();

    // Simulate refresh completion after 1 second
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Inventory data refreshed", {
        description: "Latest inventory usage data has been loaded",
      });
    }, 1000);
  };

  // Handle add test data
  const handleAddTestData = () => {
    toast.info("Test data added", {
      description: "Sample inventory data has been added for demonstration",
    });
  };

  // Calculate stock level percentage for progress bars
  const calculateStockLevel = (item: InventoryItem) => {
    switch (item.status) {
      case "normal":
        return Math.min(100, Math.max(70, Math.random() * 30 + 70));
      case "low":
        return Math.min(69, Math.max(30, Math.random() * 30 + 30));
      case "critical":
        return Math.min(29, Math.max(5, Math.random() * 20 + 5));
      case "depleted":
        return 0;
      default:
        return 100;
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-0"
          >
            Normal
          </Badge>
        );
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-0"
          >
            Low
          </Badge>
        );
      case "critical":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-0">
            Critical
          </Badge>
        );
      case "depleted":
        return <Badge variant="destructive">Depleted</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get progress bar classes based on status
  const getProgressColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-500";
      case "low":
        return "bg-amber-500";
      case "critical":
        return "bg-red-500";
      case "depleted":
        return "bg-gray-300";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Usage</h2>
          <p className="text-muted-foreground">
            Monitor stock levels and consumption trends
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Inventory Actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="flex items-center"
                onClick={handleAddTestData}
              >
                <PackageOpen className="h-4 w-4 mr-2" />
                Add Test Data
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Inventory Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <div className="bg-green-100 p-1 rounded mr-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              Normal Stock
            </CardDescription>
            <CardTitle className="text-2xl">
              {statusCounts.normal || 0}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                items
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <div className="bg-amber-100 p-1 rounded mr-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
              </div>
              Low Stock
            </CardDescription>
            <CardTitle className="text-2xl">
              {statusCounts.low || 0}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                items
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <div className="bg-red-100 p-1 rounded mr-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </div>
              Critical Stock
            </CardDescription>
            <CardTitle className="text-2xl">
              {statusCounts.critical || 0}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                items
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-100">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <div className="bg-gray-100 p-1 rounded mr-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
              </div>
              Depleted Items
            </CardDescription>
            <CardTitle className="text-2xl">
              {statusCounts.depleted || 0}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                items
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Inventory Usage Trends
            </CardTitle>
            <CardDescription>Consumption patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={inventoryUsageData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Critical Items Preview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Critical Items
              </CardTitle>
              <Badge variant="outline" className="font-normal">
                {(statusCounts.critical || 0) + (statusCounts.depleted || 0)}{" "}
                items
              </Badge>
            </div>
            <CardDescription>
              Items requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="max-h-[280px] overflow-auto pr-2">
              {inventoryUsageData.inventory
                .filter(
                  (item) =>
                    item.status === "critical" || item.status === "depleted"
                )
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={item.id}
                    className="mb-3 p-3 bg-muted/50 rounded-lg border border-border/30"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span>{item.category}</span>
                      <span></span>
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1 text-xs">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {item.status === "depleted"
                          ? "Currently out of stock"
                          : `Depletes in ${item.depleteDate}`}
                      </span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          getProgressColor(item.status)
                        )}
                        style={{ width: `${calculateStockLevel(item)}%` }}
                      />
                    </div>
                  </div>
                ))}

              {inventoryUsageData.inventory.filter(
                (item) =>
                  item.status === "critical" || item.status === "depleted"
              ).length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <PackageOpen className="mx-auto h-8 w-8 mb-2 text-muted-foreground/60" />
                  <p>No critical items found</p>
                  <p className="text-sm">
                    All inventory levels are within acceptable ranges
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Button
              variant="link"
              className="w-full text-xs"
              onClick={() => toast.info("Coming soon!")}
            >
              View All Critical Items
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">
                Inventory Items
              </CardTitle>
              <CardDescription>
                Complete inventory with usage data
              </CardDescription>
            </div>

            <Tabs
              defaultValue="all"
              onValueChange={(value) => setStatusFilter(value)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="normal">Normal</TabsTrigger>
                <TabsTrigger value="low">Low</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory items..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Usage Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{item.usageRate}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Units used per day</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                        <div className="w-full mt-1.5 bg-muted h-1 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              getProgressColor(item.status)
                            )}
                            style={{ width: `${calculateStockLevel(item)}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchQuery ||
                      categoryFilter !== "all" ||
                      statusFilter !== "all" ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-6 w-6 mb-2" />
                          <p>No matching inventory items found</p>
                          <p className="text-sm">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <PackageOpen className="h-6 w-6 mb-2" />
                          <p>No inventory items available</p>
                          <Button variant="link" onClick={handleAddTestData}>
                            Add test data
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t p-4 text-sm text-muted-foreground">
          <div className="mb-3 sm:mb-0">
            Showing {filteredInventory.length} of{" "}
            {inventoryUsageData.inventory.length} items
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
