"use client";

import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";
import Card from "@/components/Card";
import { InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/lib/currency-context";
import { CurrencySelector } from "@/components/currency-selector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inventoryService } from "@/lib/services/inventory-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import InventoryItemModal from "@/components/inventory/InventoryItemModal";
import DeleteConfirmationDialog from "@/components/inventory/DeleteConfirmationDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  // State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(
    undefined
  );

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // Notifications
  const { success, error } = useNotificationHelpers();

  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // Fetch items and categories
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      // Get all inventory items
      const fetchedItems = await inventoryService.getItems();
      setItems(fetchedItems);

      // Get all categories
      const fetchedCategories = await inventoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      error(
        "Failed to load inventory",
        "There was an error loading your inventory data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new inventory item
  const handleAddItem = async (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newItem = await inventoryService.addItem(itemData);
      if (newItem) {
        setItems([...items, newItem]);
        success(
          "Item Added",
          `${newItem.name} has been added to your inventory.`
        );
        setIsModalOpen(false);

        // Add new category if it doesn't exist
        if (!categories.includes(newItem.category)) {
          setCategories([...categories, newItem.category]);
        }
      }
    } catch (err) {
      console.error("Error adding inventory item:", err);
      error("Failed to add item", "Please try again.");
    }
  };

  // Handle updating an inventory item
  const handleUpdateItem = async (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!selectedItem) return;

    try {
      const updatedItem = await inventoryService.updateItem(
        selectedItem.id,
        itemData
      );

      if (updatedItem) {
        setItems(
          items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        success("Item Updated", `${updatedItem.name} has been updated.`);
        setIsModalOpen(false);
        setSelectedItem(undefined);

        // Add new category if it doesn't exist
        if (!categories.includes(updatedItem.category)) {
          setCategories([...categories, updatedItem.category]);
        }
      }
    } catch (err) {
      console.error("Error updating inventory item:", err);
      error("Failed to update item", "Please try again.");
    }
  };

  // Handle deleting an inventory item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const deleteSuccess = await inventoryService.deleteItem(itemToDelete.id);

      if (deleteSuccess) {
        setItems(items.filter((item) => item.id !== itemToDelete.id));
        success(
          "Item Deleted",
          `${itemToDelete.name} has been removed from your inventory.`
        );
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      error("Failed to delete item", "Please try again.");
    }
  };

  // Open modal for adding a new item
  const openAddModal = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  // Open modal for editing an item
  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  // Filter items based on search term and category
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Load items on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36 mt-4 md:mt-0" />
        </div>

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full md:w-48" />
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-2" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Empty state for new users
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Inventory Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Track and manage your restaurant inventory
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <CurrencySelector />
            <Button className="mt-0" size="sm" onClick={openAddModal}>
              <FiPlus className="mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <FiPlus className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Your Inventory is Empty
          </h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Start by adding items to your inventory. You&apos;ll be able to
            track quantities, set reorder alerts, and manage costs.
          </p>
          <Button onClick={openAddModal}>
            <FiPlus className="mr-2" />
            Add Your First Item
          </Button>
        </Card>

        {/* Item Modal */}
        <InventoryItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddItem}
          customCategories={categories}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Inventory Management
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} items in your inventory
          </p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <CurrencySelector />
          <Button variant="outline" size="sm" onClick={fetchInventory}>
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={openAddModal}>
            <FiPlus className="mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              className="pl-10"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No items found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  // Calculate stock status
                  const isLowStock = item.quantity <= item.reorderLevel;
                  const isOutOfStock = item.quantity === 0;

                  return (
                    <TableRow
                      key={item.id}
                      className={
                        isOutOfStock ? "bg-red-50 dark:bg-red-950/20" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {item.name}
                        {isOutOfStock && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Out of stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell
                        className={isLowStock ? "text-red-600 font-medium" : ""}
                      >
                        {item.quantity} {item.unit}
                        {isLowStock && !isOutOfStock && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Low stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.reorderLevel} {item.unit}
                      </TableCell>
                      <TableCell>{formatCurrency(item.cost)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => openEditModal(item)}
                            title="Edit item"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => openDeleteDialog(item)}
                            title="Delete item"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Item Modal */}
      <InventoryItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(undefined);
        }}
        onSave={selectedItem ? handleUpdateItem : handleAddItem}
        item={selectedItem}
        customCategories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteItem}
        itemName={itemToDelete?.name || ""}
        itemType="item"
      />
    </div>
  );
}
