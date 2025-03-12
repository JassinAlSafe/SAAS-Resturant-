import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SaleEntry, Recipe, InventoryImpactItem } from '../types';
import { Dish } from '@/lib/types';

export function useSalesApi() {
    const fetchSales = useCallback(async (): Promise<SaleEntry[]> => {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    }, []);

    const fetchDishes = useCallback(async (): Promise<Dish[]> => {
        const { data, error } = await supabase
            .from('dishes')
            .select('*, ingredients(*)');

        if (error) throw error;
        return data || [];
    }, []);

    const fetchRecipes = useCallback(async (): Promise<Recipe[]> => {
        const { data, error } = await supabase
            .from('recipes')
            .select('*, ingredients(*)');

        if (error) throw error;
        return data || [];
    }, []);

    const saveSale = useCallback(async (sale: Omit<SaleEntry, 'id' | 'createdAt'>) => {
        const { data, error } = await supabase
            .from('sales')
            .insert([{ ...sale, createdAt: new Date().toISOString() }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }, []);

    const updateInventory = useCallback(async (impacts: InventoryImpactItem[]) => {
        // Start a transaction to update multiple ingredients
        const updates = impacts.map(impact => ({
            ingredientId: impact.ingredientId,
            quantityUsed: impact.quantityUsed
        }));

        const { error } = await supabase.rpc('update_ingredients_stock', {
            updates: updates
        });

        if (error) throw error;
    }, []);

    const fetchLowStockIngredients = useCallback(async () => {
        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .lt('current_stock', 'minimum_stock');

        if (error) throw error;
        return data || [];
    }, []);

    const updateSale = useCallback(async (
        saleId: string,
        updates: Partial<SaleEntry>
    ) => {
        const { data, error } = await supabase
            .from('sales')
            .update(updates)
            .eq('id', saleId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }, []);

    const deleteSale = useCallback(async (saleId: string) => {
        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', saleId);

        if (error) throw error;
    }, []);

    return {
        fetchSales,
        fetchDishes,
        fetchRecipes,
        saveSale,
        updateInventory,
        fetchLowStockIngredients,
        updateSale,
        deleteSale
    };
} 