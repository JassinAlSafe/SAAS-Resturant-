// page.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useShoppingList } from "./hooks/useShoppingList";
import ShoppingListTable from "./components/ShoppingListTable";
import ShoppingListHeader from "./components/ShoppingListHeader";
import ShoppingListSummary from "./components/ShoppingListSummary";
import ShoppingListModals from "./components/modals";
import { ShoppingListItem } from "@/lib/types";
import { Loader2, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [showPurchased, setShowPurchased] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [filterBy, setFilterBy] = useState("all");

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

  // Filter shopping list based on search term, category, and other filters
  const filteredList = shoppingList.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesPurchased = showPurchased ? true : !item.purchased;
    return matchesSearch && matchesCategory && matchesPurchased;
  });

  // Sort the filtered list
  const sortedList = [...filteredList].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "category") return a.category.localeCompare(b.category);
    if (sortBy === "cost") return a.estimatedCost - b.estimatedCost;
    if (sortBy === "quantity") return a.quantity - b.quantity;
    // Default sort by date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsAddModalOpen(true);
  };

  const handleEditItem = (item: ShoppingListItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    await removeItem(id);
  };

  const handleTogglePurchased = async (id: string, isPurchased: boolean) => {
    await markAsPurchased(id, isPurchased);
  };

  const handleGenerateList = async () => {
    await generateList();
  };

  const totalItems = filteredList.length;
  const purchasedItems = filteredList.filter((item) => item.purchased).length;
  const urgentItems = filteredList.filter((item) => item.isUrgent).length;
  const totalCost = filteredList.reduce(
    (sum, item) => sum + item.estimatedCost,
    0
  );

  if (isLoading) {
    return (
      <div className="hero min-h-[60vh]">
        <div className="hero-content text-center">
          <div className="max-w-md flex flex-col items-center">
            <span className="loading loading-spinner loading-lg text-warning"></span>
            <p className="py-6 text-lg">Loading shopping list...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hero min-h-[60vh]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <div className="alert alert-error shadow-lg">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Error loading shopping list:{" "}
                  {error.message || "Please try again later"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6 space-y-6 max-w-7xl"
    >
      <ShoppingListHeader
        onAddItem={handleAddItem}
        onGenerateList={handleGenerateList}
        isGenerating={isGeneratingList}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        showPurchased={showPurchased}
        onToggleShowPurchased={() => setShowPurchased(!showPurchased)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalEstimatedCost={totalCost}
        itemsCount={{
          total: totalItems,
          purchased: purchasedItems,
          urgent: urgentItems,
          autoGenerated: filteredList.filter((item) => item.isAutoGenerated)
            .length,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ShoppingListTable
            items={sortedList}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onTogglePurchased={handleTogglePurchased}
            isDeleting={isDeletingItem}
            isUpdating={isMarkingAsPurchased}
            onAddItem={handleAddItem}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <ShoppingListSummary items={filteredList} />

              <div className="mt-6 space-y-4">
                <h3 className="card-title text-lg">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleAddItem}
                    className="btn btn-primary gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add New Item</span>
                  </button>

                  <button
                    onClick={handleGenerateList}
                    disabled={isGeneratingList}
                    className="btn btn-outline btn-secondary gap-2"
                  >
                    {isGeneratingList ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Shopping List</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShoppingListModals
        isAddModalOpen={isAddModalOpen}
        isEditModalOpen={isEditModalOpen}
        selectedItem={selectedItem}
        onCloseAddModal={() => setIsAddModalOpen(false)}
        onCloseEditModal={() => setIsEditModalOpen(false)}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        categories={categories}
        isAddingItem={isAddingItem}
        isUpdatingItem={isUpdatingItem}
      />
    </motion.div>
  );
}
