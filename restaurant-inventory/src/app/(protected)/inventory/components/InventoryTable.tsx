"use client";

import React, { useState } from "react";
import { InventoryItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { motion } from "framer-motion";
import { Package, LayoutGrid } from "lucide-react";

// Import components and hooks from the table directory
import { InventoryControls } from "./table/InventoryControls";
import { InventoryStatsDashboard } from "./table/InventoryStatsDashboard";
import { InventoryDataTable } from "./table/InventoryDataTable";
import { useInventoryTableState } from "./table/useInventoryTableState";
import { calculateInventoryStats } from "./table/inventoryUtils";

interface InventoryTableProps {
  items: InventoryItem[];
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
}

export default function InventoryTable({
  items,
  onEditClick,
  onDeleteClick,
  onUpdateQuantity,
}: InventoryTableProps) {
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");

  // Use the custom hook for managing all table state
  const {
    compactMode,
    setCompactMode,
    sortField,
    sortDirection,
    sortConfig,
    setSortField,
    setSortDirection,
    selectedItems,
    setSelectedItems,
    expandedItems,
    toggleExpanded,
    handleSort,
    toggleItemSelection,
    toggleAllItems,
    sortedItems,
  } = useInventoryTableState(items);

  // Calculate inventory statistics
  const inventoryStats = calculateInventoryStats(
    items,
    selectedItems,
    formatCurrency
  );

  // Calculate selected items value for passing to components
  const selectedItemsValue =
    selectedItems.length > 0
      ? selectedItems.reduce((sum: number, id: string) => {
          const item = items.find((i) => i.id === id);
          return sum + (item ? item.cost_per_unit * item.quantity : 0);
        }, 0)
      : 0;

  // Function to clear selection
  const clearSelection = () => setSelectedItems([]);

  // Empty state
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-muted"
      >
        <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-6 text-xl font-medium">No items found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          No inventory items match your current filters. Try adjusting your
          search criteria or category selection.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Main content area container with border */}
      <div className="grid grid-cols-1 gap-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs p-6">
        {/* Section 1: Summary Statistics (Top Area) */}
        <section className="w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-2 flex items-center justify-between"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Inventory Overview
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <LayoutGrid className="h-4 w-4 mr-2" />
              <span>Showing data for {items.length} items</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <InventoryStatsDashboard
              stats={inventoryStats}
              formatCurrency={formatCurrency}
            />
          </motion.div>
        </section>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800 w-full my-1" />

        {/* Section 2: Data Table (Bottom Area) */}
        <section className="w-full">
          <div className="flex flex-col gap-4">
            {/* Table Controls - Right-aligned actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex justify-end"
            >
              <InventoryControls
                compactMode={compactMode}
                setCompactMode={setCompactMode}
                sortConfig={sortConfig}
                setSortField={setSortField}
                setSortDirection={setSortDirection}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                selectedItemsValue={selectedItemsValue}
                formatCurrency={formatCurrency}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                clearSelection={clearSelection}
                onExport={() => console.log("Export")}
                onImport={() => console.log("Import")}
                onPrint={() => console.log("Print")}
              />
            </motion.div>

            {/* Full-width Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="overflow-hidden flex-1"
            >
              <InventoryDataTable
                items={sortedItems}
                compactMode={compactMode}
                selectedItems={selectedItems}
                expandedItems={expandedItems}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onUpdateQuantity={onUpdateQuantity}
                toggleItemSelection={toggleItemSelection}
                toggleAllItems={toggleAllItems}
                toggleExpanded={toggleExpanded}
                formatCurrency={formatCurrency}
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
              />
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
