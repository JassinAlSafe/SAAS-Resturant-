import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

export function useInventoryQuery() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Query for fetching all inventory items
    const {
        data: items = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            // Get the current user's business profile
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Get the user's business profile
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
                .from('ingredients')
                .select('*, suppliers(*)')
                .eq('business_profile_id', businessProfile.id)
                .order('name');

            if (error) throw error;
            return data as InventoryItem[];
        }
    });

    // Query for fetching categories (derived from items)
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(items.map(item => item.category))];
        return uniqueCategories.filter(Boolean);
    }, [items]);

    // Add a new inventory item
    const addItemMutation = useMutation({
        mutationFn: async (newItem: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('ingredients')
                .insert(newItem)
                .select()
                .single();

            if (error) throw error;
            return data as InventoryItem;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast({
                title: "Item Added",
                description: `${data.name} has been added to inventory.`
            });
        },
        onError: (error) => {
            console.error('Error adding item:', error);
            toast({
                title: "Error",
                description: "Failed to add item. Please try again.",
                variant: "destructive"
            });
        }
    });

    // Update an inventory item
    const updateItemMutation = useMutation({
        mutationFn: async ({ id, itemData }: {
            id: string;
            itemData: Partial<InventoryItem>
        }) => {
            const { data, error } = await supabase
                .from('ingredients')
                .update(itemData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as InventoryItem;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast({
                title: "Item Updated",
                description: `${data.name} has been updated.`
            });
        },
        onError: (error) => {
            console.error('Error updating item:', error);
            toast({
                title: "Error",
                description: "Failed to update item. Please try again.",
                variant: "destructive"
            });
        }
    });

    // Delete an inventory item
    const deleteItemMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('ingredients')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            const deletedItem = items.find(item => item.id === id);
            if (deletedItem) {
                toast({
                    title: "Item Deleted",
                    description: `${deletedItem.name} has been removed from inventory.`
                });
            }
        },
        onError: (error) => {
            console.error('Error deleting item:', error);
            toast({
                title: "Error",
                description: "Failed to delete item. Please try again.",
                variant: "destructive"
            });
        }
    });

    // Real-time subscription setup
    const setupSubscription = () => {
        const subscription = supabase
            .channel('inventory_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'ingredients' },
                () => {
                    // Refresh data when changes occur
                    queryClient.invalidateQueries({ queryKey: ['inventory'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    };

    // Helper functions for inventory analysis
    const itemsByCategory = useMemo(() => {
        const grouped: Record<string, InventoryItem[]> = {};

        items.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });

        return grouped;
    }, [items]);

    // Helper function to check if an item is low on stock
    const isLowStock = (item: InventoryItem): boolean => {
        const reorderLevel = item.reorder_point || item.minimum_stock_level || 5;
        return item.quantity <= reorderLevel && item.quantity > 0;
    };

    // Helper function to check if an item is out of stock
    const isOutOfStock = (item: InventoryItem): boolean => {
        return item.quantity === 0;
    };

    // Calculate low stock items
    const lowStockItems = useMemo(() => {
        return items.filter(item => isLowStock(item));
    }, [items]);

    // Calculate out of stock items
    const outOfStockItems = useMemo(() => {
        return items.filter(item => isOutOfStock(item));
    }, [items]);

    // Calculate total inventory value
    const totalInventoryValue = useMemo(() => {
        return items.reduce((total, item) => {
            return total + (item.quantity * item.cost_per_unit);
        }, 0);
    }, [items]);

    return {
        // Queries and data
        items,
        categories,
        isLoading,
        error,
        refetch,

        // Mutations
        addItem: addItemMutation.mutate,
        isAddingItem: addItemMutation.isPending,
        updateItem: updateItemMutation.mutate,
        isUpdatingItem: updateItemMutation.isPending,
        deleteItem: deleteItemMutation.mutate,
        isDeletingItem: deleteItemMutation.isPending,

        // Helper functions
        setupSubscription,
        itemsByCategory,
        isLowStock,
        isOutOfStock,

        // Computed values
        lowStockItems,
        outOfStockItems,
        totalInventoryValue
    };
} 