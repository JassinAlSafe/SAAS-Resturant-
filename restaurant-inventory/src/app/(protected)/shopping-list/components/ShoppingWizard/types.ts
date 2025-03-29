import { ShoppingListItem } from "@/lib/types";
import { LucideIcon, CheckCircle, ClipboardList, ShoppingCart } from "lucide-react";

export interface ShoppingWizardProps {
    shoppingList?: ShoppingListItem[];
    categories?: string[];
    onAddItem: () => void;
    onGenerateList: () => Promise<void>;
    onMarkAllPurchased: () => Promise<void>;
    isGenerating: boolean;
    totalEstimatedCost: number;
    isPending: boolean;
}

export interface StepProps {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
}

export const WIZARD_STEPS: StepProps[] = [
    {
        id: "plan",
        title: "Plan Your List",
        icon: ClipboardList,
        description: "Create your shopping list before going to the store",
    },
    {
        id: "shop",
        title: "Shopping Time",
        icon: ShoppingCart,
        description: "Check off items as you shop",
    },
    {
        id: "complete",
        title: "Review & Complete",
        icon: CheckCircle,
        description: "Finalize your shopping trip",
    },
]; 