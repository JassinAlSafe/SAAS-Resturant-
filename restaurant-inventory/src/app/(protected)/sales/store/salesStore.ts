import { create } from "zustand";
import { SaleEntry, Recipe, InventoryImpactItem } from "../types";
import { Dish } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { salesService } from "@/lib/services/sales-service";

interface SalesState {
    // Data
    sales: SaleEntry[];
    dishes: Dish[];
    recipes: Recipe[];
    salesEntries: { [key: string]: number };
    dateString: string;
    filterDate: Date | null;
    filterStartDate: Date | null;
    filterEndDate: Date | null;
    filterShift: 'All' | 'Breakfast' | 'Lunch' | 'Dinner' | null;
    currentShift: 'All' | 'Breakfast' | 'Lunch' | 'Dinner';
    searchTerm: string;
    showInventoryImpact: boolean;
    isSubmitting: boolean;
    isLoading: boolean;
    error: Error | null;
    selectedSale: SaleEntry | null;
    isNotesModalOpen: boolean;
    lowStockAlerts: InventoryImpactItem[];
    lastUpdated: number;

    // Actions
    setInitialData: (data: { sales: SaleEntry[]; dishes: Dish[]; recipes: Recipe[] }) => void;
    setSales: (sales: SaleEntry[]) => void;
    setError: (error: Error | null) => void;
    setLowStockAlerts: (alerts: InventoryImpactItem[]) => void;
    setSalesEntries: (entries: { [key: string]: number }) => void;
    setDateString: (date: string) => void;
    setFilterDate: (date: Date | null) => void;
    setFilterDateRange: (startDate: Date | null, endDate: Date | null) => void;
    setFilterShift: (shift: 'All' | 'Breakfast' | 'Lunch' | 'Dinner' | null) => void;
    setCurrentShift: (shift: 'All' | 'Breakfast' | 'Lunch' | 'Dinner') => void;
    setSearchTerm: (term: string) => void;
    handleQuantityChange: (dishId: string, quantity: number) => void;
    toggleInventoryImpact: () => void;
    calculateInventoryImpact: (dishId: string, quantity: number) => InventoryImpactItem[];
    handleSubmitSales: () => Promise<boolean>;
    fetchSalesAndDishes: () => Promise<void>;
    clearAllQuantities: () => void;
    loadPreviousDayTemplate: () => Promise<void>;
    openNotesModal: (sale: SaleEntry) => void;
    closeNotesModal: () => void;
    resetFilters: () => void;
    calculateTotal: () => number;
    updateSaleEntry: (dishId: string, quantity: number) => void;
}

export const useSalesStore = create<SalesState>((set, get) => ({
    // Initial state
    sales: [],
    dishes: [],
    recipes: [],
    salesEntries: {},
    dateString: new Date().toISOString().split('T')[0],
    filterDate: null,
    filterStartDate: null,
    filterEndDate: null,
    filterShift: null,
    currentShift: 'All',
    searchTerm: '',
    showInventoryImpact: false,
    isSubmitting: false,
    isLoading: true,
    error: null,
    selectedSale: null,
    isNotesModalOpen: false,
    lowStockAlerts: [],
    lastUpdated: 0,

    // Actions
    setInitialData: (data) => set({
        sales: data.sales,
        dishes: data.dishes,
        recipes: data.recipes,
        isLoading: false
    }),

    setSales: (sales) => set({ sales }),

    setError: (error) => set({ error }),

    setLowStockAlerts: (alerts) => set({ lowStockAlerts: alerts }),

    setSalesEntries: (entries) => set({ salesEntries: entries }),

    setDateString: (date) => set({ dateString: date }),

    setFilterDate: (date) => set({ filterDate: date }),

    setFilterDateRange: (filterStartDate, filterEndDate) => set({
        filterStartDate,
        filterEndDate
    }),

    setFilterShift: (filterShift) => set({ filterShift }),

    setCurrentShift: (currentShift) => set({ currentShift }),

    setSearchTerm: (term) => set({ searchTerm: term }),

    handleQuantityChange: (dishId, quantity) => {
        const state = get();
        const dish = state.dishes.find(d => d.id === dishId);
        if (!dish) {
            console.warn(`Dish not found for ID: ${dishId}`);
            return;
        }

        const newEntries = {
            ...state.salesEntries,
            [dishId]: quantity
        };

        // Calculate new total
        const newTotal = Object.entries(newEntries).reduce((total, [id, qty]) => {
            const d = state.dishes.find(d => d.id === id);
            if (!d) return total;
            const dishTotal = d.price * qty;
            console.log(`Adding to total: ${d.name} - ${qty} × ${d.price} = ${dishTotal}`);
            return total + dishTotal;
        }, 0);

        console.log('Updated quantity and total:', {
            dishId,
            dishName: dish.name,
            quantity,
            price: dish.price,
            newTotal
        });

        set({
            salesEntries: newEntries,
            // Force a state update to trigger re-render
            lastUpdated: new Date().getTime()
        });
    },

    toggleInventoryImpact: () => set((state) => ({
        showInventoryImpact: !state.showInventoryImpact
    })),

    calculateInventoryImpact: (dishId, quantity) => {
        const state = get();
        const dish = state.dishes.find(d => d.id === dishId);
        if (!dish || !quantity) return [];

        return dish.ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            name: 'Ingredient',
            quantityUsed: ing.quantity * quantity,
            unit: 'units'
        }));
    },

    handleSubmitSales: async () => {
        const state = get();
        console.log('Starting sales submission with state:', {
            entries: state.salesEntries,
            dateString: state.dateString,
            shift: state.currentShift,
            dishes: state.dishes.length
        });

        set({ isSubmitting: true });
        try {
            // Get the authenticated user first
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error('Authentication error:', authError);
                throw new Error('You must be logged in to submit sales');
            }

            // Convert entries to array format
            const entries = Object.entries(state.salesEntries)
                .filter(([, quantity]) => quantity > 0)
                .map(([dishId, quantity]) => {
                    const dish = state.dishes.find(d => d.id === dishId);
                    if (!dish) {
                        console.error(`Dish not found: ${dishId}`);
                        throw new Error(`Dish not found: ${dishId}`);
                    }

                    console.log('Processing dish entry:', {
                        dishId,
                        dishName: dish.name,
                        quantity,
                        price: dish.price,
                        total: dish.price * quantity
                    });

                    return {
                        dish_id: dishId,
                        dish_name: dish.name,
                        quantity,
                        total_amount: dish.price * quantity,
                        date: state.dateString,
                        shift: state.currentShift,
                        user_id: user.id
                    };
                });

            if (entries.length === 0) {
                console.log('No entries to submit');
                set({ isSubmitting: false });
                return false;
            }

            console.log('Submitting entries to Supabase:', entries);

            // Save all entries in a single transaction
            const { data: salesData, error: insertError } = await supabase
                .from('sales')
                .insert(entries)
                .select();

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                throw insertError;
            }

            console.log('Successfully saved sales:', salesData);

            if (salesData) {
                // Transform the returned data to match our SaleEntry type
                const newSales = salesData.map(sale => ({
                    id: sale.id,
                    date: sale.date,
                    shift: sale.shift,
                    dishId: sale.dish_id,
                    dishName: sale.dish_name,
                    quantity: sale.quantity,
                    totalAmount: sale.total_amount,
                    createdAt: sale.created_at,
                    updatedAt: sale.updated_at,
                    userId: sale.user_id
                }));

                // Update local state with new sales
                set(state => ({
                    sales: [...state.sales, ...newSales],
                    salesEntries: {}, // Clear entries
                    isSubmitting: false
                }));

                // Update inventory if enabled
                if (state.showInventoryImpact) {
                    console.log('Updating inventory...');
                    const success = await salesService.updateInventoryFromSales(newSales);
                    if (!success) {
                        console.error('Error updating inventory');
                        throw new Error('Failed to update inventory');
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Error submitting sales:', error);
            set({
                error: error as Error,
                isSubmitting: false
            });
            return false;
        }
    },

    fetchSalesAndDishes: async () => {
        set({ isLoading: true });
        try {
            // This is now handled in the hook
            set({ isLoading: false });
        } catch (error) {
            set({
                error: error as Error,
                isLoading: false
            });
        }
    },

    clearAllQuantities: () => set({ salesEntries: {} }),

    loadPreviousDayTemplate: async () => {
        // This is now handled in the hook
    },

    openNotesModal: (sale) => set({
        selectedSale: sale,
        isNotesModalOpen: true
    }),

    closeNotesModal: () => set({
        selectedSale: null,
        isNotesModalOpen: false
    }),

    resetFilters: () => set({
        filterDate: null,
        searchTerm: ''
    }),

    calculateTotal: () => {
        const state = get();

        // For debugging - log available dishes
        console.log('Available dishes for total calculation:',
            state.dishes.map(d => ({ id: d.id, name: d.name, price: d.price }))
        );

        // For debugging - log current entries
        console.log('Current salesEntries:', state.salesEntries);

        let totalAmount = 0;

        // Use more explicit loop for better debugging
        for (const [dishId, quantity] of Object.entries(state.salesEntries)) {
            const dish = state.dishes.find(d => d.id === dishId);

            if (!dish) {
                console.warn(`Dish not found for id: ${dishId} during total calculation`);
                continue;
            }

            const dishTotal = dish.price * quantity;
            totalAmount += dishTotal;

            console.log(`Adding to total: ${dish.name} - ${quantity} × ${dish.price} = ${dishTotal}`);
        }

        console.log(`Final total calculated: ${totalAmount}`);
        return totalAmount;
    },

    updateSaleEntry: (dishId, quantity) => set((state) => ({
        salesEntries: {
            ...state.salesEntries,
            [dishId]: quantity
        }
    })),
})); 