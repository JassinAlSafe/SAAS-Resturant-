"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryDataTable } from "./table/InventoryDataTable";
import { InventoryCards } from "./InventoryCards";
import { InventoryContentProps } from "../types";
import { convertToDisplayItems } from "../utils/inventoryUtils";

export function InventoryContent({
  items,
  groupedItems,
  filteredGroupedItems,
  sortedFilteredItems,
  viewMode,
  onEditClick,
  onDeleteClick,
  onUpdateQuantity,
  selectedItems,
  toggleItemSelection,
  toggleAllItems,
  formatCurrency,
  openAddModal,
}: InventoryContentProps & { openAddModal: () => void }) {
  // Add debug log to see the values
  console.log("InventoryContent rendering with:", {
    items: items?.length,
    groupedItems: groupedItems?.length,
    filteredGroupedItems: filteredGroupedItems?.length,
    sortedFilteredItems: sortedFilteredItems?.length,
    viewMode,
  });

  // Handle the case where filteredGroupedItems or sortedFilteredItems is undefined
  const hasItems =
    (filteredGroupedItems && filteredGroupedItems.length > 0) ||
    (sortedFilteredItems && sortedFilteredItems.length > 0);
  const itemsToDisplay = sortedFilteredItems || [];

  // Track if we have actual data but it was filtered out
  const hasFilters = sortedFilteredItems?.length !== groupedItems?.length;

  console.log("Rendering decision:", {
    hasItems,
    hasFilters,
    groupedItemsLength: groupedItems?.length,
    sortedFilteredItemsLength: sortedFilteredItems?.length,
  });

  if (!hasItems) {
    return (
      <InventoryEmptyState
        hasFilters={hasFilters}
        openAddModal={openAddModal}
      />
    );
  }

  return (
    <div className="mb-6">
      {viewMode === "table" ? (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-4 text-sm text-amber-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
              />
            </svg>
            <span>
              Showing {filteredGroupedItems?.length || 0} unique products.
              Similar items have been grouped together.
            </span>
          </div>
          <InventoryDataTable
            items={convertToDisplayItems(itemsToDisplay)}
            selectedItems={selectedItems}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onUpdateQuantity={onUpdateQuantity}
            toggleItemSelection={toggleItemSelection}
            toggleAllItems={() =>
              itemsToDisplay.length > 0
                ? toggleAllItems(itemsToDisplay.map((item) => item.ids[0]))
                : toggleAllItems([])
            }
            formatCurrency={formatCurrency}
          />
        </div>
      ) : (
        <InventoryCards
          items={convertToDisplayItems(itemsToDisplay)}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      )}
    </div>
  );
}

// Helper component for empty inventory state
function InventoryEmptyState({
  hasFilters,
  openAddModal,
}: {
  hasFilters: boolean;
  openAddModal: () => void;
}) {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8"
    >
      <div className="text-center py-16 bg-base-100 rounded-lg border border-base-300 shadow-sm">
        <div className="mx-auto h-16 w-16 text-base-content/30 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">No items found</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {hasFilters
            ? "No items match your current filters. Try adjusting your search criteria."
            : "Your inventory is empty. Add your first item to get started."}
        </p>
        {!hasFilters && (
          <Button onClick={openAddModal} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Your First Item
          </Button>
        )}
      </div>
    </motion.div>
  );
}
