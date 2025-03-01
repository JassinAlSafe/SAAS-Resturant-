import { supabase } from '@/lib/supabase';
import { InventoryItem, Ingredient } from '@/lib/types';

export const inventoryService = {
    /**
     * Get all inventory items
     */
    async getItems(): Promise<InventoryItem[]> {
        try {
            const { data, error } = await supabase
                .from('ingredients')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching inventory items:', error);
                throw error;
            }

            // Transform the data to match our InventoryItem interface
            return data.map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                reorderLevel: item.reorder_level,
                cost: item.cost,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));
        } catch (error) {
            console.error('Error in getItems:', error);
            return [];
        }
    },

    /**
     * Add a new inventory item
     */
    async addItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem | null> {
        try {
            // Convert to snake_case for the database
            const { data, error } = await supabase
                .from('ingredients')
                .insert({
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    unit: item.unit,
                    reorder_level: item.reorderLevel,
                    cost: item.cost
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding inventory item:', error);
                throw error;
            }

            // Transform the response to match our InventoryItem interface
            return {
                id: data.id,
                name: data.name,
                category: data.category,
                quantity: data.quantity,
                unit: data.unit,
                reorderLevel: data.reorder_level,
                cost: data.cost,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };
        } catch (error) {
            console.error('Error in addItem:', error);
            return null;
        }
    },

    /**
     * Update an existing inventory item
     */
    async updateItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<InventoryItem | null> {
        try {
            // Convert to snake_case for the database
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.category !== undefined) dbUpdates.category = updates.category;
            if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
            if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
            if (updates.reorderLevel !== undefined) dbUpdates.reorder_level = updates.reorderLevel;
            if (updates.cost !== undefined) dbUpdates.cost = updates.cost;

            const { data, error } = await supabase
                .from('ingredients')
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating inventory item:', error);
                throw error;
            }

            // Transform the response to match our InventoryItem interface
            return {
                id: data.id,
                name: data.name,
                category: data.category,
                quantity: data.quantity,
                unit: data.unit,
                reorderLevel: data.reorder_level,
                cost: data.cost,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };
        } catch (error) {
            console.error('Error in updateItem:', error);
            return null;
        }
    },

    /**
     * Delete an inventory item
     */
    async deleteItem(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('ingredients')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting inventory item:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteItem:', error);
            return false;
        }
    },

    /**
     * Get all unique categories
     */
    async getCategories(): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('ingredients')
                .select('category')
                .order('category');

            if (error) {
                console.error('Error fetching categories:', error);
                throw error;
            }

            // Extract unique categories
            const categories = [...new Set(data.map((item: any) => item.category))];
            return categories;
        } catch (error) {
            console.error('Error in getCategories:', error);
            return [];
        }
    },

    // Alias methods for backward compatibility
    getIngredients: function () { return this.getItems(); },
    addIngredient: function (data: any) { return this.addItem(data); },
    updateIngredient: function (id: string, data: any) { return this.updateItem(id, data); },
    deleteIngredient: function (id: string) { return this.deleteItem(id); }
}; 