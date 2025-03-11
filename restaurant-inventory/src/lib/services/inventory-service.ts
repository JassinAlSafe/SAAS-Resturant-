import { supabase } from '../supabase';
import type { InventoryItem, InventoryFormData } from '../types';
import { InventoryServiceError } from '../errors';

// Database response type
type DbIngredient = {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    cost: number;

    reorder_level: number | null;
    supplier_id: string | null;
    expiry_date: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
};

// Transform database response to InventoryItem
const mapDbToInventoryItem = (data: DbIngredient): InventoryItem => {
    return {
        id: data.id,
        name: data.name,
        description: undefined,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        cost: data.cost,
        cost_per_unit: data.cost,
        minimum_stock_level: undefined,
        reorder_level: data.reorder_level || undefined,
        reorder_point: undefined,
        supplier_id: data.supplier_id || undefined,
        location: undefined,
        expiry_date: data.expiry_date || undefined,
        image_url: data.image_url || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
    };
};

export const inventoryService = {
    /**
     * Get all inventory items
     */
    async getItems(): Promise<InventoryItem[]> {
        try {
            // Check if supabase client is properly initialized
            if (!supabase) {
                throw new InventoryServiceError('Supabase client is not initialized');
            }

            const { data, error } = await supabase
                .from('ingredients')
                .select('*, suppliers(*)')
                .order('name');

            if (error) {
                console.error('Error fetching inventory items:', error);
                throw new InventoryServiceError('Failed to fetch inventory items', {
                    code: error.code,
                    details: error.details || error.message
                });
            }

            if (!data) {
                console.warn('No data returned from inventory query');
                return [];
            }

            // Transform the data to match our InventoryItem interface
            return data.map((item: DbIngredient) => mapDbToInventoryItem(item));
        } catch (error) {
            console.error('Error in getItems:', error);

            // If it's already our custom error type, just rethrow it
            if (error instanceof InventoryServiceError) {
                throw error;
            }

            // Otherwise wrap in our custom error
            throw new InventoryServiceError(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    },

    /**
     * Get soon to expire items
     */
    async getSoonToExpireItems(daysThreshold: number = 7): Promise<InventoryItem[]> {
        try {
            // Check if supabase client is properly initialized
            if (!supabase) {
                throw new InventoryServiceError('Supabase client is not initialized');
            }

            const today = new Date();
            const thresholdDate = new Date();
            thresholdDate.setDate(today.getDate() + daysThreshold);

            const { data, error } = await supabase
                .from('ingredients')
                .select('*, suppliers(*)')
                .not('expiry_date', 'is', null)
                .lte('expiry_date', thresholdDate.toISOString())
                .order('expiry_date');

            if (error) {
                console.error('Error fetching soon to expire items:', error);
                throw new InventoryServiceError('Failed to fetch expiring items', {
                    code: error.code,
                    details: error.details || error.message
                });
            }

            if (!data) {
                console.warn('No data returned from soon to expire query');
                return [];
            }

            // Transform the data to match our InventoryItem interface
            return data.map((item: DbIngredient) => mapDbToInventoryItem(item));
        } catch (error) {
            console.error('Error in getSoonToExpireItems:', error);

            // If it's already our custom error type, just rethrow it
            if (error instanceof InventoryServiceError) {
                throw error;
            }

            // Otherwise wrap in our custom error
            throw new InventoryServiceError(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    },

    /**
     * Add a new inventory item
     */
    async addItem(item: InventoryFormData): Promise<InventoryItem | null> {
        try {
            if (!supabase) {
                throw new InventoryServiceError('Supabase client is not initialized');
            }

            const dbData = {
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                cost: item.cost_per_unit,
                reorder_level: item.reorderLevel ?? 0,
                supplier_id: item.supplierId || item.supplier_id || null,
                expiry_date: item.expiryDate || item.expiry_date || null,
                image_url: item.image_url || null
            };

            const { data, error } = await supabase
                .from('ingredients')
                .insert(dbData)
                .select()
                .single();

            if (error) {
                const errorMessage = `Failed to add inventory item: ${error.message}`;
                const errorDetails = {
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    message: error.message
                };
                console.error('Error adding inventory item:', errorDetails);
                throw new InventoryServiceError(errorMessage, errorDetails);
            }

            if (!data) {
                throw new InventoryServiceError('No data returned after adding item');
            }

            return mapDbToInventoryItem(data as DbIngredient);
        } catch (error) {
            console.error('Error in addItem:', error);
            if (error instanceof InventoryServiceError) {
                throw error;
            }
            throw new InventoryServiceError(
                `Failed to add inventory item: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
            );
        }
    },

    /**
     * Update an existing inventory item
     */
    async updateItem(id: string, updates: Partial<InventoryFormData>): Promise<InventoryItem | null> {
        try {
            const dbUpdates: Record<string, unknown> = {};

            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.category !== undefined) dbUpdates.category = updates.category;
            if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
            if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
            if (updates.cost_per_unit !== undefined) dbUpdates.cost = updates.cost_per_unit;
            if (updates.reorderLevel !== undefined) dbUpdates.reorder_level = updates.reorderLevel ?? 0;
            if (updates.supplierId !== undefined) dbUpdates.supplier_id = updates.supplierId;
            if (updates.supplier_id !== undefined) dbUpdates.supplier_id = updates.supplier_id;
            if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
            if (updates.expiry_date !== undefined) dbUpdates.expiry_date = updates.expiry_date;
            if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;

            const { data, error } = await supabase
                .from('ingredients')
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating inventory item:', error);
                throw new InventoryServiceError('Failed to update inventory item', {
                    code: error.code,
                    details: error.details || error.message
                });
            }

            if (!data) {
                throw new InventoryServiceError('No data returned after updating item');
            }

            return mapDbToInventoryItem(data as DbIngredient);
        } catch (error) {
            console.error('Error in updateItem:', error);
            if (error instanceof InventoryServiceError) {
                throw error;
            }
            throw new InventoryServiceError(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
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
            const categories = [...new Set(data.map((item: { category: string }) => item.category))];
            return categories;
        } catch (error) {
            console.error('Error in getCategories:', error);
            return [];
        }
    },

    // Alias methods for backward compatibility
    getIngredients: function () { return this.getItems(); },
    addIngredient: function (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) { return this.addItem(data); },
    updateIngredient: function (id: string, data: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>) { return this.updateItem(id, data); },
    deleteIngredient: function (id: string) { return this.deleteItem(id); }
};