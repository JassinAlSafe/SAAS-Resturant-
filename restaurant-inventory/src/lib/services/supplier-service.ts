import { supabase } from '@/lib/supabase';
import { Supplier, SupplierCategory } from '@/lib/types';
import { getBusinessProfileId } from '@/lib/services/business-profile-id';

// Define a type for database supplier records
interface SupplierRecord {
    id: string;
    name: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    categories: SupplierCategory[];
    is_preferred: boolean;
    status: "ACTIVE" | "INACTIVE";
    rating: number;
    last_order_date: string | undefined;
    logo: string | undefined;
    created_at: string;
    updated_at: string;
    business_profile_id: string;
}

export const supplierService = {
    /**
     * Get all suppliers
     */
    async getSuppliers(): Promise<Supplier[]> {
        console.time('getSuppliers');
        try {
            console.log('Attempting to fetch suppliers...');

            // Check if supabase client is properly initialized
            if (!supabase) {
                console.error('Supabase client is not initialized');
                console.timeEnd('getSuppliers');
                return [];
            }

            // Get the business profile ID
            console.time('getBusinessProfileId_in_getSuppliers');
            const businessProfileId = await getBusinessProfileId();
            console.timeEnd('getBusinessProfileId_in_getSuppliers');

            if (!businessProfileId) {
                console.error('No business profile ID found');
                console.timeEnd('getSuppliers');
                return [];
            }

            console.time('supabase_select_suppliers');
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('business_profile_id', businessProfileId)
                .order('name');
            console.timeEnd('supabase_select_suppliers');

            if (error) {
                console.error('Error fetching suppliers:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                console.timeEnd('getSuppliers');
                throw error;
            }

            if (!data) {
                console.log('No data returned from suppliers query');
                console.timeEnd('getSuppliers');
                return [];
            }

            console.log(`Successfully fetched ${data.length} suppliers`);
            console.timeEnd('getSuppliers');

            // Transform the data to match our Supplier interface
            return data.map((item: SupplierRecord) => ({
                id: item.id,
                name: item.name,
                contactName: item.contact_name,
                email: item.email,
                phone: item.phone,
                address: item.address,
                categories: item.categories || [SupplierCategory.OTHER],
                isPreferred: item.is_preferred || false,
                status: item.status || "ACTIVE",
                rating: item.rating || 0,
                lastOrderDate: item.last_order_date,
                logo: item.logo,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));
        } catch (error) {
            console.error('Caught exception in getSuppliers:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
            }
            return [];
        }
    },

    /**
     * Get supplier by ID
     */
    async getSupplierById(id: string): Promise<Supplier | null> {
        try {
            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile ID found');
                return null;
            }

            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', id)
                .eq('business_profile_id', businessProfileId)
                .single();

            if (error) {
                console.error('Error fetching supplier:', error);
                throw error;
            }

            return {
                id: data.id,
                name: data.name,
                contactName: data.contact_name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                categories: data.categories || [SupplierCategory.OTHER],
                isPreferred: data.is_preferred || false,
                status: data.status || "ACTIVE",
                rating: data.rating || 0,
                lastOrderDate: data.last_order_date,
                logo: data.logo,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };
        } catch (error) {
            console.error('Error in getSupplierById:', error);
            return null;
        }
    },

    /**
     * Add a new supplier
     */
    async addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier | null> {
        try {
            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile ID found');
                return null;
            }

            const { data, error } = await supabase
                .from('suppliers')
                .insert({
                    name: supplier.name,
                    contact_name: supplier.contactName,
                    email: supplier.email,
                    phone: supplier.phone,
                    address: supplier.address,
                    categories: supplier.categories,
                    is_preferred: supplier.isPreferred,
                    status: supplier.status,
                    rating: supplier.rating,
                    last_order_date: supplier.lastOrderDate,
                    logo: supplier.logo,
                    business_profile_id: businessProfileId
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding supplier:', error);
                throw error;
            }

            return {
                id: data.id,
                name: data.name,
                contactName: data.contact_name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                categories: data.categories || [SupplierCategory.OTHER],
                isPreferred: data.is_preferred || false,
                status: data.status || "ACTIVE",
                rating: data.rating || 0,
                lastOrderDate: data.last_order_date,
                logo: data.logo,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };
        } catch (error) {
            console.error('Error in addSupplier:', error);
            return null;
        }
    },

    /**
     * Update an existing supplier
     */
    async updateSupplier(id: string, updates: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Supplier | null> {
        try {
            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile ID found');
                return null;
            }

            const dbUpdates: Record<string, unknown> = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.contactName !== undefined) dbUpdates.contact_name = updates.contactName;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
            if (updates.address !== undefined) dbUpdates.address = updates.address;
            if (updates.categories !== undefined) dbUpdates.categories = updates.categories;
            if (updates.isPreferred !== undefined) dbUpdates.is_preferred = updates.isPreferred;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
            if (updates.lastOrderDate !== undefined) dbUpdates.last_order_date = updates.lastOrderDate;
            if (updates.logo !== undefined) dbUpdates.logo = updates.logo;

            const { data, error } = await supabase
                .from('suppliers')
                .update(dbUpdates)
                .eq('id', id)
                .eq('business_profile_id', businessProfileId)
                .select()
                .single();

            if (error) {
                console.error('Error updating supplier:', error);
                throw error;
            }

            return {
                id: data.id,
                name: data.name,
                contactName: data.contact_name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                categories: data.categories || [SupplierCategory.OTHER],
                isPreferred: data.is_preferred || false,
                status: data.status || "ACTIVE",
                rating: data.rating || 0,
                lastOrderDate: data.last_order_date,
                logo: data.logo,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };
        } catch (error) {
            console.error('Error in updateSupplier:', error);
            return null;
        }
    },

    /**
     * Delete a supplier
     */
    async deleteSupplier(id: string): Promise<boolean> {
        try {
            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile ID found');
                return false;
            }

            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id)
                .eq('business_profile_id', businessProfileId);

            if (error) {
                console.error('Error deleting supplier:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteSupplier:', error);
            return false;
        }
    },

    /**
     * Bulk delete suppliers
     */
    async bulkDeleteSuppliers(ids: string[]): Promise<boolean> {
        try {
            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile ID found');
                return false;
            }

            const { error } = await supabase
                .from('suppliers')
                .delete()
                .in('id', ids)
                .eq('business_profile_id', businessProfileId);

            if (error) {
                console.error('Error bulk deleting suppliers:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error in bulkDeleteSuppliers:', error);
            return false;
        }
    },

    /**
     * Get items supplied by a specific supplier
     */
    async getItemsBySupplier(supplierId: string): Promise<{ id: string, name: string }[]> {
        try {
            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile ID found');
                return [];
            }

            // First verify the supplier belongs to this business profile
            const { data: supplierData, error: supplierError } = await supabase
                .from('suppliers')
                .select('id')
                .eq('id', supplierId)
                .eq('business_profile_id', businessProfileId)
                .single();

            if (supplierError || !supplierData) {
                console.error('Error verifying supplier:', supplierError);
                return [];
            }

            // Then get the items
            const { data, error } = await supabase
                .from('ingredients')
                .select('id, name')
                .eq('supplier_id', supplierId)
                .eq('business_profile_id', businessProfileId)
                .order('name');

            if (error) {
                console.error('Error fetching items by supplier:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error in getItemsBySupplier:', error);
            return [];
        }
    },

    /**
     * Send a reorder request to a supplier
     */
    async sendReorderRequest(supplierId: string, items: { id: string, name: string, quantity: number, unit: string }[]): Promise<boolean> {
        try {
            // Get the business profile ID
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                console.error('No business profile ID found');
                return false;
            }

            // First verify the supplier belongs to this business profile
            const { data: supplierData, error: supplierError } = await supabase
                .from('suppliers')
                .select('id, name, email')
                .eq('id', supplierId)
                .eq('business_profile_id', businessProfileId)
                .single();

            if (supplierError || !supplierData) {
                console.error('Error verifying supplier:', supplierError);
                return false;
            }

            // In a real application, this would send an email or create a purchase order
            // For now, we'll just log the request
            console.log(`Sending reorder request to ${supplierData.name} (${supplierData.email})`);
            console.log('Items to reorder:', items);

            // Here you would typically:
            // 1. Create a purchase order record in the database
            // 2. Send an email to the supplier
            // 3. Update inventory status

            // Mock successful request
            return true;
        } catch (error) {
            console.error('Error in sendReorderRequest:', error);
            return false;
        }
    }
}; 