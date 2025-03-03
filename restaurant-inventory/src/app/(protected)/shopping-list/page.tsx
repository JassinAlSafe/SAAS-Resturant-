"use client";

import { useShoppingList } from "./hooks/useShoppingList";
import { useShoppingListFilters } from "./hooks/useShoppingListFilters";
import { useAddShoppingItem } from "./hooks/useAddShoppingItem";
import { useShoppingListExport } from "./hooks/useShoppingListExport";
import { ApiError } from "@/components/ui/api-error";
import Card from "@/components/Card";

import ShoppingListTable from "./components/ShoppingListTable";
import ShoppingListFilters from "./components/ShoppingListFilters";
import ShoppingListActions from "./components/ShoppingListActions";
import ShoppingListHeader from "./components/ShoppingListHeader";
import ShoppingListSummary from "./components/ShoppingListSummary";
import ShoppingListLoading from "./components/ShoppingListLoading";
import EmptyShoppingList from "./components/EmptyShoppingList";
import AddShoppingListItem from "./components/AddShoppingListItem";

export default function ShoppingList() {
  // Use our custom hooks
  const {
    shoppingList,
    categories,
    isLoading,
    error,
    fetchInventoryAndGenerateList,
    addItem,
    markAsPurchased,
    removeItem,
  } = useShoppingList();

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    showPurchased,
    setShowPurchased,
    filteredItems,
  } = useShoppingListFilters(shoppingList);

  const {
    isAddingItem,
    newItemName,
    setNewItemName,
    newItemQuantity,
    setNewItemQuantity,
    newItemUnit,
    setNewItemUnit,
    newItemCategory,
    setNewItemCategory,
    newItemCost,
    setNewItemCost,
    toggleAddItemForm,
    handleAddItem,
  } = useAddShoppingItem(addItem);

  const { handleExportShoppingList } = useShoppingListExport(filteredItems);

  // Loading state
  if (isLoading) {
    return <ShoppingListLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <ShoppingListHeader
            error={error}
            retry={fetchInventoryAndGenerateList}
          />
        </div>
      </div>
    );
  }

  // Empty state
  if (shoppingList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <ShoppingListHeader />
          <ShoppingListActions
            onAddClick={toggleAddItemForm}
            onRefreshClick={fetchInventoryAndGenerateList}
            onExportClick={() => handleExportShoppingList()}
          />
        </div>

        <AddShoppingListItem
          isVisible={isAddingItem}
          itemName={newItemName}
          onItemNameChange={setNewItemName}
          itemQuantity={newItemQuantity}
          onItemQuantityChange={setNewItemQuantity}
          itemUnit={newItemUnit}
          onItemUnitChange={setNewItemUnit}
          itemCategory={newItemCategory}
          onItemCategoryChange={setNewItemCategory}
          itemCost={newItemCost}
          onItemCostChange={setNewItemCost}
          categories={categories}
          onAddItem={handleAddItem}
          onCancel={toggleAddItemForm}
        />

        <EmptyShoppingList
          onAddClick={toggleAddItemForm}
          onRefreshClick={fetchInventoryAndGenerateList}
        />
      </div>
    );
  }

  // Main view with items
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <ShoppingListHeader />
        <ShoppingListActions
          onAddClick={toggleAddItemForm}
          onRefreshClick={fetchInventoryAndGenerateList}
          onExportClick={() => handleExportShoppingList(filteredItems)}
        />
      </div>

      <AddShoppingListItem
        isVisible={isAddingItem}
        itemName={newItemName}
        onItemNameChange={setNewItemName}
        itemQuantity={newItemQuantity}
        onItemQuantityChange={setNewItemQuantity}
        itemUnit={newItemUnit}
        onItemUnitChange={setNewItemUnit}
        itemCategory={newItemCategory}
        onItemCategoryChange={setNewItemCategory}
        itemCost={newItemCost}
        onItemCostChange={setNewItemCost}
        categories={categories}
        onAddItem={handleAddItem}
        onCancel={toggleAddItemForm}
      />

      <ShoppingListSummary items={filteredItems} />

      <ShoppingListFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showPurchased={showPurchased}
        onShowPurchasedChange={setShowPurchased}
        categories={categories}
      />

      <Card>
        <ShoppingListTable
          items={filteredItems}
          onMarkPurchased={markAsPurchased}
          onRemoveItem={removeItem}
        />
      </Card>
    </div>
  );
}
