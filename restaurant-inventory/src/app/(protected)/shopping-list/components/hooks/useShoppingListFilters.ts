"use client";

import { useState, useCallback, useMemo } from 'react';
import { ShoppingListItem } from '@/lib/types';

export interface ShoppingListFilters {
    search: string;
    category: string;
    showPurchased: boolean;
    sortBy: 'name' | 'category' | 'date' | 'cost';
    sortDirection: 'asc' | 'desc';
}

const defaultFilters: ShoppingListFilters = {
    search: '',
    category: '',
    showPurchased: false,
    sortBy: 'name',
    sortDirection: 'asc',
};

export default function useShoppingListFilters(initialFilters?: Partial<ShoppingListFilters>) {
    const [filters, setFilters] = useState<ShoppingListFilters>({
        ...defaultFilters,
        ...initialFilters,
    });

    // Update a single filter
    const updateFilter = useCallback(<K extends keyof ShoppingListFilters>(
        key: K,
        value: ShoppingListFilters[K]
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Reset all filters to default values
    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    // Apply filters to a list of items
    const filterItems = useCallback(
        (items: ShoppingListItem[]) => {
            return items.filter((item) => {
                // Filter by purchased status
                if (!filters.showPurchased && item.isPurchased) {
                    return false;
                }

                // Filter by category
                if (filters.category && item.category !== filters.category) {
                    return false;
                }

                // Filter by search term
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    const nameMatch = item.name.toLowerCase().includes(searchLower);
                    const categoryMatch = item.category.toLowerCase().includes(searchLower);
                    const notesMatch = item.notes?.toLowerCase().includes(searchLower);

                    if (!nameMatch && !categoryMatch && !notesMatch) {
                        return false;
                    }
                }

                return true;
            });
        },
        [filters]
    );

    // Sort filtered items
    const sortItems = useCallback(
        (items: ShoppingListItem[]) => {
            return [...items].sort((a, b) => {
                let comparison = 0;

                switch (filters.sortBy) {
                    case 'name':
                        comparison = a.name.localeCompare(b.name);
                        break;
                    case 'category':
                        comparison = a.category.localeCompare(b.category);
                        break;
                    case 'date':
                        // Assuming items have a createdAt property
                        comparison = (a.createdAt || 0) - (b.createdAt || 0);
                        break;
                    case 'cost':
                        comparison = (a.estimatedCost || 0) - (b.estimatedCost || 0);
                        break;
                }

                return filters.sortDirection === 'asc' ? comparison : -comparison;
            });
        },
        [filters.sortBy, filters.sortDirection]
    );

    // Apply filters and sorting in one go
    const processItems = useCallback(
        (items: ShoppingListItem[]) => {
            const filtered = filterItems(items);
            return sortItems(filtered);
        },
        [filterItems, sortItems]
    );

    return {
        filters,
        updateFilter,
        resetFilters,
        filterItems,
        sortItems,
        processItems,
    };
} 