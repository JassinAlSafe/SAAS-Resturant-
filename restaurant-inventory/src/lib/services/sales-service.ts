import { supabase } from '@/lib/supabase';
import { Dish, Sale } from '@/lib/types';
import { format } from 'date-fns';

interface SaleRecord {
    id: string;
    dish_id: string;
    dish_name: string;
    quantity: number;
    total_amount: number;
    date: string;
    created_at: string;
    notes?: string;
    user_id: string;
}

export const salesService = {
    /**
     * Get all sales for the authenticated user
     */
    async getSales(): Promise<Sale[]> {
        try {
            console.log('Fetching sales...');

            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return [];
            }

            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching sales:', error);
                throw error;
            }

            if (!data) {
                console.log('No sales found');
                return [];
            }

            // Transform DB data to our application model
            return data.map((sale: SaleRecord) => ({
                id: sale.id,
                dishId: sale.dish_id,
                dishName: sale.dish_name,
                quantity: sale.quantity,
                totalAmount: sale.total_amount,
                date: sale.date,
                createdAt: sale.created_at
            }));
        } catch (error) {
            console.error('Exception in getSales:', error);
            return [];
        }
    },

    /**
     * Get sales for a specific date
     */
    async getSalesByDate(date: Date): Promise<Sale[]> {
        try {
            // Format date as YYYY-MM-DD
            const formattedDate = format(date, 'yyyy-MM-dd');

            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return [];
            }

            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', formattedDate);

            if (error) {
                console.error('Error fetching sales by date:', error);
                throw error;
            }

            if (!data) {
                console.log(`No sales found for date: ${formattedDate}`);
                return [];
            }

            // Transform DB data to our application model
            return data.map((sale: SaleRecord) => ({
                id: sale.id,
                dishId: sale.dish_id,
                dishName: sale.dish_name,
                quantity: sale.quantity,
                totalAmount: sale.total_amount,
                date: sale.date,
                createdAt: sale.created_at
            }));
        } catch (error) {
            console.error('Exception in getSalesByDate:', error);
            return [];
        }
    },

    /**
     * Add multiple sales entries for a date
     */
    async addSales(entries: Omit<Sale, 'id' | 'createdAt'>[]): Promise<Sale[]> {
        try {
            if (entries.length === 0) {
                return [];
            }

            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                throw new Error('User not authenticated');
            }

            // Transform entries to DB format
            const dbEntries = entries.map(entry => ({
                dish_id: entry.dishId,
                dish_name: entry.dishName,
                quantity: entry.quantity,
                total_amount: entry.totalAmount,
                date: entry.date,
                user_id: user.id
            }));

            const { data, error } = await supabase
                .from('sales')
                .insert(dbEntries)
                .select();

            if (error) {
                console.error('Error adding sales entries:', error);
                throw error;
            }

            if (!data) {
                return [];
            }

            // Transform DB data back to our application model
            return data.map((sale: SaleRecord) => ({
                id: sale.id,
                dishId: sale.dish_id,
                dishName: sale.dish_name,
                quantity: sale.quantity,
                totalAmount: sale.total_amount,
                date: sale.date,
                createdAt: sale.created_at
            }));
        } catch (error) {
            console.error('Exception in addSales:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            }
            throw error;
        }
    },

    /**
     * Get all dishes (recipes)
     */
    async getDishes(): Promise<Dish[]> {
        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return [];
            }

            const { data, error } = await supabase
                .from('recipes')
                .select(`
          id,
          name,
          price,
          created_at,
          updated_at,
          recipe_ingredients (
            ingredient_id,
            quantity
          )
        `)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching dishes for sales:', error);
                throw error;
            }

            if (!data) {
                console.log('No dishes found');
                return [];
            }

            // Transform DB data to our application model
            return data.map((recipe: any) => ({
                id: recipe.id,
                name: recipe.name,
                price: recipe.price,
                ingredients: recipe.recipe_ingredients?.map((item: any) => ({
                    ingredientId: item.ingredient_id,
                    quantity: item.quantity
                })) || [],
                createdAt: recipe.created_at || new Date().toISOString(),
                updatedAt: recipe.updated_at || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Exception in getDishes:', error);
            return [];
        }
    },

    /**
     * Get ingredient details by ID
     */
    async getIngredientDetails(ids: string[]): Promise<{ id: string, name: string, unit: string }[]> {
        try {
            if (ids.length === 0) {
                return [];
            }

            const { data, error } = await supabase
                .from('ingredients')
                .select('id, name, unit')
                .in('id', ids);

            if (error) {
                console.error('Error fetching ingredient details:', error);
                throw error;
            }

            if (!data) {
                return [];
            }

            return data.map((ingredient: any) => ({
                id: ingredient.id,
                name: ingredient.name,
                unit: ingredient.unit
            }));
        } catch (error) {
            console.error('Exception in getIngredientDetails:', error);
            return [];
        }
    },

    /**
     * Update inventory based on sales
     */
    async updateInventoryFromSales(sales: Sale[]): Promise<boolean> {
        try {
            // Note: In a real implementation, this would reduce inventory quantities based on sales
            console.log('Would update inventory based on sales:', sales);

            // Simulate success
            return true;
        } catch (error) {
            console.error('Exception in updateInventoryFromSales:', error);
            return false;
        }
    }
}; 