// Type definitions for the Restaurant Inventory Management System

// Ingredient interface
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

// Dish interface
export interface Dish {
  id: string;
  name: string;
  price: number;
  category?: string;
  allergies?: string[];
  foodCost?: number;
  popularity?: number;
  imageUrl?: string;
  description?: string;
  ingredients: DishIngredient[];
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

// DishIngredient interface for the relationship between dishes and ingredients
export interface DishIngredient {
  ingredientId: string;
  quantity: number;
  unit?: string;
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
  userId?: string;
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

// Basic types used throughout the application

// User profile type
export type User = {
  id: string;
  email: string;
  name: string;
  role?: "admin" | "manager" | "staff";
  avatar_url?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  last_login?: Date | string;
  status?: "active" | "pending" | "suspended";
  department?: string;
  mfa_enabled?: boolean;
};

// Database row type for ingredients table
export interface IngredientRow {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  minimum_stock_level?: number;
  reorder_level?: number;
  reorder_point?: number;
  supplier_id?: string;
  location?: string;
  expiry_date?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  suppliers?: Supplier | null;
}

// Inventory item type that matches both database schema and frontend needs
export type InventoryItem = {
  id: string;
  name: string;                    // Required
  description?: string;            // Optional
  category: string;                // Required
  unit: string;                    // Required
  quantity: number;                // Required, defaults to 0
  cost: number;                    // Required, defaults to 0
  cost_per_unit?: number;          // Frontend display alias (optional)
  reorder_level: number;           // Required, defaults to 0
  max_stock?: number;              // Maximum stock level for inventory visualization
  supplier_id?: string;            // Optional
  location?: string;               // Optional
  expiry_date?: string;            // Optional
  image_url?: string;              // Optional
  created_at: string;              // Required, auto-generated
  updated_at: string;              // Required, auto-generated
  business_profile_id?: string;    // Required for DB, but optional in frontend
};

// Form data type for inventory items
export type InventoryFormData = Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'> & {
  supplierId?: string; // Frontend alias for supplier_id
  expiryDate?: string; // Frontend alias for expiry_date
  reorderLevel?: number; // Frontend alias for reorder_level
};

// Supplier category enum
export enum SupplierCategory {
  MEAT = "MEAT",
  DAIRY = "DAIRY",
  VEGETABLES = "VEGETABLES",
  FRUITS = "FRUITS",
  BEVERAGES = "BEVERAGES",
  BAKERY = "BAKERY",
  SEAFOOD = "SEAFOOD",
  DRY_GOODS = "DRY_GOODS",
  OTHER = "OTHER",
}

// Supplier type
export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  categories: SupplierCategory[];
  isPreferred: boolean;
  status: "ACTIVE" | "INACTIVE";
  rating: number;
  lastOrderDate?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

// Recipe type
export type Recipe = {
  id: string;
  name: string;
  description?: string;
  category: string;
  preparation_time?: number;
  cooking_time?: number;
  serving_size: number;
  cost_per_serving?: number;
  selling_price?: number;
  ingredients: RecipeIngredient[];
  instructions?: string;
  created_at: Date | string;
  updated_at: Date | string;
};

// Recipe ingredient type
export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  inventory_item?: InventoryItem;
};

// Sales transaction type
export type SalesTransaction = {
  id: string;
  date: Date | string;
  total_amount: number;
  discount?: number;
  tax?: number;
  payment_method: string;
  items: SalesItem[];
  created_at: Date | string;
  updated_at: Date | string;
};

// Sales item type
export type SalesItem = {
  id: string;
  transaction_id: string;
  recipe_id: string;
  quantity: number;
  price_per_unit: number;
  recipe?: Recipe;
};

// Purchase order type
export type PurchaseOrder = {
  id: string;
  supplier_id: string;
  order_date: Date | string;
  expected_delivery_date?: Date | string;
  status: "pending" | "approved" | "delivered" | "cancelled";
  total_amount: number;
  items: PurchaseOrderItem[];
  notes?: string;
  created_at: Date | string;
  updated_at: Date | string;
  supplier?: Supplier;
};

// Purchase order item type
export type PurchaseOrderItem = {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity: number;
  cost_per_unit: number;
  inventory_item?: InventoryItem;
};

export interface CategoryStat {
  id: string;
  name: string;
  count: number;
  change: number;
  iconName: string;
  color: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  brand?: string;
  lastFour?: string;
  last4?: string; // Added for compatibility with Stripe
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  name?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  monthlyPrice: number;
  yearlyPrice: number;
  interval: 'month' | 'year';
  currency: string;
  features: string[];
  isPopular?: boolean;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  billingInterval: 'monthly' | 'yearly';
  canceledAt?: string;
  endedAt?: string;
  trialStart?: string;
  trialEnd?: string;
  pausedAt?: string;
  resumesAt?: string;
  plan?: SubscriptionPlan;
  planId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  amount: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  currency: string;
  date: string;
  dueDate?: string;
  description?: string;
  pdf?: string;
  hostedInvoiceUrl?: string;
  createdAt: string;
  items?: InvoiceItem[];
}

export interface OperatingHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  logo?: string;
  operatingHours: Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday', OperatingHours>;
  defaultCurrency: string;
  taxSettings: {
    rate: number;
    enabled: boolean;
    name: string;
  };
  taxRate: number;
  taxEnabled: boolean;
  taxName: string;
  createdAt?: string;
  updatedAt?: string;
}

// 1. Database schema types (snake_case - matches Supabase columns)
export interface ShoppingListItemDB {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  notes?: string;
  is_purchased: boolean;
  is_auto_generated: boolean;
  is_urgent: boolean;
  estimated_cost: number;
  inventory_item_id?: string | null;
  added_at: string;
  purchased_at?: string | null;
  user_id?: string;
  business_profile_id?: string;
}

// 2. Frontend types (camelCase - used in React components)
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  notes?: string;
  isPurchased: boolean;
  isAutoGenerated: boolean;
  isUrgent: boolean;
  estimatedCost: number;
  inventoryItemId?: string | null;
  addedAt: string;
  purchasedAt?: string;
  userId?: string;
  businessProfileId?: string;
}

// 3. Mapping functions (optional - could move to a utils file)
export function mapDbToShoppingListItem(data: ShoppingListItemDB): ShoppingListItem {
  return {
    id: data.id,
    name: data.name,
    quantity: data.quantity,
    unit: data.unit,
    category: data.category,
    notes: data.notes,
    isPurchased: data.is_purchased,
    isAutoGenerated: data.is_auto_generated,
    isUrgent: data.is_urgent,
    estimatedCost: data.estimated_cost,
    inventoryItemId: data.inventory_item_id,
    addedAt: data.added_at,
    purchasedAt: data.purchased_at === null ? undefined : data.purchased_at,
    userId: data.user_id,
    businessProfileId: data.business_profile_id,
  };
}

export function mapShoppingListItemToDb(item: ShoppingListItem): ShoppingListItemDB {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    notes: item.notes,
    is_purchased: item.isPurchased,
    is_auto_generated: item.isAutoGenerated,
    is_urgent: item.isUrgent,
    estimated_cost: item.estimatedCost,
    inventory_item_id: item.inventoryItemId,
    added_at: item.addedAt,
    purchased_at: item.purchasedAt,
    user_id: item.userId,
    business_profile_id: item.businessProfileId,
  };
}