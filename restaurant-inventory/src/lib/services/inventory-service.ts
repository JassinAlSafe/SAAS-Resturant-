import { supabase } from '@/lib/supabase';
import { InventoryItem, IngredientRow } from '@/lib/types';

/**
 * Custom error class for inventory service
 */
export class InventoryServiceError extends Error {
    code?: string;
    details?: string;

    constructor(message: string, options?: { code?: string, details?: string }) {
        super(message);
        this.name = 'InventoryServiceError';
        this.code = options?.code;
        this.details = options?.details;

        // This is needed for instanceof checks in TypeScript
        Object.setPrototypeOf(this, InventoryServiceError.prototype);
    }
}

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
            return data.map((item: IngredientRow) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                cost_per_unit: item.cost,
                reorderLevel: item.reorder_level,
                minimum_stock_level: item.minimum_stock_level,
                reorder_point: item.reorder_point,
                supplier_id: item.supplier_id,
                location: item.location,
                expiryDate: item.expiry_date || undefined,
                supplierId: item.supplier_id || undefined,
                created_at: item.created_at,
                updated_at: item.updated_at
            }));
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
            return data.map((item: IngredientRow) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                cost_per_unit: item.cost,
                reorderLevel: item.reorder_level,
                minimum_stock_level: item.minimum_stock_level,
                reorder_point: item.reorder_point,
                supplier_id: item.supplier_id,
                location: item.location,
                expiryDate: item.expiry_date || undefined,
                supplierId: item.supplier_id || undefined,
                created_at: item.created_at,
                updated_at: item.updated_at
            }));
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
    async addItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem | null> {
        try {
            // Check if supabase client is properly initialized
            if (!supabase) {
                throw new InventoryServiceError('Supabase client is not initialized');
            }

            // Convert to snake_case for the database
            const { data, error } = await supabase
                .from('ingredients')
                .insert({
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    unit: item.unit,
                    reorder_level: item.reorderLevel,
                    cost: item.cost_per_unit,
                    minimum_stock_level: item.minimum_stock_level,
                    reorder_point: item.reorder_point,
                    expiry_date: item.expiryDate || null,
                    supplier_id: item.supplierId || null,
                    location: item.location || null
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding inventory item:', error);
                throw new InventoryServiceError('Failed to add inventory item', {
                    code: error.code,
                    details: error.details || error.message
                });
            }

            if (!data) {
                throw new InventoryServiceError('No data returned after adding item');
            }

            // Transform the response to match our InventoryItem interface
            return {
                id: data.id,
                name: data.name,
                category: data.category,
                quantity: data.quantity,
                unit: data.unit,
                cost_per_unit: data.cost,
                reorderLevel: data.reorder_level,
                minimum_stock_level: data.minimum_stock_level,
                reorder_point: data.reorder_point,
                supplier_id: data.supplier_id || null,
                location: data.location,
                expiryDate: data.expiry_date || null,
                supplierId: data.supplier_id || null,
                created_at: data.created_at,
                updated_at: data.updated_at
            };
        } catch (error) {
            console.error('Error in addItem:', error);

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
     * Update an existing inventory item
     */
    async updateItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<InventoryItem | null> {
        try {
            // Convert to snake_case for the database
            const dbUpdates: Record<string, unknown> = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.category !== undefined) dbUpdates.category = updates.category;
            if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
            if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
            if (updates.reorderLevel !== undefined) dbUpdates.reorder_level = updates.reorderLevel;
            if (updates.cost_per_unit !== undefined) dbUpdates.cost = updates.cost_per_unit;
            if (updates.minimum_stock_level !== undefined) dbUpdates.minimum_stock_level = updates.minimum_stock_level;
            if (updates.reorder_point !== undefined) dbUpdates.reorder_point = updates.reorder_point;
            if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
            if (updates.supplierId !== undefined) dbUpdates.supplier_id = updates.supplierId;
            if (updates.location !== undefined) dbUpdates.location = updates.location;

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
                cost_per_unit: data.cost,
                reorderLevel: data.reorder_level,
                minimum_stock_level: data.minimum_stock_level,
                reorder_point: data.reorder_point,
                supplier_id: data.supplier_id || null,
                location: data.location,
                expiryDate: data.expiry_date || null,
                supplierId: data.supplier_id || null,
                created_at: data.created_at,
                updated_at: data.updated_at
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