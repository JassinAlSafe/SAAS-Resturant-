"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import InventoryTable from "./components/InventoryTable";
import InventoryActions from "./components/InventoryActions";
import { InventoryModals } from "./components/modals";
import { InventoryItem } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { useInventory } from "./hooks/useInventory";

export default function Inventory() {
  const { toast } = useToast();
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
  const addItem = async (
    itemData: Omit<InventoryItem, "id" | "created_at" | "updated_at">
  ) => {
    try {
      // Convert snake_case to camelCase for the hook
      const camelCaseData = {
        ...itemData,
        costPerUnit: itemData.cost_per_unit,
        minimumStockLevel: itemData.minimum_stock_level,
        reorderPoint: itemData.reorder_point,
        supplierId: itemData.supplier_id,
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

  const updateItem = async (
    itemData: Omit<InventoryItem, "id" | "created_at" | "updated_at">
  ) => {
    if (!currentItem) return;

    try {
      // Convert snake_case to camelCase for the hook
      const camelCaseData = {
        ...itemData,
        costPerUnit: itemData.cost_per_unit,
        minimumStockLevel: itemData.minimum_stock_level,
        reorderPoint: itemData.reorder_point,
        supplierId: itemData.supplier_id,
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

  // Export handler
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your inventory data is being exported to Excel.",
    });
    // In a real app, this would trigger an actual export
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your inventory data has been exported successfully.",
      });
    }, 1500);
  };

  // Calculate inventory statistics
  const totalItems = items.length;
  const lowStockCount = items.filter((item) => isLowStock(item)).length;
  const outOfStockCount = items.filter((item) => isOutOfStock(item)).length;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <span className="mr-4">{totalItems} total items</span>
            {lowStockCount > 0 && (
              <span className="mr-4 text-yellow-600">
                {lowStockCount} low stock
              </span>
            )}
            {outOfStockCount > 0 && (
              <span className="text-red-600">
                {outOfStockCount} out of stock
              </span>
            )}
          </div>
        </div>

        <InventoryActions
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={openAddModal}
          onExportClick={handleExport}
        />
      </div>

      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center space-x-2">
          <Button
            variant={showLowStockOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className="h-8"
          >
            {showLowStockOnly ? "Hide Regular Stock" : "Show Low Stock Only"}
          </Button>
          <Label htmlFor="low-stock-filter" className="text-sm cursor-pointer">
            {showLowStockOnly
              ? "Showing low/out of stock only"
              : "Showing all items"}
          </Label>
        </div>
      </div>

      <InventoryTable
        items={filteredItems}
        onEditClick={openEditModal}
        onDeleteClick={openDeleteModal}
        onUpdateQuantity={handleQuickQuantityUpdate}
      />

      {/* Floating Add Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={openAddModal}
          size="icon"
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
        >
          <Plus className="h-6 w-6 stroke-[2px]" />
        </Button>
      </div>

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
      />
    </div>
  );
}
