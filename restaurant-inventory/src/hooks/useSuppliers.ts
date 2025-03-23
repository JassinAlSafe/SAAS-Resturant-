import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Supplier } from '@/types/database.types';
import {
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier
} from '@/lib/api';

export function useSuppliers() {
    const queryClient = useQueryClient();

    // Get all suppliers
    const {
        data: suppliers = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['suppliers'],
        queryFn: getSuppliers,
    });

    // Get a single supplier - return a hook function
    const useSupplierDetails = (id?: string) => {
        return useQuery({
            queryKey: ['suppliers', id],
            queryFn: () => id ? getSupplier(id) : null,
            enabled: !!id, // Only run the query if there\'s an ID
        });
    };

    // Create a new supplier
    const createMutation = useMutation({
        mutationFn: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
            return createSupplier(supplier);
        },
        onSuccess: () => {
            // Invalidate the suppliers query to refetch the updated list
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
    });

    // Update a supplier
    const updateMutation = useMutation({
        mutationFn: ({ id, supplier }: { id: string; supplier: Partial<Supplier> }) => {
            return updateSupplier(id, supplier);
        },
        onSuccess: (data) => {
            // Update both the list and the individual supplier in the cache
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            queryClient.invalidateQueries({ queryKey: ['suppliers', data.id] });
        },
    });

    // Delete a supplier
    const deleteMutation = useMutation({
        mutationFn: (id: string) => {
            return deleteSupplier(id);
        },
        onSuccess: (_, id) => {
            // Update the cache
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            queryClient.removeQueries({ queryKey: ['suppliers', id] });
        },
    });

    // Helper function to get preferred suppliers
    const getPreferredSuppliers = () => {
        return suppliers.filter(supplier => supplier.is_preferred);
    };

    return {
        // Queries
        suppliers,
        isLoading,
        error,
        useSupplierDetails,

        // Mutations
        createSupplier: createMutation.mutate,
        isCreating: createMutation.isPending,
        updateSupplier: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteSupplier: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,

        // Computed values
        preferredSuppliers: getPreferredSuppliers(),
    };
} 