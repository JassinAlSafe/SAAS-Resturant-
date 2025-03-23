import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SaleEntry, Recipe, InventoryImpactItem } from '../types';
import { Dish } from '@/lib/types';

export function useSalesApi() {
    const fetchSales = useCallback(async (): Promise<SaleEntry[]> => {
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('No authenticated user found');
            return [];
        }

        // Get the user\'s business profile
        const { data: businessProfile, error: businessError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (businessError || !businessProfile) {
            console.error('Error fetching business profile:', businessError);
            return [];
        }

        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .eq('business_profile_id', businessProfile.id)
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    }, []);

    const fetchDishes = useCallback(async (): Promise<Dish[]> => {
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('No authenticated user found');
            return [];
        }

        // Get the user\'s business profile
        const { data: businessProfile, error: businessError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (businessError || !businessProfile) {
            console.error('Error fetching business profile:', businessError);
            return [];
        }

        const { data, error } = await supabase
            .from('dishes')
            .select('*, ingredients(*)')
            .eq('business_profile_id', businessProfile.id);

        if (error) throw error;
        return data || [];
    }, []);

    const fetchRecipes = useCallback(async (): Promise<Recipe[]> => {
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('No authenticated user found');
            return [];
        }

        // Get the user\'s business profile
        const { data: businessProfile, error: businessError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (businessError || !businessProfile) {
            console.error('Error fetching business profile:', businessError);
            return [];
        }

        const { data, error } = await supabase
            .from('recipes')
            .select('*, ingredients(*)')
            .eq('business_profile_id', businessProfile.id);

        if (error) throw error;
        return data || [];
    }, []);

    const saveSale = useCallback(async (sale: Omit<SaleEntry, 'id' | 'createdAt'>) => {
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('No authenticated user found');
            throw new Error('User not authenticated');
        }

        // Get the user\'s business profile
        const { data: businessProfile, error: businessError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (businessError || !businessProfile) {
            console.error('Error fetching business profile:', businessError);
            throw new Error('Business profile not found');
        }

        const { data, error } = await supabase
            .from('sales')
            .insert([{
                ...sale,
                createdAt: new Date().toISOString(),
                business_profile_id: businessProfile.id,
                user_id: user.id
            }])
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