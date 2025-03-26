import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  RefreshCw,
  PackageOpen,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

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
          <div className="badge badge-outline bg-success bg-opacity-10 text-success border-0">
            Normal
          </div>
        );
      case "low":
        return (
          <div className="badge badge-outline bg-warning bg-opacity-10 text-warning border-0">
            Low
          </div>
        );
      case "critical":
        return (
          <div className="badge badge-outline bg-error bg-opacity-10 text-error border-0">
            Critical
          </div>
        );
      case "depleted":
        return <div className="badge badge-error">Depleted</div>;
      default:
        return <div className="badge badge-outline">Unknown</div>;
    }
  };

  // Get progress bar classes based on status
  const getProgressColor = (status: string) => {
    switch (status) {
      case "normal":
        return "progress-success";
      case "low":
        return "progress-warning";
      case "critical":
        return "progress-error";
      case "depleted":
        return "bg-gray-300";
      default:
        return "progress-info";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Usage</h2>
          <p className="text-base-content text-opacity-60">
            Monitor stock levels and consumption trends
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn btn-outline btn-sm h-9"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </button>

          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-outline btn-sm h-9">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-56"
            >
              <li className="menu-title">Inventory Actions</li>
              <li onClick={handleAddTestData}>
                <a>
                  <PackageOpen className="h-4 w-4 mr-2" />
                  Add Test Data
                </a>
              </li>
              <li>
                <a>
                  <Download className="h-4 w-4 mr-2" />
                  Export Inventory Report
                </a>
              </li>
              <li className="divider"></li>
              <li>
                <a>
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-white border border-green-100">
          <div className="card-body p-4 pb-2">
            <div className="flex items-center text-base-content text-opacity-60">
              <div className="bg-green-100 p-1 rounded mr-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              Normal Stock
            </div>
            <h2 className="card-title text-2xl">
              {statusCounts.normal || 0}{" "}
              <span className="text-sm font-normal text-base-content text-opacity-60">
                items
              </span>
            </h2>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-amber-50 to-white border border-amber-100">
          <div className="card-body p-4 pb-2">
            <div className="flex items-center text-base-content text-opacity-60">
              <div className="bg-amber-100 p-1 rounded mr-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
              </div>
              Low Stock
            </div>
            <h2 className="card-title text-2xl">
              {statusCounts.low || 0}{" "}
              <span className="text-sm font-normal text-base-content text-opacity-60">
                items
              </span>
            </h2>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-white border border-red-100">
          <div className="card-body p-4 pb-2">
            <div className="flex items-center text-base-content text-opacity-60">
              <div className="bg-red-100 p-1 rounded mr-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </div>
              Critical Stock
            </div>
            <h2 className="card-title text-2xl">
              {statusCounts.critical || 0}{" "}
              <span className="text-sm font-normal text-base-content text-opacity-60">
                items
              </span>
            </h2>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <div className="card-body p-4 pb-2">
            <div className="flex items-center text-base-content text-opacity-60">
              <div className="bg-gray-100 p-1 rounded mr-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
              </div>
              Depleted Items
            </div>
            <h2 className="card-title text-2xl">
              {statusCounts.depleted || 0}{" "}
              <span className="text-sm font-normal text-base-content text-opacity-60">
                items
              </span>
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Trend Chart */}
        <div className="card bg-base-100 shadow-sm lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title text-lg font-semibold">
              Inventory Usage Trends
            </h2>
            <p className="text-base-content text-opacity-60">
              Consumption patterns over time
            </p>
            <div className="h-80">
              <Line data={inventoryUsageData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Critical Items Preview */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body pb-3">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg font-semibold">
                Critical Items
              </h2>
              <div className="badge badge-outline font-normal">
                {(statusCounts.critical || 0) + (statusCounts.depleted || 0)}{" "}
                items
              </div>
            </div>
            <p className="text-base-content text-opacity-60">
              Items requiring immediate attention
            </p>

            <div className="px-2">
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
                      className="mb-3 p-3 bg-base-200 bg-opacity-50 rounded-lg border border-base-300"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-base-content text-opacity-60 mb-2">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1 text-xs">
                        <Clock className="h-3.5 w-3.5 text-base-content text-opacity-60" />
                        <span>
                          {item.status === "depleted"
                            ? "Currently out of stock"
                            : `Depletes in ${item.depleteDate}`}
                        </span>
                      </div>
                      <div className="w-full bg-base-300 h-1.5 rounded-full overflow-hidden">
                        <progress
                          className={`progress ${getProgressColor(
                            item.status
                          )} w-full h-1.5`}
                          value={calculateStockLevel(item)}
                          max="100"
                        ></progress>
                      </div>
                    </div>
                  ))}

                {inventoryUsageData.inventory.filter(
                  (item) =>
                    item.status === "critical" || item.status === "depleted"
                ).length === 0 && (
                  <div className="py-8 text-center text-base-content text-opacity-60">
                    <PackageOpen className="mx-auto h-8 w-8 mb-2 text-base-content text-opacity-40" />
                    <p>No critical items found</p>
                    <p className="text-sm">
                      All inventory levels are within acceptable ranges
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="card-actions justify-center border-t pt-3">
              <button
                className="btn btn-ghost btn-sm text-xs w-full"
                onClick={() => toast.info("Coming soon!")}
              >
                View All Critical Items
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="card-title text-lg font-semibold">
                Inventory Items
              </h2>
              <p className="text-base-content text-opacity-60">
                Complete inventory with usage data
              </p>
            </div>

            <div className="tabs tabs-boxed">
              <a
                className={`tab ${statusFilter === "all" ? "tab-active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All
              </a>
              <a
                className={`tab ${
                  statusFilter === "normal" ? "tab-active" : ""
                }`}
                onClick={() => setStatusFilter("normal")}
              >
                Normal
              </a>
              <a
                className={`tab ${statusFilter === "low" ? "tab-active" : ""}`}
                onClick={() => setStatusFilter("low")}
              >
                Low
              </a>
              <a
                className={`tab ${
                  statusFilter === "critical" ? "tab-active" : ""
                }`}
                onClick={() => setStatusFilter("critical")}
              >
                Critical
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-base-content text-opacity-60" />
              <input
                type="text"
                placeholder="Search inventory items..."
                className="input input-bordered w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="select select-bordered w-full sm:w-44"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="" disabled>
                Category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all"
                    ? "All Categories"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="border rounded-md overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Usage Rate</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.category}</td>
                        <td>
                          {item.quantity} {item.unit}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span>{item.usageRate}</span>
                            <div
                              className="tooltip"
                              data-tip="Units used per day"
                            >
                              <Clock className="h-3.5 w-3.5 text-base-content text-opacity-60" />
                            </div>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(item.status)}
                          <div className="w-full mt-1.5 bg-base-300 h-1 rounded-full overflow-hidden">
                            <progress
                              className={`progress ${getProgressColor(
                                item.status
                              )} w-full h-1`}
                              value={calculateStockLevel(item)}
                              max="100"
                            ></progress>
                          </div>
                        </td>
                        <td className="text-right">
                          <button className="btn btn-ghost btn-sm btn-square">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="h-24 text-center">
                        {searchQuery ||
                        categoryFilter !== "all" ||
                        statusFilter !== "all" ? (
                          <div className="flex flex-col items-center justify-center text-base-content text-opacity-60">
                            <Search className="h-6 w-6 mb-2" />
                            <p>No matching inventory items found</p>
                            <p className="text-sm">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-base-content text-opacity-60">
                            <PackageOpen className="h-6 w-6 mb-2" />
                            <p>No inventory items available</p>
                            <button
                              className="btn btn-link"
                              onClick={handleAddTestData}
                            >
                              Add test data
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t mt-4 p-4 text-sm text-base-content text-opacity-60">
            <div className="mb-3 sm:mb-0">
              Showing {filteredInventory.length} of{" "}
              {inventoryUsageData.inventory.length} items
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline btn-sm" disabled>
                Previous
              </button>
              <button className="btn btn-outline btn-sm" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
