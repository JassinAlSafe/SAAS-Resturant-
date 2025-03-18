import { supabase } from '../supabase';
import type { InventoryItem, InventoryFormData } from '../types';

// Cache for business profile ID
let cachedBusinessProfileId: string | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Database response type
type DbIngredient = {
    id: string;
    name: string;
    description: string | null;
    category: string;
    quantity: number;
    unit: string;
    cost: number;

    minimum_stock_level: number | null;
    reorder_level: number | null;
    reorder_point: number | null;
    supplier_id: string | null;
    location: string | null;
    expiry_date: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
    business_profile_id: string;
};

// Helper function to get business profile ID
async function getBusinessProfileId() {
    console.time('getBusinessProfileId');

    // Check if we have a valid cached value
    const now = Date.now();
    if (cachedBusinessProfileId && now < cacheExpiry) {
        console.log('Using cached business profile ID');
        console.timeEnd('getBusinessProfileId');
        return cachedBusinessProfileId;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.timeEnd('getBusinessProfileId');
            throw new Error("Not authenticated");
        }

        // First try to get from business_profile_users table
        const { data: businessProfileData, error: profileError } = await supabase
            .from('business_profile_users')
            .select('business_profile_id')
            .eq('user_id', user.id)
            .single();

        if (!profileError && businessProfileData) {
            // Cache the result
            cachedBusinessProfileId = businessProfileData.business_profile_id;
            cacheExpiry = now + CACHE_DURATION;
            console.timeEnd('getBusinessProfileId');
            return cachedBusinessProfileId;
        }

        // If that fails, try direct query to business_profiles
        const { data: businessProfiles, error: profilesError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (!profilesError && businessProfiles && businessProfiles.length > 0) {
            // Cache the result
            cachedBusinessProfileId = businessProfiles[0].id;
            cacheExpiry = now + CACHE_DURATION;
            console.timeEnd('getBusinessProfileId');
            return cachedBusinessProfileId;
        }

        console.warn('No business profile found for user');
        console.timeEnd('getBusinessProfileId');
        return null;
    } catch (error) {
        console.error('Error in getBusinessProfileId:', error);
        console.timeEnd('getBusinessProfileId');
        return null;
    }
}

// Transform database response to InventoryItem
const mapDbToInventoryItem = (data: DbIngredient): InventoryItem => {
    return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        cost: data.cost,
        cost_per_unit: data.cost,
        reorder_level: data.reorder_level || 0,
        supplier_id: data.supplier_id || undefined,
        location: data.location || undefined,
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
                console.error('Supabase client is not initialized');
                return [];
            }

            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile found');
                return [];
            }

            const { data, error } = await supabase
                .from('ingredients')
                .select('*')
                .eq('business_profile_id', businessProfileId)
                .order('name');

            if (error) {
                console.error('Error fetching inventory items:', error);
                throw error;
            }

            return data.map(mapDbToInventoryItem);
        } catch (error) {
            console.error('Error in getItems:', error);
            return [];
        }
    },

    /**
     * Get inventory items that will expire soon
     */
    async getSoonToExpireItems(daysThreshold: number = 7): Promise<InventoryItem[]> {
        try {
            // Check if supabase client is properly initialized
            if (!supabase) {
                console.error('Supabase client is not initialized');
                return [];
            }

            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile found');
                return [];
            }

            // Calculate the date threshold
            const today = new Date();
            const thresholdDate = new Date();
            thresholdDate.setDate(today.getDate() + daysThreshold);

            const { data, error } = await supabase
                .from('ingredients')
                .select('*')
                .eq('business_profile_id', businessProfileId)
                .not('expiry_date', 'is', null)
                .lte('expiry_date', thresholdDate.toISOString().split('T')[0])
                .order('expiry_date');

            if (error) {
                console.error('Error fetching soon to expire items:', error);
                throw error;
            }

            return data.map(mapDbToInventoryItem);
        } catch (error) {
            console.error('Error in getSoonToExpireItems:', error);
            return [];
        }
    },

    /**
     * Add a new inventory item
     */
    async addItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem | null> {
        console.time('addItem');
        try {
            if (!supabase) {
                console.error('Supabase client is not initialized');
                console.timeEnd('addItem');
                return null;
            }

            console.time('getBusinessProfileId_in_addItem');
            const businessProfileId = await getBusinessProfileId();
            console.timeEnd('getBusinessProfileId_in_addItem');

            if (!businessProfileId) {
                console.error("No business profile found");
                console.timeEnd('addItem');
                throw new Error("No business profile found");
            }

            // Prepare data with required fields and their default values
            const now = new Date().toISOString();

            // Handle reorder_level explicitly to avoid type issues
            let reorderLevel = 0;
            if (typeof item.reorder_level === 'number') {
                reorderLevel = item.reorder_level;
            } else if (item.reorder_level !== undefined) {
                reorderLevel = Number(item.reorder_level) || 0;
            }

            const itemData = {
                name: item.name,
                category: item.category,
                quantity: item.quantity || 0,
                unit: item.unit,
                cost: item.cost || 0,
                reorder_level: reorderLevel,
                supplier_id: item.supplier_id || null,
                image_url: item.image_url || null,
                expiry_date: item.expiry_date || null,
                business_profile_id: businessProfileId,
                created_at: now,
                updated_at: now
            };

            console.time('supabase_insert');
            const { data, error } = await supabase
                .from('ingredients')
                .insert(itemData)
                .select('*')
                .single();
            console.timeEnd('supabase_insert');

            if (error) {
                console.error('Error adding inventory item:', error);
                console.timeEnd('addItem');
                throw error;
            }

            if (!data) {
                console.error('No data returned from insert operation');
                console.timeEnd('addItem');
                return null;
            }

            // Map the database item to our InventoryItem interface
            const newItem = mapDbToInventoryItem(data);
            console.timeEnd('addItem');
            return newItem;
        } catch (error) {
            console.error('Error in addItem:', error);
            console.timeEnd('addItem');
            throw error;
        }
    },

    /**
     * Update an existing inventory item
     */
    async updateItem(id: string, updates: Partial<InventoryFormData>): Promise<InventoryItem | null> {
        try {
            // Check if supabase client is properly initialized
            if (!supabase) {
                console.error('Supabase client is not initialized');
                return null;
            }

            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                throw new Error("No business profile found");
            }

            const { data, error } = await supabase
                .from('ingredients')
                .update(updates)
                .eq('id', id)
                .eq('business_profile_id', businessProfileId)
                .select()
                .single();

            if (error) throw error;
            return mapDbToInventoryItem(data);
        } catch (error) {
            console.error('Error updating inventory item:', error);
            throw error;
        }
    },

    /**
     * Delete an inventory item
     */
    async deleteItem(id: string): Promise<boolean> {
        try {
            // Check if supabase client is properly initialized
            if (!supabase) {
                console.error('Supabase client is not initialized');
                return false;
            }

            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                throw new Error("No business profile found");
            }

            const { error } = await supabase
                .from('ingredients')
                .delete()
                .eq('id', id)
                .eq('business_profile_id', businessProfileId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            return false;
        }
    },

    /**
     * Get all unique categories
     */
    async getCategories(): Promise<string[]> {
        try {
            // Check if supabase client is properly initialized
            if (!supabase) {
                console.error('Supabase client is not initialized');
                return [];
            }

            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile found');
                return [];
            }

            const { data, error } = await supabase
                .from('ingredients')
                .select('category')
                .eq('business_profile_id', businessProfileId)
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