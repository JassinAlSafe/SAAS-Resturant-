// Inventory Item interface
import { CurrencyCode } from "./currency-context";

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    reorderLevel: number;
    cost: number;
    expiryDate?: string; // Optional expiry date in ISO format
    supplierId?: string; // Optional reference to supplier
    createdAt: string;
    updatedAt: string;
}

export interface IngredientRow {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    reorder_level: number;
    cost: number;
    expiry_date?: string;
    supplier_id?: string;
    created_at: string;
    updated_at: string;
}

// Alias for backward compatibility
export type Ingredient = InventoryItem;

// Supplier interface
export interface Supplier {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Dish interface
export interface Dish {
    id: string;
    name: string;
    price: number;
    ingredients: DishIngredient[];
    createdAt: string;
    updatedAt: string;
}

// DishIngredient interface for the relationship between dishes and ingredients
export interface DishIngredient {
    ingredientId: string;
    quantity: number;
}

// Sales interface
export interface Sale {
    id: string;
    dishId: string;
    dishName: string;
    quantity: number;
    totalAmount: number;
    date: string;
    createdAt: string;
}

// User interface
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'staff';
}

// Dashboard stats interface
export interface DashboardStats {
    totalInventoryValue: number;
    lowStockItems: number;
    monthlySales: number;
    salesGrowth: number;
}

// Stock alert interface
export interface StockAlert {
    id: number;
    name: string;
    currentStock: number;
    unit: string;
    minStock: number;
    category: string;
}

// Note interface
export interface Note {
    id: string;
    content: string;
    tags: string[];
    entityType: 'inventory' | 'supplier' | 'sale' | 'general';
    entityId?: string; // Optional reference to the entity (inventory item, supplier, or sale)
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// Note Tag interface
export interface NoteTag {
    id: string;
    name: string;
    color: string;
    createdAt: string;
}

// Business Profile interface
export interface BusinessProfile {
    id: string;
    name: string;
    type: 'cafe' | 'fast_food' | 'fine_dining' | 'casual_dining' | 'bakery' | 'bar' | 'other';
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
    operatingHours: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };
    defaultCurrency: CurrencyCode;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

// Subscription related types
export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    features: string[];
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    isPopular?: boolean;
    priority: number;
}

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid" | "paused";
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    createdAt: string;
    updatedAt: string;
    billingInterval: "monthly" | "yearly";
    trialEnd: string | null;
    pausedAt: string | null;
    resumesAt: string | null;
}

export interface PaymentMethod {
    id: string;
    userId: string;
    type: "card" | "bank_account";
    cardBrand?: string;
    cardLastFour?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    billingDetails: {
        name: string;
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    createdAt: string;
}

export interface InvoiceItem {
    id: string;
    description: string;
    amount: number;
    quantity: number;
}

export interface Invoice {
    id: string;
    userId: string;
    subscriptionId: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: "draft" | "open" | "paid" | "uncollectible" | "void";
    invoiceDate: string;
    dueDate: string;
    paidAt: string | null;
    pdf: string | null;
    items: InvoiceItem[];
} 