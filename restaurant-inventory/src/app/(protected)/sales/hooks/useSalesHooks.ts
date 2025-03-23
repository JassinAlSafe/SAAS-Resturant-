import { useEffect, useMemo } from 'react';
import { useSalesStore } from '../store/salesStore';
import { useSalesApi } from './useSalesApi';
import { useLowStockHandler } from './useLowStockHandler';
import { toast } from 'sonner';

export function useSalesPage() {
    const salesApi = useSalesApi();
    const store = useSalesStore();
    const { handleLowStockItems } = useLowStockHandler();

    // Fetch initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [sales, dishes, recipes] = await Promise.all([
                    salesApi.fetchSales(),
                    salesApi.fetchDishes(),
                    salesApi.fetchRecipes()
                ]);

                store.setInitialData({ sales, dishes, recipes });
            } catch (error) {
                console.error('Error loading sales data:', error);
                store.setError(error as Error);
            }
        };

        loadInitialData();
    }, []);

    // Filter sales based on search and date
    const filteredSales = useMemo(() => {
        return store.sales.filter(sale => {
            const matchesSearch = store.searchTerm
                ? sale.dishName.toLowerCase().includes(store.searchTerm.toLowerCase())
                : true;

            const matchesDate = store.filterDate
                ? sale.date === store.filterDate.toISOString().split('T')[0]
                : true;

            const matchesShift = store.filterShift
                ? store.filterShift === 'All' || sale.shift === store.filterShift
                : true;

            return matchesSearch && matchesDate && matchesShift;
        });
    }, [store.sales, store.searchTerm, store.filterDate, store.filterShift]);

    // Handle sales submission
    const handleSubmitSales = async () => {
        store.setError(null);
        store.set({ isSubmitting: true });
        try {
            const entries = Object.entries(store.salesEntries)
                .filter(([_, quantity]) => quantity > 0)
                .map(([dishId, quantity]) => {
                    const dish = store.dishes.find(d => d.id === dishId);
                    if (!dish) throw new Error(`Dish not found: ${dishId}`);

                    return {
                        dishId,
                        dishName: dish.name,
                        quantity,
                        totalAmount: dish.price * quantity,
                        date: store.dateString,
                        shift: store.currentShift || 'All'
                    };
                });

            if (entries.length === 0) {
                toast.error('No sales to record', {
                    description: 'Please enter quantities for at least one dish.'
                });
                store.set({ isSubmitting: false });
                return false;
            }

            // Save each sale entry
            for (const entry of entries) {
                await salesApi.saveSale(entry);

                // Update inventory if enabled
                if (store.showInventoryImpact) {
                    const impacts = store.calculateInventoryImpact(entry.dishId, entry.quantity);
                    await salesApi.updateInventory(impacts);
                }
            }

            // Check for low stock alerts and add to shopping list
            const lowStock = await salesApi.fetchLowStockIngredients();
            if (lowStock.length > 0) {
                await handleLowStockItems(lowStock);
                store.setLowStockAlerts(lowStock);
            }

            // Refresh sales data
            const sales = await salesApi.fetchSales();
            store.setSales(sales);

            // Clear form
            store.clearAllQuantities();
            toast.success('Sales recorded successfully');
            store.set({ isSubmitting: false });
            return true;
        } catch (error) {
            console.error('Error submitting sales:', error);
            toast.error('Failed to record sales');
            store.setError(error as Error);
            store.set({ isSubmitting: false });
            return false;
        }
    };

    // Load previous day\'s template
    const loadPreviousDayTemplate = async () => {
        try {
            const previousDate = new Date(store.dateString);
            previousDate.setDate(previousDate.getDate() - 1);
            const prevDateStr = previousDate.toISOString().split('T')[0];

            const prevSales = store.sales.filter(sale => sale.date === prevDateStr);
            const template = prevSales.reduce((acc, sale) => ({
                ...acc,
                [sale.dishId]: sale.quantity
            }), {});

            store.setSalesEntries(template);
            toast.success('Loaded previous day\'s template');
        } catch (error) {
            console.error('Error loading template:', error);
            toast.error('Failed to load template');
        }
    };

    return {
        // Data
        sales: salesApi.sales,
        dishes: salesApi.dishes,
        recipes: salesApi.recipes,
        salesEntries: store.salesEntries,
        filteredSales,
        selectedSale: store.selectedSale,
        dateString: store.dateString,
        lowStockAlerts: store.lowStockAlerts,

        // States
        isLoading: salesApi.isLoading,
        error: salesApi.error,
        isSubmitting: store.isSubmitting,
        showInventoryImpact: store.showInventoryImpact,
        isNotesModalOpen: store.isNotesModalOpen,

        // Actions
        handleQuantityChange: store.handleQuantityChange,
        setDateString: store.setDateString,
        calculateTotal: store.calculateTotal,
        toggleInventoryImpact: store.toggleInventoryImpact,
        resetForm: store.resetForm,
        clearAllQuantities: store.clearAllQuantities,
        loadPreviousDayTemplate,
        hasPreviousDayTemplate: useMemo(() => {
            const previousDate = new Date(store.dateString);
            previousDate.setDate(previousDate.getDate() - 1);
            const prevDateStr = previousDate.toISOString().split('T')[0];
            return store.sales.some(sale => sale.date === prevDateStr);
        }, [store.sales, store.dateString]),
        onAddDishFromRecipe: store.onAddDishFromRecipe,

        // Search and filtering
        searchTerm: store.searchTerm,
        setSearchTerm: store.setSearchTerm,
        filterDate: store.filterDate,
        setFilterDate: store.setFilterDate,
        resetFilters: store.resetFilters,

        // Notes
        openNotesModal: store.openNotesModal,
        closeNotesModal: store.closeNotesModal,

        // API operations
        fetchSalesAndDishes: salesApi.fetchSalesAndDishes,
        calculateInventoryImpact: salesApi.calculateInventoryImpact,
        handleSubmitSales,
    };
} 