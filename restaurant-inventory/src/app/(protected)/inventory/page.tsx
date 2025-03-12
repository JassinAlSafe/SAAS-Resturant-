"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import InventoryTable from "./components/InventoryTable";
import { InventoryCards } from "./components/InventoryCards";
import InventoryFilters from "./components/InventoryFilters";
import { InventoryModals } from "./components/modals";
import { InventoryItem, Supplier } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useInventory } from "./hooks/useInventory";
import { motion } from "framer-motion";
import { usePermission } from "@/lib/permission-context";
import { supplierService } from "@/lib/services/supplier-service";

// Interface for form data that includes both snake_case and camelCase properties
interface InventoryFormData
  extends Omit<InventoryItem, "id" | "created_at" | "updated_at"> {
  reorderLevel?: number;
  expiryDate?: string;
}

export default function Inventory() {
  const { toast } = useToast();
  const { userRole } = usePermission();
  const {
    items,
    categories,
    isLoading,
    addItem: addInventoryItem,
    updateItem: updateInventoryItem,
    deleteItem: deleteInventoryItem,
  } = useInventory();

  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Helper function to check if an item is low on stock
  const isLowStock = (item: InventoryItem): boolean => {
    const reorderLevel = item.reorder_point || item.minimum_stock_level || 5;
    return item.quantity <= reorderLevel && item.quantity > 0;
  };

  // Helper function to check if an item is out of stock
  const isOutOfStock = (item: InventoryItem): boolean => {
    return item.quantity === 0;
  };

  // Filter items based on search query, selected category, and low stock filter
  useEffect(() => {
    let result = [...items];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter by low stock
    if (showLowStockOnly) {
      result = result.filter((item) => isLowStock(item) || isOutOfStock(item));
    }

    setFilteredItems(result);
  }, [items, searchQuery, selectedCategory, showLowStockOnly]);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const supplierData = await supplierService.getSuppliers();
        setSuppliers(supplierData);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  // Modal handlers
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (item: InventoryItem) => {
    setCurrentItem(item);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  const openDeleteModal = (item: InventoryItem) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  // CRUD operations
  const addItem = async (itemData: InventoryFormData) => {
    try {
      // Convert snake_case to camelCase for the hook
      const camelCaseData = {
        ...itemData,
        costPerUnit: itemData.cost_per_unit,
        minimumStockLevel: itemData.minimum_stock_level,
        // Fix: Map reorderLevel from form to reorder_point for the service
        reorderPoint: itemData.reorderLevel || itemData.reorder_point,
        supplierId: itemData.supplier_id,
        // Add any missing properties with proper defaults
        description: itemData.description || "",
        location: itemData.location || "",
      } as unknown as Omit<InventoryItem, "id" | "createdAt" | "updatedAt">;

      await addInventoryItem(camelCaseData);
      toast({
        title: "Item Added",
        description: `${itemData.name} has been added to inventory.`,
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateItem = async (itemData: InventoryFormData) => {
    if (!currentItem) return;

    try {
      // Convert snake_case to camelCase for the hook
      const camelCaseData = {
        ...itemData,
        costPerUnit: itemData.cost_per_unit,
        minimumStockLevel: itemData.minimum_stock_level,
        // Fix: Map reorderLevel from form to reorder_point for the service
        reorderPoint: itemData.reorderLevel || itemData.reorder_point,
        supplierId: itemData.supplier_id,
        // Add any missing properties with proper defaults
        description: itemData.description || "",
        location: itemData.location || "",
      } as unknown as Omit<InventoryItem, "id" | "createdAt" | "updatedAt">;

      await updateInventoryItem(currentItem.id, camelCaseData);
      toast({
        title: "Item Updated",
        description: `${itemData.name} has been updated.`,
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async () => {
    if (!currentItem) return;

    try {
      await deleteInventoryItem(currentItem.id);
      toast({
        title: "Item Deleted",
        description: `${currentItem.name} has been removed from inventory.`,
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickQuantityUpdate = async (
    itemId: string,
    newQuantity: number
  ) => {
    const itemToUpdate = items.find((item) => item.id === itemId);
    if (!itemToUpdate) return;

    try {
      // For simple quantity updates, we only need to pass the quantity
      await updateInventoryItem(itemId, {
        quantity: newQuantity,
      } as unknown as Omit<InventoryItem, "id" | "createdAt" | "updatedAt">);

      toast({
        title: "Quantity Updated",
        description: `${itemToUpdate.name} quantity updated to ${newQuantity} ${itemToUpdate.unit}.`,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate inventory statistics
  const lowStockCount = items.filter((item) => isLowStock(item)).length;
  const outOfStockCount = items.filter((item) => isOutOfStock(item)).length;

  if (isLoading) {
    return (
      <div className="w-full py-8 space-y-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading inventory data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      {/* Filters */}
      <InventoryFilters
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        showLowStock={showLowStockOnly}
        onLowStockChange={setShowLowStockOnly}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={openAddModal}
      />

      {/* Inventory Content */}
      <div className="rounded-lg">
        {filteredItems.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <div className="text-center py-16 bg-white dark:bg-gray-950 rounded-lg border shadow-sm">
              <div className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4">
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
                {searchQuery || selectedCategory !== "all" || showLowStockOnly
                  ? "No items match your current filters. Try adjusting your search criteria."
                  : "Your inventory is empty. Add your first item to get started."}
              </p>
              {!searchQuery &&
                selectedCategory === "all" &&
                !showLowStockOnly && (
                  <Button onClick={openAddModal} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add Your First Item
                  </Button>
                )}
            </div>
          </motion.div>
        ) : (
          <div className="mb-6">
            {viewMode === "table" ? (
              <InventoryTable
                items={filteredItems}
                onEditClick={openEditModal}
                onDeleteClick={openDeleteModal}
                onUpdateQuantity={handleQuickQuantityUpdate}
              />
            ) : (
              <InventoryCards
                items={filteredItems}
                onEditClick={openEditModal}
                onDeleteClick={openDeleteModal}
              />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <InventoryModals
        isModalOpen={isAddModalOpen || isEditModalOpen}
        selectedItem={currentItem || undefined}
        isDeleteDialogOpen={isDeleteModalOpen}
        itemToDelete={currentItem}
        onCloseModal={isAddModalOpen ? closeAddModal : closeEditModal}
        onCloseDeleteDialog={closeDeleteModal}
        onSaveItem={addItem}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        customCategories={categories}
        suppliers={suppliers}
        userRole={userRole as "admin" | "manager" | "staff"}
      />
    </div>
  );
}
