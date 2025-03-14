"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useShoppingList } from "./hooks/useShoppingList";
import ShoppingListTable from "./components/ShoppingListTable";
import ShoppingListHeader from "./components/ShoppingListHeader";
import ShoppingListModals from "./components/modals";
import { ShoppingListItem } from "@/lib/types";
import { Loader2 } from "lucide-react";

// Create a client
const queryClient = new QueryClient();

// Wrap the main content in the QueryClientProvider
export default function ShoppingListPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ShoppingListContent />
    </QueryClientProvider>
  );
}

function ShoppingListContent() {
  const [selectedItem, setSelectedItem] = useState<ShoppingListItem | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const {
    shoppingList,
    categories,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    markAsPurchased,
    generateList,
    isAddingItem,
    isUpdatingItem,
    isDeletingItem,
    isMarkingAsPurchased,
    isGeneratingList,
  } = useShoppingList();

  // Filter shopping list based on search term and category
  const filteredList = shoppingList.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate total estimated cost
  const totalEstimatedCost = filteredList.reduce(
    (total, item) => total + item.estimated_cost,
    0
  );

  // Handle item deletion with proper type handling
  const handleDeleteItem = async (id: string) => {
    await removeItem(id);
  };

  // Handle item update with proper type handling
  const handleUpdateItem = async (updates: Partial<ShoppingListItem>) => {
    if (selectedItem) {
      await updateItem({ id: selectedItem.id, updates });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-destructive">
          Error loading shopping list
        </p>
        <p className="text-sm text-muted-foreground">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ShoppingListHeader
        onAddItem={() => setIsAddModalOpen(true)}
        onGenerateList={generateList}
        isGenerating={isGeneratingList}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        totalEstimatedCost={totalEstimatedCost}
      />

      <ShoppingListTable
        items={filteredList}
        onEditItem={(item: ShoppingListItem) => {
          setSelectedItem(item);
          setIsEditModalOpen(true);
        }}
        onDeleteItem={handleDeleteItem}
        onTogglePurchased={(id: string, isPurchased: boolean) =>
          markAsPurchased({ id, isPurchased })
        }
        isDeleting={isDeletingItem}
        isUpdating={isMarkingAsPurchased}
      />

      <ShoppingListModals
        selectedItem={selectedItem}
        isAddModalOpen={isAddModalOpen}
        isEditModalOpen={isEditModalOpen}
        onCloseAddModal={() => setIsAddModalOpen(false)}
        onCloseEditModal={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onAdd={addItem}
        onUpdate={handleUpdateItem}
        categories={categories}
        isSubmitting={isAddingItem || isUpdatingItem}
      />
    </div>
  );
}
