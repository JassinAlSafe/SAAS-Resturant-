import { create } from "zustand";
import { SaleEntry, ShiftType, Recipe, InventoryImpactItem } from "../types";
import { Dish } from "@/lib/types";

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
    handleSubmitSales: () => Promise<void>;
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
        set((state) => ({
            salesEntries: {
                ...state.salesEntries,
                [dishId]: quantity
            }
        }));
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
            name: ing.name || 'Unknown',
            quantityUsed: ing.quantity * quantity,
            unit: ing.unit || 'units'
        }));
    },

    handleSubmitSales: async () => {
        const state = get();
        set({ isSubmitting: true });
        try {
            // This is now handled in the hook
            set({
                salesEntries: {},
                isSubmitting: false
            });
        } catch (error) {
            set({
                error: error as Error,
                isSubmitting: false
            });
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
        return Object.entries(state.salesEntries).reduce((total, [dishId, quantity]) => {
            const dish = state.dishes.find(d => d.id === dishId);
            return total + (dish?.price || 0) * quantity;
        }, 0);
    },

    updateSaleEntry: (dishId, quantity) => set((state) => ({
        salesEntries: {
            ...state.salesEntries,
            [dishId]: quantity
        }
    })),
})); 