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
};

// Inventory item type
export type InventoryItem = {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  quantity: number;
  cost_per_unit: number;
  minimum_stock_level?: number;
  reorder_point?: number;
  supplier_id?: string;
  location?: string;
  created_at: Date | string;
  updated_at: Date | string;
};

// Supplier type
export type Supplier = {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  notes?: string;
  created_at: Date | string;
  updated_at: Date | string;
};

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

// Business profile type
export type BusinessProfile = {
  id: string;
  user_id: string;
  name: string;
  type: "cafe" | "fast_food" | "fine_dining" | "casual_dining" | "bakery" | "bar" | "other";
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
  defaultCurrency: string;
  created_at: string;
  updated_at: string;
};