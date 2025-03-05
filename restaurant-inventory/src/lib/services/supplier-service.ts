import { supabase } from '@/lib/supabase';
import { Supplier, SupplierCategory } from '@/lib/types';

export const supplierService = {
    /**
     * Get all suppliers
     */
    async getSuppliers(): Promise<Supplier[]> {
        try {
            console.log('Attempting to fetch suppliers...');

            // Check if supabase client is properly initialized
            if (!supabase) {
                console.error('Supabase client is not initialized');
                return [];
            }

            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching suppliers:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }

            if (!data) {
                console.log('No data returned from suppliers query');
                return [];
            }

            console.log(`Successfully fetched ${data.length} suppliers`);

            // Transform the data to match our Supplier interface
            return data.map((item: any) => ({
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
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', id)
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
                    logo: supplier.logo
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
            const dbUpdates: any = {};
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
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id);

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
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .in('id', ids);

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
     * Get inventory items by supplier ID
     */
    async getItemsBySupplier(supplierId: string): Promise<{ id: string, name: string }[]> {
        try {
            const { data, error } = await supabase
                .from('ingredients')
                .select('id, name')
                .eq('supplier_id', supplierId)
                .order('name');

            if (error) {
                console.error('Error fetching supplier items:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in getItemsBySupplier:', error);
            return [];
        }
    },

    /**
     * Send reorder request to supplier
     * This is a simplified example - in a real app, you might integrate with email API or ERP system
     */
    async sendReorderRequest(supplierId: string, items: { id: string, name: string, quantity: number, unit: string }[]): Promise<boolean> {
        try {
            // In a real app, this would send an email, create an order in ERP, etc.
            // For now, we'll just log the reorder request
            console.log(`Sending reorder request to supplier ${supplierId}:`, items);

            // Simulate API call success
            await new Promise(resolve => setTimeout(resolve, 500));

            return true;
        } catch (error) {
            console.error('Error in sendReorderRequest:', error);
            return false;
        }
    }
}; 