// Database Types - Auto-generated based on Supabase schema

export type Supplier = {
    id: string;
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    categories: string[];
    is_preferred: boolean;
    status: 'ACTIVE' | 'INACTIVE';
    rating: number;
    last_order_date?: string;
    logo?: string;
};

export type Ingredient = {
    id: string;
    name: string;
    unit: string;
    current_stock: number;
    cost_per_unit: number;
    reorder_level: number;
    supplier_id?: string;
    created_at: string;
    updated_at: string;
    image_url?: string;
    category?: string;
    expiry_date?: string;
};

export type Dish = {
    id: string;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
};

export type Recipe = {
    id: string;
    dish_id: string;
    name: string;
    instructions?: string;
    food_cost?: number;
    category?: string;
    allergens?: string[];
    popularity?: number;
    created_at: string;
    updated_at: string;
    user_id: string;
    image_url?: string;
};

export type RecipeIngredient = {
    id: string;
    recipe_id: string;
    ingredient_id: string;
    quantity: number;
    unit: string;
    created_at: string;
    updated_at: string;
};

export type ShiftType = 'Breakfast' | 'Lunch' | 'Dinner' | 'All';

export type Sale = {
    id: string;
    date: string;
    shift: ShiftType;
    dish_id: string;
    dish_name: string;
    quantity: number;
    total_amount: number;
    notes?: string;
    user_id?: string;
    created_at: string;
    updated_at: string;
};

export type InventoryImpact = {
    id: string;
    sale_id: string;
    ingredient_id: string;
    deducted_quantity: number;
    created_at: string;
};

export type IngredientAlert = {
    id: string;
    ingredient_id: string;
    type: 'LOW_STOCK' | 'EXPIRY' | 'OTHER';
    message: string;
    created_at: string;
    acknowledged_at?: string;
    acknowledged_by?: string;
};

export type ShoppingListItem = {
    id: string;
    inventory_item_id?: string;
    name: string;
    quantity: number;
    unit: string;
    estimated_cost: number;
    category?: string;
    is_auto_generated: boolean;
    is_purchased: boolean;
    added_at: string;
    purchased_at?: string;
    user_id?: string;
};

// Database schema tables
export type Tables = {
    suppliers: Supplier;
    ingredients: Ingredient;
    dishes: Dish;
    recipes: Recipe;
    recipe_ingredients: RecipeIngredient;
    sales: Sale;
    inventory_impact: InventoryImpact;
    ingredient_alerts: IngredientAlert;
    shopping_list: ShoppingListItem;
}; 