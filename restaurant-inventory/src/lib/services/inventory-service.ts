import { supabase } from '../supabase';
import type { InventoryItem, InventoryFormData } from '../types';

// Cache for business profile ID
let cachedBusinessProfileId: string | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Timer tracking to prevent duplicate timer errors
const activeTimers = new Set<string>();

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

// Safe timer functions to prevent duplicate timer errors
const safeStartTimer = (label: string) => {
    if (activeTimers.has(label)) {
        console.warn(`Timer '${label}' already exists`);
        return;
    }
    activeTimers.add(label);
    console.time(label);
};

const safeEndTimer = (label: string) => {
    if (!activeTimers.has(label)) {
        console.warn(`Timer '${label}' does not exist`);
        return;
    }
    console.timeEnd(label);
    activeTimers.delete(label);
};

// Helper function to get business profile ID
async function getBusinessProfileId() {
    const timerLabel = 'getBusinessProfileId';
    safeStartTimer(timerLabel);

    // Check if we have a valid cached value
    const now = Date.now();
    if (cachedBusinessProfileId && now < cacheExpiry) {
        console.log('Using cached business profile ID:', cachedBusinessProfileId);
        safeEndTimer(timerLabel);
        return cachedBusinessProfileId;
    }

    try {
        console.log('Fetching current user...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error('Auth error:', userError);
            safeEndTimer(timerLabel);
            throw new Error(`Authentication error: ${userError.message}`);
        }

        if (!user) {
            console.error('No authenticated user found');
            safeEndTimer(timerLabel);
            throw new Error("Not authenticated");
        }

        console.log('User found, fetching business profile...', user.id);

        // First try to get from business_profile_users table
        const { data: businessProfileData, error: profileError } = await supabase
            .from('business_profile_users')
            .select('business_profile_id')
            .eq('user_id', user.id)
            .single();

        if (profileError) {
            console.log('Error getting business profile from business_profile_users:', profileError);
        }

        if (!profileError && businessProfileData) {
            console.log('Found business profile from business_profile_users:', businessProfileData);
            // Cache the result
            cachedBusinessProfileId = businessProfileData.business_profile_id;
            cacheExpiry = now + CACHE_DURATION;
            safeEndTimer(timerLabel);
            return cachedBusinessProfileId;
        }

        // If that fails, try direct query to business_profiles
        console.log('Trying direct query to business_profiles');
        const { data: businessProfiles, error: profilesError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (profilesError) {
            console.error('Error getting business profiles:', profilesError);
        }

        if (!profilesError && businessProfiles && businessProfiles.length > 0) {
            console.log('Found business profile from direct query:', businessProfiles[0]);
            // Cache the result
            cachedBusinessProfileId = businessProfiles[0].id;
            cacheExpiry = now + CACHE_DURATION;
            safeEndTimer(timerLabel);
            return cachedBusinessProfileId;
        }

        console.warn('No business profile found for user');
        safeEndTimer(timerLabel);

        // For development only: return a fallback ID to avoid breaking the app
        if (process.env.NODE_ENV === 'development') {
            console.log('Using fallback business profile ID for development');
            return 'fallback-business-id';
        }

        return null;
    } catch (error) {
        console.error('Error in getBusinessProfileId:', error);
        safeEndTimer(timerLabel);

        // For development only: return a fallback ID to avoid breaking the app
        if (process.env.NODE_ENV === 'development') {
            console.log('Using fallback business profile ID for development due to error');
            return 'fallback-business-id';
        }

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
            console.log('getItems: Starting retrieval...');

            // Check if supabase client is properly initialized
            if (!supabase) {
                console.error('getItems: Supabase client is not initialized');

                // For development, provide mock data
                if (process.env.NODE_ENV === 'development') {
                    console.log('getItems: Returning mock data for development');
                    const mockItems = this.getMockItems();
                    console.log(`getItems: Returned ${mockItems.length} mock items`);
                    return mockItems;
                }

                return [];
            }

            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            console.log('getItems: Retrieved business profile ID:', businessProfileId);

            if (!businessProfileId) {
                console.error('getItems: No business profile found');

                // For development, provide mock data
                if (process.env.NODE_ENV === 'development') {
                    console.log('getItems: Returning mock data for development');
                    const mockItems = this.getMockItems();
                    console.log(`getItems: Returned ${mockItems.length} mock items`);
                    return mockItems;
                }

                return [];
            }

            console.log('getItems: Querying database...');
            const { data, error } = await supabase
                .from('ingredients')
                .select('*')
                .eq('business_profile_id', businessProfileId)
                .order('name');

            if (error) {
                console.error('getItems: Error fetching inventory items:', error);
                throw error;
            }

            console.log(`getItems: Successfully retrieved ${data.length} items`);
            const mappedItems = data.map(mapDbToInventoryItem);
            console.log('getItems: First few items:', mappedItems.slice(0, 3));

            return mappedItems;
        } catch (error) {
            console.error('getItems: Error:', error);

            // For development, provide mock data
            if (process.env.NODE_ENV === 'development') {
                console.log('getItems: Returning mock data for development due to error');
                const mockItems = this.getMockItems();
                console.log(`getItems: Returned ${mockItems.length} mock items`);
                return mockItems;
            }

            return [];
        }
    },

    /**
     * Provide mock data for development
     */
    getMockItems(): InventoryItem[] {
        return [
            {
                id: 'mock-item-1',
                name: 'Flour',
                description: 'All-purpose flour',
                category: 'Dry Goods',
                quantity: 10,
                unit: 'kg',
                cost: 2.5,
                cost_per_unit: 2.5,
                reorder_level: 5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'mock-item-2',
                name: 'Sugar',
                description: 'White granulated sugar',
                category: 'Dry Goods',
                quantity: 15,
                unit: 'kg',
                cost: 3.0,
                cost_per_unit: 3.0,
                reorder_level: 7,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'mock-item-3',
                name: 'Milk',
                description: 'Fresh whole milk',
                category: 'Dairy',
                quantity: 20,
                unit: 'liter',
                cost: 1.8,
                cost_per_unit: 1.8,
                reorder_level: 10,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'mock-item-4',
                name: 'Eggs',
                description: 'Large free-range eggs',
                category: 'Dairy',
                quantity: 30,
                unit: 'dozen',
                cost: 4.5,
                cost_per_unit: 4.5,
                reorder_level: 5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'mock-item-5',
                name: 'Olive Oil',
                description: 'Extra virgin olive oil',
                category: 'Oils & Vinegars',
                quantity: 8,
                unit: 'liter',
                cost: 9.0,
                cost_per_unit: 9.0,
                reorder_level: 3,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
    },

    /**
     * Get a single inventory item by ID
     */
    async getItem(id: string): Promise<InventoryItem | null> {
        try {
            const businessProfileId = await getBusinessProfileId();

            const { data, error } = await supabase
                .from('ingredients')
                .select('*')
                .eq('id', id)
                .eq('business_profile_id', businessProfileId)
                .single();

            if (error) {
                console.error('Error fetching inventory item:', error);
                return null;
            }

            return data ? mapDbToInventoryItem(data as DbIngredient) : null;
        } catch (error) {
            console.error('Error in getItem:', error);
            return null;
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
    async addItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem | null> {
        const addItemTimer = 'addItem';
        safeStartTimer(addItemTimer);
        try {
            if (!supabase) {
                console.error('Supabase client is not initialized');
                safeEndTimer(addItemTimer);
                return null;
            }

            const getProfileTimer = 'getBusinessProfileId_in_addItem';
            safeStartTimer(getProfileTimer);
            const businessProfileId = await getBusinessProfileId();
            safeEndTimer(getProfileTimer);

            if (!businessProfileId) {
                console.error("No business profile found");
                safeEndTimer(addItemTimer);
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

            const insertTimer = 'supabase_insert';
            safeStartTimer(insertTimer);
            const { data, error } = await supabase
                .from('ingredients')
                .insert(itemData)
                .select('*')
                .single();
            safeEndTimer(insertTimer);

            if (error) {
                console.error('Error adding inventory item:', error);
                safeEndTimer(addItemTimer);
                throw error;
            }

            if (!data) {
                console.error('No data returned from insert operation');
                safeEndTimer(addItemTimer);
                return null;
            }

            // Map the database item to our InventoryItem interface
            const newItem = mapDbToInventoryItem(data);
            safeEndTimer(addItemTimer);
            return newItem;
        } catch (error) {
            console.error('Error in addItem:', error);
            safeEndTimer(addItemTimer);
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
            console.log('getCategories: Starting retrieval...');

            // Check if supabase client is properly initialized
            if (!supabase) {
                console.error('getCategories: Supabase client is not initialized');

                // For development, provide mock categories
                if (process.env.NODE_ENV === 'development') {
                    console.log('getCategories: Returning mock categories for development');
                    return ['Dry Goods', 'Dairy', 'Produce', 'Meat', 'Seafood', 'Oils & Vinegars', 'Spices'];
                }

                return [];
            }

            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            console.log('getCategories: Retrieved business profile ID:', businessProfileId);

            if (!businessProfileId) {
                console.error('getCategories: No business profile found');

                // For development, provide mock categories
                if (process.env.NODE_ENV === 'development') {
                    console.log('getCategories: Returning mock categories for development');
                    return ['Dry Goods', 'Dairy', 'Produce', 'Meat', 'Seafood', 'Oils & Vinegars', 'Spices'];
                }

                return [];
            }

            console.log('getCategories: Querying database...');
            const { data, error } = await supabase
                .from('ingredients')
                .select('category')
                .eq('business_profile_id', businessProfileId)
                .order('category');

            if (error) {
                console.error('getCategories: Error fetching categories:', error);
                throw error;
            }

            // Extract unique categories
            const categories = [...new Set(data.map(item => item.category))];
            console.log(`getCategories: Successfully retrieved ${categories.length} categories:`, categories);

            return categories;
        } catch (error) {
            console.error('getCategories: Error:', error);

            // For development, provide mock categories
            if (process.env.NODE_ENV === 'development') {
                console.log('getCategories: Returning mock categories for development due to error');
                return ['Dry Goods', 'Dairy', 'Produce', 'Meat', 'Seafood', 'Oils & Vinegars', 'Spices'];
            }

            return [];
        }
    },

    // Alias methods for backward compatibility
    getIngredients: function () { return this.getItems(); },
    addIngredient: function (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) { return this.addItem(data); },
    updateIngredient: function (id: string, data: Partial<InventoryFormData>) { return this.updateItem(id, data); },
    deleteIngredient: function (id: string) { return this.deleteItem(id); }
};