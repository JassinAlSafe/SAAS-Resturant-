import { useCallback } from 'react';
import { toast } from 'sonner';
import { shoppingListService } from '@/lib/services/shopping-list-service';
import { InventoryItem } from '@/lib/types';

export function useLowStockHandler() {
    const handleLowStockItems = useCallback(async (lowStockItems: InventoryItem[]) => {
        try {
            // Generate shopping list items from low stock ingredients
            const generatedItems = await shoppingListService.generateList(lowStockItems);

            if (generatedItems.length > 0) {
                // Show success toast with action to view shopping list
                toast.success(
                    `Added ${generatedItems.length} items to shopping list`,
                    {
                        description: 'Low stock items have been added to your shopping list.',
                        action: {
                            label: 'View List',
                            onClick: () => window.location.href = '/shopping-list'
                        }
                    }
                );

                return generatedItems;
            }

            return [];
        } catch (error) {
            console.error('Error handling low stock items:', error);
            toast.error('Failed to update shopping list', {
                description: 'There was an error adding low stock items to the shopping list.'
            });
            return [];
        }
    }, []);

    return {
        handleLowStockItems
    };
} 