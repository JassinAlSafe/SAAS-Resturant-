import React, { useState, useMemo, type FC } from "react";
import { Line } from "react-chartjs-2";
import {
  PackageOpen,
  Filter,
  Download,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsFilter, ReportFilters } from "./ReportsFilter";
import { RefreshButton } from "@/components/ui/Common/RefreshButton";
import {
  ActionsButton,
  ActionItem,
} from "@/components/ui/Common/ActionsButton";
import { DropdownItem } from "@/components/ui/Common/StyledDropdown";
import { InventoryTable } from "./InventoryTable";

// Type Definitions
export type InventoryStatus = "normal" | "low" | "critical" | "depleted";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  usageRate: number;
  depleteDate: string;
  status: InventoryStatus;
  cost: number;
}

export interface InventoryUsageData {
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
}

interface InventoryUsageViewProps {
  inventoryUsageData: InventoryUsageData;
  onRefresh: () => void;
}

// Chart configuration - moved outside component to prevent recreation on renders
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

// Helper functions - moved outside component for reusability
const calculateStockLevel = (status: InventoryStatus): number => {
  switch (status) {
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

const getStatusBadge = (status: InventoryStatus) => {
  switch (status) {
    case "normal":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-600 border-0"
        >
          Normal
        </Badge>
      );
    case "low":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-600 border-0"
        >
          Low
        </Badge>
      );
    case "critical":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-0">
          Critical
        </Badge>
      );
    case "depleted":
      return <Badge variant="destructive">Depleted</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const getProgressColor = (status: InventoryStatus): string => {
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

// Reusable Card Components
const StatusCard: FC<{
  count: number;
  color: string;
  label: string;
}> = ({ count, color, label }) => (
  <Card className="border-none shadow-sm rounded-xl">
    <CardContent className="pt-6">
      <div className="flex items-center text-gray-500 mb-2">
        <div className={`bg-${color}-100 p-1 rounded mr-2`}>
          <div className={`w-2 h-2 bg-${color}-500 rounded-full`} />
        </div>
        {label}
      </div>
      <div className="text-2xl font-bold">
        {count || 0}{" "}
        <span className="text-sm font-normal text-gray-500">items</span>
      </div>
    </CardContent>
  </Card>
);

// Critical Item Component
const CriticalItemCard: FC<{
  item: InventoryItem;
}> = ({ item }) => (
  <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div className="flex justify-between items-center mb-1">
      <h4 className="font-medium">{item.name}</h4>
      {getStatusBadge(item.status)}
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
      <span>{item.category}</span>
      <span>•</span>
      <span>
        {item.quantity} {item.unit}
      </span>
    </div>
    <div className="flex items-center gap-2 mb-1 text-xs">
      <Clock className="h-3.5 w-3.5 text-gray-500" />
      <span>
        {item.status === "depleted"
          ? "Currently out of stock"
          : `Depletes in ${item.depleteDate}`}
      </span>
    </div>
    <div className="w-full bg-gray-200 h-1.5 rounded-full">
      <div
        className={`${getProgressColor(item.status)} h-1.5 rounded-full`}
        style={{ width: `${calculateStockLevel(item.status)}%` }}
      ></div>
    </div>
  </div>
);

export const InventoryUsageView: FC<InventoryUsageViewProps> = ({
  inventoryUsageData,
  onRefresh,
}) => {
  // State
  const [filters, setFilters] = useState<ReportFilters>({
    searchTerm: "",
    category: "all",
    minAmount: undefined,
    maxAmount: undefined,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Action configurations
  const actionItems: ActionItem[] = [
    {
      label: "Add Test Data",
      icon: <PackageOpen className="h-4 w-4" />,
      onClick: () =>
        toast.info("Test data added", {
          description: "Sample inventory data has been added for demonstration",
        }),
    },
    {
      label: "Export Inventory Report",
      icon: <Download className="h-4 w-4" />,
      onClick: () => toast.info("Export functionality coming soon"),
    },
    {
      label: "Advanced Filters",
      icon: <Filter className="h-4 w-4" />,
      onClick: () => toast.info("Advanced filters coming soon"),
    },
  ];

  const getItemActions = (item: InventoryItem): DropdownItem[] => [
    {
      label: "View Details",
      onClick: () => toast.info(`Viewing details for ${item.name}`),
    },
    {
      label: "Edit Item",
      onClick: () => toast.info(`Editing ${item.name}`),
    },
    {
      label: "-", // Separator
      onClick: () => {},
      isSeparator: true,
    },
    {
      label: "Adjust Stock",
      onClick: () => toast.info(`Adjusting stock for ${item.name}`),
    },
  ];

  // Memoized derived data to prevent recalculations on each render
  const statusCounts = useMemo(() => {
    return inventoryUsageData.inventory.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [inventoryUsageData.inventory]);

  const filteredInventory = useMemo(() => {
    return inventoryUsageData.inventory.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());
      const matchesCategory =
        filters.category === "all" || item.category === filters.category;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesAmount =
        (filters.minAmount === undefined ||
          item.quantity >= filters.minAmount) &&
        (filters.maxAmount === undefined || item.quantity <= filters.maxAmount);
      return matchesSearch && matchesCategory && matchesStatus && matchesAmount;
    });
  }, [
    inventoryUsageData.inventory,
    filters.searchTerm,
    filters.category,
    filters.minAmount,
    filters.maxAmount,
    statusFilter,
  ]);

  const criticalItems = useMemo(
    () =>
      inventoryUsageData.inventory
        .filter(
          (item) => item.status === "critical" || item.status === "depleted"
        )
        .slice(0, 5),
    [inventoryUsageData.inventory]
  );

  // Event handlers
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

  const handleFilterChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  const handleAddTestData = () => {
    toast.info("Test data added", {
      description: "Sample inventory data has been added for demonstration",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Usage</h2>
          <p className="text-gray-500">
            Monitor stock levels and consumption trends
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RefreshButton
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            className="h-9 hover:bg-secondary/80 text-foreground"
            variant="ghost"
          />

          <ReportsFilter
            activeTab="inventory"
            onFilterChange={handleFilterChange}
          />

          <ActionsButton
            actions={actionItems}
            label="Actions"
            icon={<MoreHorizontal className="h-4 w-4" />}
            className="h-9 hover:bg-secondary/80 text-foreground"
            variant="ghost"
          />
        </div>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatusCard
          count={statusCounts.normal || 0}
          color="green"
          label="Normal Stock"
        />
        <StatusCard
          count={statusCounts.low || 0}
          color="amber"
          label="Low Stock"
        />
        <StatusCard
          count={statusCounts.critical || 0}
          color="red"
          label="Critical Stock"
        />
        <StatusCard
          count={statusCounts.depleted || 0}
          color="gray"
          label="Depleted Items"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Trend Chart */}
        <Card className="border-none shadow-sm rounded-xl lg:col-span-2">
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
        <Card className="border-none shadow-sm rounded-xl">
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
              {criticalItems.length > 0 ? (
                criticalItems.map((item) => (
                  <CriticalItemCard key={item.id} item={item} />
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <PackageOpen className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                  <p>No critical items found</p>
                  <p className="text-sm">
                    All inventory levels are within acceptable ranges
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs w-full hover:bg-secondary/80 text-foreground"
              onClick={() => toast.info("Coming soon!")}
            >
              View All Critical Items
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Inventory Table Card */}
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader className="pb-0">
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
              defaultValue={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
              className="w-full sm:w-auto"
            >
              <TabsList className="w-full bg-secondary/50 border-0">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="normal">Normal</TabsTrigger>
                <TabsTrigger value="low">Low</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {/* The new inventory table component */}
          <InventoryTable
            items={inventoryUsageData.inventory}
            filteredItems={filteredInventory}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAddTestData={handleAddTestData}
            getItemActions={getItemActions}
            getStatusBadge={getStatusBadge}
            getProgressColor={getProgressColor}
            calculateStockLevel={calculateStockLevel}
          />
        </CardContent>
      </Card>
    </div>
  );
};
