import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InventoryItem, InventoryStatus } from "./InventoryUsageView";
import {
  StyledDropdown,
  DropdownItem,
} from "@/components/ui/Common/StyledDropdown";
import {
  Clock,
  MoreHorizontal,
  PackageOpen,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface InventoryTableProps {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAddTestData: () => void;
  getItemActions: (item: InventoryItem) => DropdownItem[];
  getStatusBadge: (status: InventoryStatus) => React.ReactNode;
  getProgressColor: (status: InventoryStatus) => string;
  calculateStockLevel: (status: InventoryStatus) => number;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  filteredItems,
  statusFilter,
  onAddTestData,
  getItemActions,
  getStatusBadge,
  getProgressColor,
  calculateStockLevel,
}) => {
  return (
    <>
      <div className="rounded-md overflow-hidden mt-4">
        <div className="overflow-x-auto">
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
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <TableRow
                    key={`inventory-item-${item.id || `${index}-${item.name}`}`}
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{item.usageRate}</span>
                        <div className="tooltip" data-tip="Units used per day">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                      <div className="w-full mt-1.5 bg-gray-200 h-1 rounded-full">
                        <div
                          className={`${getProgressColor(
                            item.status
                          )} h-1 rounded-full`}
                          style={{
                            width: `${calculateStockLevel(item.status)}%`,
                          }}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <StyledDropdown
                        items={getItemActions(item)}
                        label=""
                        icon={<MoreHorizontal className="h-4 w-4" />}
                        variant="ghost"
                        size="sm"
                        showChevron={false}
                        className="h-8 w-8 p-0 hover:bg-secondary/80 text-foreground"
                        align="end"
                        menuWidth="48"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow key="no-inventory-items-found">
                  <TableCell colSpan={6} className="h-24 text-center">
                    {statusFilter !== "all" ? (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Search className="h-6 w-6 mb-2" />
                        <p>No matching inventory items found</p>
                        <p className="text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <PackageOpen className="h-6 w-6 mb-2" />
                        <p>No inventory items available</p>
                        <Button
                          variant="ghost"
                          className="hover:bg-secondary/80 text-primary"
                          onClick={onAddTestData}
                        >
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
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 p-4 text-sm text-gray-500">
        <div className="mb-3 sm:mb-0">
          Showing {filteredItems.length} of {items.length} items
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="hover:bg-secondary/80 text-foreground flex items-center gap-1 h-8 px-3"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="hover:bg-secondary/80 text-foreground flex items-center gap-1 h-8 px-3"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
