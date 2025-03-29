"use client";

import React, { useState, useEffect } from "react";
import { InventoryItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

// Import components and hooks from the table directory
import { InventoryControls } from "./table/InventoryControls";
import { InventoryStatsDashboard } from "./table/InventoryStatsDashboard";
import { InventoryDataTable } from "./table/InventoryDataTable";
import { useInventoryTableState } from "../hooks/useInventoryTableState";
import { calculateInventoryStats } from "./table/inventoryUtils";

interface InventoryTableProps {
  items: InventoryItem[];
  onEditClick: (item: InventoryItem) => void;
  onDeleteClick: (item: InventoryItem) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
}

export default function InventoryTable({
  items,
  onEditClick,
  onDeleteClick,
  onUpdateQuantity,
}: InventoryTableProps) {
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Use only what we need from the custom hook
  const {
    compactMode,
    setCompactMode,
    sortConfig,
    setSortField,
    setSortDirection,
    selectedItems,
    setSelectedItems,
    toggleItemSelection,
    sortedItems,
  } = useInventoryTableState(items);

  // Calculate inventory statistics
  const inventoryStats = calculateInventoryStats(items, selectedItems);

  // Calculate selected items value for passing to components
  const selectedItemsValue =
    selectedItems.length > 0
      ? selectedItems.reduce((sum: number, id: string) => {
          const item = items.find((i) => i.id === id);
          return (
            sum +
            (item && item.cost_per_unit && item.quantity
              ? item.cost_per_unit * item.quantity
              : 0)
          );
        }, 0)
      : 0;

  // Function to clear selection
  const clearSelection = () => setSelectedItems([]);

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortConfig.field !== column) return null;

    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1" aria-hidden="true" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1" aria-hidden="true" />
    );
  };

  // Handle header click for sorting
  const handleHeaderClick = (column: string) => {
    if (sortConfig.field === column) {
      setSortDirection(sortConfig.direction === "asc" ? "desc" : "asc");
    } else {
      setSortField(column);
      setSortDirection("asc");
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16 bg-base-100 rounded-lg border border-base-300"
          role="alert"
          aria-live="polite"
        >
          <Package
            className="mx-auto h-16 w-16 text-base-content/50"
            aria-hidden="true"
          />
          <h3 className="mt-6 text-xl font-medium">No items found</h3>
          <p className="mt-2 text-sm text-base-content max-w-md mx-auto">
            No inventory items match your current filters. Try adjusting your
            search criteria or category selection.
          </p>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Low stock warning
  const lowStockItems = items.filter(
    (item) => item.quantity <= item.reorder_level
  );
  const hasLowStockItems = lowStockItems.length > 0;

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Main content area container with border */}
      <div className="grid grid-cols-1 gap-8 rounded-lg border border-gray-200 bg-white p-6">
        {/* Section 1: Summary Statistics (Top Area) */}
        <section className="w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-2 flex items-center justify-between"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              Inventory Overview
            </h2>
            <div className="text-sm text-gray-500 flex items-center">
              <LayoutGrid className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>Showing data for {items.length} items</span>
            </div>
          </motion.div>

          {/* Low stock warning banner */}
          <AnimatePresence>
            {hasLowStockItems && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-center gap-2"
                role="alert"
              >
                <AlertTriangle
                  className="h-5 w-5 text-amber-500"
                  aria-hidden="true"
                />
                <span className="text-amber-800">
                  <strong>{lowStockItems.length}</strong>{" "}
                  {lowStockItems.length === 1 ? "item" : "items"} below reorder
                  level
                </span>
              </motion.div>
            )}
          </AnimatePresence>

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
        <div className="border-t border-gray-200 w-full my-1" />

        {/* Section 2: Data Table (Bottom Area) */}
        <section className="w-full">
          <div className="flex flex-col gap-4">
            {/* Table Controls - Right-aligned actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col md:flex-row md:justify-end gap-3"
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
                isMobile={isMobile}
                renderSortIndicator={renderSortIndicator}
                handleHeaderClick={handleHeaderClick}
              />
            </motion.div>

            {/* Full-width Table with traditional styling */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="overflow-hidden flex-1"
            >
              <InventoryDataTable
                items={sortedItems}
                selectedItems={selectedItems}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onUpdateQuantity={onUpdateQuantity}
                toggleItemSelection={toggleItemSelection}
                toggleAllItems={() => {
                  if (selectedItems.length === sortedItems.length) {
                    setSelectedItems([]);
                  } else {
                    setSelectedItems(sortedItems.map((item) => item.id));
                  }
                }}
                formatCurrency={formatCurrency}
                isMobile={isMobile}
                renderSortIndicator={renderSortIndicator}
                handleHeaderClick={handleHeaderClick}
              />
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
