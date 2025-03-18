import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InventoryItem, InventoryFormData } from '@/lib/types';
import { inventoryService } from '@/lib/services/inventory-service';

interface InventoryState {
    // Data
    items: InventoryItem[];
    categories: string[];
    selectedItem: InventoryItem | null;

    // Loading states
    isLoading: boolean;
    isSubmitting: boolean;
    error: Error | null;
    lastUpdated: number | null;

    // Filters
    categoryFilter: string;
    searchQuery: string;
    sortField: keyof InventoryItem;
    sortDirection: 'asc' | 'desc';

    // Actions
    fetchInventory: () => Promise<void>;
    addItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<InventoryItem | null>;
    updateItem: (id: string, updates: Partial<InventoryFormData>) => Promise<InventoryItem | null>;
    deleteItem: (id: string) => Promise<boolean>;
    setSelectedItem: (item: InventoryItem | null) => void;

    // Filter actions
    setCategoryFilter: (category: string) => void;
    setSearchQuery: (query: string) => void;
    setSortField: (field: keyof InventoryItem) => void;
    setSortDirection: (direction: 'asc' | 'desc') => void;
    resetFilters: () => void;

    // Computed
    getFilteredItems: () => InventoryItem[];
    getItemsByCategory: () => Record<string, InventoryItem[]>;
    getLowStockItems: () => InventoryItem[];
    getTotalInventoryValue: () => number;
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set, get) => ({
            // Initial state - all values that could cause hydration mismatches should be empty/zero
            items: [],
            categories: [],
            selectedItem: null,
            isLoading: false,
            isSubmitting: false,
            error: null,
            lastUpdated: null,
            categoryFilter: 'all',
            searchQuery: '',
            sortField: 'name',
            sortDirection: 'asc',

            // Actions
            fetchInventory: async () => {
                set({ isLoading: true, error: null });

                try {
                    const [items, categories] = await Promise.all([
                        inventoryService.getItems(),
                        inventoryService.getCategories()
                    ]);

                    set({
                        items,
                        categories,
                        isLoading: false,
                        lastUpdated: Date.now()
                    });
                } catch (error) {
                    console.error('Error fetching inventory:', error);
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error : new Error('Failed to fetch inventory')
                    });
                }
            },

            addItem: async (itemData) => {
                set({ isSubmitting: true, error: null });

                try {
                    console.log("Store adding item:", itemData);

                    // Make sure we handle undefined values properly
                    const cleanItemData = { ...itemData };

                    // Filter out undefined or null values
                    Object.keys(cleanItemData).forEach(key => {
                        if (cleanItemData[key as keyof typeof cleanItemData] === undefined ||
                            cleanItemData[key as keyof typeof cleanItemData] === null) {
                            delete cleanItemData[key as keyof typeof cleanItemData];
                        }
                    });

                    const newItem = await inventoryService.addItem(cleanItemData);

                    if (newItem) {
                        // Update the items array with the new item
                        set(state => ({
                            items: [...state.items, newItem],
                            isSubmitting: false,
                            lastUpdated: Date.now()
                        }));
                    }

                    return newItem;
                } catch (error) {
                    console.error('Error adding inventory item:', error);
                    set({
                        isSubmitting: false,
                        error: error instanceof Error ? error : new Error('Failed to add item')
                    });
                    return null;
                }
            },

            updateItem: async (id, updates) => {
                set({ isSubmitting: true, error: null });

                try {
                    console.log("Store updating item:", id, updates);

                    // Make sure we handle undefined values properly
                    const cleanUpdates: Partial<InventoryFormData> = { ...updates };

                    // Filter out undefined or null values
                    Object.keys(cleanUpdates).forEach(key => {
                        if (cleanUpdates[key as keyof typeof cleanUpdates] === undefined ||
                            cleanUpdates[key as keyof typeof cleanUpdates] === null) {
                            delete cleanUpdates[key as keyof typeof cleanUpdates];
                        }
                    });

                    const updatedItem = await inventoryService.updateItem(id, cleanUpdates);

                    if (updatedItem) {
                        // Update the items array with the updated item
                        set(state => ({
                            items: state.items.map(item =>
                                item.id === id ? updatedItem : item
                            ),
                            isSubmitting: false,
                            lastUpdated: Date.now(),
                            // If the selected item is the updated item, update it as well
                            selectedItem: state.selectedItem?.id === id ? updatedItem : state.selectedItem
                        }));
                    }

                    return updatedItem;
                } catch (error) {
                    console.error('Error updating inventory item:', error);
                    set({
                        isSubmitting: false,
                        error: error instanceof Error ? error : new Error('Failed to update item')
                    });
                    return null;
                }
            },

            deleteItem: async (id) => {
                set({ isSubmitting: true, error: null });

                try {
                    const success = await inventoryService.deleteItem(id);

                    if (success) {
                        // Remove the item from the items array
                        set(state => ({
                            items: state.items.filter(item => item.id !== id),
                            isSubmitting: false,
                            lastUpdated: Date.now(),
                            // If the selected item is the deleted item, clear it
                            selectedItem: state.selectedItem?.id === id ? null : state.selectedItem
                        }));
                    }

                    return success;
                } catch (error) {
                    console.error('Error deleting inventory item:', error);
                    set({
                        isSubmitting: false,
                        error: error instanceof Error ? error : new Error('Failed to delete item')
                    });
                    return false;
                }
            },

            setSelectedItem: (item) => {
                set({ selectedItem: item });
            },

            // Filter actions
            setCategoryFilter: (category) => {
                set({ categoryFilter: category });
            },

            setSearchQuery: (query) => {
                set({ searchQuery: query });
            },

            setSortField: (field) => {
                set({ sortField: field });
            },

            setSortDirection: (direction) => {
                set({ sortDirection: direction });
            },

            resetFilters: () => {
                set({
                    categoryFilter: 'all',
                    searchQuery: '',
                    sortField: 'name',
                    sortDirection: 'asc'
                });
            },

            // Computed properties
            getFilteredItems: () => {
                const state = get();
                let filtered = [...state.items];

                // Apply category filter
                if (state.categoryFilter !== 'all') {
                    filtered = filtered.filter(item => item.category === state.categoryFilter);
                }

                // Apply search filter
                if (state.searchQuery) {
                    const query = state.searchQuery.toLowerCase();
                    filtered = filtered.filter(item =>
                        item.name.toLowerCase().includes(query) ||
                        item.description?.toLowerCase().includes(query) ||
                        item.category.toLowerCase().includes(query)
                    );
                }

                // Apply sorting
                filtered.sort((a, b) => {
                    const aValue = a[state.sortField];
                    const bValue = b[state.sortField];

                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        return state.sortDirection === 'asc'
                            ? aValue.localeCompare(bValue)
                            : bValue.localeCompare(aValue);
                    }

                    if (typeof aValue === 'number' && typeof bValue === 'number') {
                        return state.sortDirection === 'asc'
                            ? aValue - bValue
                            : bValue - aValue;
                    }

                    return 0;
                });

                return filtered;
            },

            getItemsByCategory: () => {
                const state = get();
                return state.items.reduce((acc, item) => {
                    if (!acc[item.category]) {
                        acc[item.category] = [];
                    }
                    acc[item.category].push(item);
                    return acc;
                }, {} as Record<string, InventoryItem[]>);
            },

            getLowStockItems: () => {
                return get().items.filter(item =>
                    item.quantity <= item.reorder_level
                );
            },

            getTotalInventoryValue: () => {
                return get().items.reduce((total, item) => {
                    return total + (item.quantity * item.cost);
                }, 0);
            }
        }),
        {
            name: 'inventory-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist these values in localStorage
                items: state.items,
                categories: state.categories,
                lastUpdated: state.lastUpdated,
                categoryFilter: state.categoryFilter,
                sortField: state.sortField,
                sortDirection: state.sortDirection,
            }),
        }
    )
); 