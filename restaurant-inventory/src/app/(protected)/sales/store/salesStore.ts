import { create } from 'zustand';
import { Sale, Dish } from '@/lib/types';
import { salesService } from '@/lib/services/sales-service';

type SalesState = {
    sales: Sale[];
    dishes: Dish[];
    isLoading: boolean;
    error: Error | null;
    filterDate: Date | null;
    filterStartDate: Date | null;
    filterEndDate: Date | null;
    filterShift: string | null;
    currentShift: 'All' | 'Breakfast' | 'Lunch' | 'Dinner';
    searchTerm: string;
    fetchSalesAndDishes: () => Promise<void>;
    setFilterDateRange: (startDate: Date | null, endDate: Date | null) => void;
    setFilterShift: (shift: string | null) => void;
    setCurrentShift: (shift: 'All' | 'Breakfast' | 'Lunch' | 'Dinner') => void;
    setSearchTerm: (term: string) => void;
};

const initialState = {
    sales: [] as Sale[],
    dishes: [] as Dish[],
    isLoading: false,
    error: null,
    filterDate: null,
    filterStartDate: null,
    filterEndDate: null,
    filterShift: null,
    currentShift: 'All' as const,
    searchTerm: ''
};

export const useSalesStore = create<SalesState>()((set) => ({
    ...initialState,

    fetchSalesAndDishes: async () => {
        set({ isLoading: true, error: null });
        try {
            const [salesData, recipesData] = await Promise.all([
                salesService.getSales(),
                salesService.getRecipes()
            ]);

            set((state) => ({
                ...state,
                sales: salesData,
                dishes: recipesData,
                isLoading: false
            }));
        } catch (error) {
            console.error('Error fetching sales and recipes:', error);
            set((state) => ({
                ...state,
                error: error instanceof Error ? error : new Error('Failed to fetch sales and recipes data'),
                isLoading: false
            }));
        }
    },

    setFilterDateRange: (startDate: Date | null, endDate: Date | null) =>
        set((state) => ({ ...state, filterStartDate: startDate, filterEndDate: endDate })),

    setFilterShift: (shift: string | null) =>
        set((state) => ({ ...state, filterShift: shift })),

    setCurrentShift: (shift: 'All' | 'Breakfast' | 'Lunch' | 'Dinner') =>
        set((state) => ({ ...state, currentShift: shift })),

    setSearchTerm: (term: string) =>
        set((state) => ({ ...state, searchTerm: term }))
}));