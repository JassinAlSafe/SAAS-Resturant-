import { z } from "zod";
import { ShoppingListItem } from "@/lib/types";

// Form schema with validation
export const formSchema = z.object({
    name: z.string().min(1, "Item name is required").max(100, "Name is too long"),
    quantity: z.coerce
        .number()
        .min(0.01, "Quantity must be greater than 0")
        .max(1000000, "Quantity is too large"),
    unit: z.string().min(1, "Unit is required"),
    category: z.string().optional(),
    estimatedCost: z.coerce
        .number()
        .min(0, "Cost must be 0 or greater")
        .max(1000000, "Cost is too large"),
    notes: z.string().optional(),
    isUrgent: z.boolean().default(false),
    custom_unit: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

// Save recent categories to local storage
export const RECENTLY_USED_KEY = "recentlyUsedCategories";

export interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddItem: (item: Partial<ShoppingListItem>) => Promise<void>;
    categories: string[];
    isAddingItem: boolean;
    initialData?: ShoppingListItem;
}

// Unit options grouped by type
export const unitGroups = {
    weight: ["kg", "g", "lb", "oz"],
    volume: ["l", "ml", "gal", "qt", "tbsp", "tsp", "cup"],
    count: ["pieces", "boxes", "bags", "bottles", "cans", "packs", "dozen"],
}; 