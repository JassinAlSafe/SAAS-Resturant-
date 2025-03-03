"use client";

import { useInventory } from "./hooks/useInventory";
import { useInventoryModals } from "./hooks/useInventoryModals";
import { useInventoryFilters } from "./hooks/useInventoryFilters";
import { useInventoryExport } from "./hooks/useInventoryExport";
import { ApiError } from "@/components/ui/api-error";
import Card from "@/components/Card";
import InventoryTable from "./components/InventoryTable";
import InventoryFilters from "./components/InventoryFilters";
import InventoryActions from "./components/InventoryActions";
import InventoryHeader from "./components/InventoryHeader";
import InventoryLoading from "./components/InventoryLoading";
import EmptyInventory from "./components/EmptyInventory";
import { InventoryModals } from "./components/modals";

export default function Inventory() {
  // Use our custom hooks
  const {
    items,
    categories,
    isLoading,
    itemsError,
    categoriesError,
    subscriptionError,
    isSubscribed,
    retryFetchItems,
    retryFetchCategories,
    retrySubscription,
    addItem,
    updateItem,
    deleteItem,
  } = useInventory();

  const {
    isModalOpen,
    selectedItem,
    isDeleteDialogOpen,
    itemToDelete,
    openAddModal,
    openEditModal,
    openDeleteDialog,
    closeItemModal,
    closeDeleteDialog,
  } = useInventoryModals();

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
  } = useInventoryFilters(items);

  const { handleExportInventory } = useInventoryExport(
    filteredItems.length > 0 ? filteredItems : items
  );

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.id);
      closeDeleteDialog();
    }
  };

  // Handle updating an item
  const handleUpdateItem = async (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => {
    if (selectedItem) {
      await updateItem(selectedItem.id, itemData);
      closeItemModal();
    }
  };

  // Handle adding an item
  const handleAddItem = async (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => {
    await addItem(itemData);
    closeItemModal();
  };

  // Loading state
  if (isLoading) {
    return <InventoryLoading />;
  }

  // Error state for items
  if (itemsError) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <InventoryHeader />
        </div>

        <ApiError
          title="Inventory Data Error"
          message={itemsError}
          onRetry={retryFetchItems}
        />
      </div>
    );
  }

  // Empty state for new users
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <InventoryHeader
            categoriesError={categoriesError}
            retryCategories={retryFetchCategories}
          />
          <InventoryActions
            onAddClick={openAddModal}
            onExportClick={handleExportInventory}
          />
        </div>

        <EmptyInventory onAddClick={openAddModal} />

        <InventoryModals
          isModalOpen={isModalOpen}
          selectedItem={selectedItem}
          isDeleteDialogOpen={isDeleteDialogOpen}
          itemToDelete={itemToDelete}
          onCloseModal={closeItemModal}
          onCloseDeleteDialog={closeDeleteDialog}
          onSaveItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteConfirm}
          customCategories={categories}
        />
      </div>
    );
  }

  // Main inventory view
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <InventoryHeader
          categoriesError={categoriesError}
          retryCategories={retryFetchCategories}
          subscriptionError={subscriptionError}
          retrySubscription={retrySubscription}
          isSubscribed={isSubscribed}
        />

        <InventoryActions
          onAddClick={openAddModal}
          onExportClick={handleExportInventory}
        />
      </div>

      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />

      <Card>
        <InventoryTable
          items={filteredItems}
          onEditClick={openEditModal}
          onDeleteClick={openDeleteDialog}
        />
      </Card>

      <InventoryModals
        isModalOpen={isModalOpen}
        selectedItem={selectedItem}
        isDeleteDialogOpen={isDeleteDialogOpen}
        itemToDelete={itemToDelete}
        onCloseModal={closeItemModal}
        onCloseDeleteDialog={closeDeleteDialog}
        onSaveItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteConfirm}
        customCategories={categories}
      />
    </div>
  );
}
