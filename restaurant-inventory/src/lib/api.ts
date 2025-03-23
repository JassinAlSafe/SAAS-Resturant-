import { supabase } from './supabase';
import {
    Dish,
    Ingredient,
    Recipe,
    RecipeIngredient,
    Sale,
    Supplier,
    ShoppingListItem
} from '@/types/database.types';

// ============ SUPPLIERS ============
export async function getSuppliers() {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as Supplier[];
}

export async function getSupplier(id: string) {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Supplier;
}

export async function createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single();

    if (error) throw error;
    return data as Supplier;
}

export async function updateSupplier(id: string, supplier: Partial<Supplier>) {
    const { data, error } = await supabase
        .from('suppliers')
        .update(supplier)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Supplier;
}

export async function deleteSupplier(id: string) {
    const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// ============ INGREDIENTS ============
export async function getIngredients() {
    const { data, error } = await supabase
        .from('ingredients')
        .select('*, suppliers(name)')
        .order('name');

    if (error) throw error;
    return data;
}

export async function getIngredient(id: string) {
    const { data, error } = await supabase
        .from('ingredients')
        .select('*, suppliers(name)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('ingredients')
        .insert(ingredient)
        .select()
        .single();

    if (error) throw error;
    return data as Ingredient;
}

export async function updateIngredient(id: string, ingredient: Partial<Ingredient>) {
    const { data, error } = await supabase
        .from('ingredients')
        .update(ingredient)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Ingredient;
}

export async function deleteIngredient(id: string) {
    const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// ============ DISHES ============
export async function getDishes() {
    const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as Dish[];
}

export async function getDish(id: string) {
    const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Dish;
}

export async function createDish(dish: Omit<Dish, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('dishes')
        .insert(dish)
        .select()
        .single();

    if (error) throw error;
    return data as Dish;
}

export async function updateDish(id: string, dish: Partial<Dish>) {
    const { data, error } = await supabase
        .from('dishes')
        .update(dish)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Dish;
}

export async function deleteDish(id: string) {
    const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// ============ RECIPES ============
export async function getRecipes() {
    const { data, error } = await supabase
        .from('recipes')
        .select(`
      *,
      dishes(*)
    `)
        .order('name');

    if (error) throw error;
    return data;
}

export async function getRecipe(id: string) {
    const { data, error } = await supabase
        .from('recipes')
        .select(`
      *,
      dishes(*),
      recipe_ingredients(*, ingredients(*))
    `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('recipes')
        .insert(recipe)
        .select()
        .single();

    if (error) throw error;
    return data as Recipe;
}

export async function updateRecipe(id: string, recipe: Partial<Recipe>) {
    const { data, error } = await supabase
        .from('recipes')
        .update(recipe)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Recipe;
}

export async function deleteRecipe(id: string) {
    const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// ============ RECIPE INGREDIENTS ============
export async function getRecipeIngredients(recipeId: string) {
    const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('*, ingredients(*)')
        .eq('recipe_id', recipeId);

    if (error) throw error;
    return data;
}

export async function addIngredientToRecipe(recipeIngredient: Omit<RecipeIngredient, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredient)
        .select('*, ingredients(*)')
        .single();

    if (error) throw error;
    return data;
}

export async function updateRecipeIngredient(id: string, updates: Partial<RecipeIngredient>) {
    const { data, error } = await supabase
        .from('recipe_ingredients')
        .update(updates)
        .eq('id', id)
        .select('*, ingredients(*)')
        .single();

    if (error) throw error;
    return data;
}

export async function removeIngredientFromRecipe(id: string) {
    const { error } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// ============ SALES ============
export async function getSales(startDate?: string, endDate?: string) {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No authenticated user found');
        return [];
    }

    // Get the user\'s business profile
    const { data: businessProfile, error: businessError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (businessError || !businessProfile) {
        console.error('Error fetching business profile:', businessError);
        return [];
    }

    let query = supabase
        .from('sales')
        .select('*, dishes(*)')
        .eq('business_profile_id', businessProfile.id)
        .order('date', { ascending: false });

    if (startDate) {
        query = query.gte('date', startDate);
    }

    if (endDate) {
        query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

export async function recordSale(sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single();

    if (error) throw error;
    return data as Sale;
}

export async function updateSale(id: string, sale: Partial<Sale>) {
    const { data, error } = await supabase
        .from('sales')
        .update(sale)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Sale;
}

export async function deleteSale(id: string) {
    const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// ============ INVENTORY IMPACT ============
export async function getInventoryImpact(ingredientId: string, startDate?: string, endDate?: string) {
    // Get the current user\'s business profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get the user\'s business profile
    const { data: businessProfile, error: businessError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (businessError || !businessProfile) {
        console.error('Error fetching business profile:', businessError);
        return [];
    }

    let query = supabase
        .from('inventory_impact')
        .select('*, sales(*)')
        .eq('ingredient_id', ingredientId)
        .eq('business_profile_id', businessProfile.id)
        .order('created_at', { ascending: false });

    if (startDate) {
        query = query.gte('created_at', startDate);
    }

    if (endDate) {
        query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

// ============ ALERTS ============
export async function getAlerts(acknowledged: boolean = false) {
    const { data, error } = await supabase
        .from('ingredient_alerts')
        .select('*, ingredients(*)')
        .is('acknowledged_at', acknowledged ? null : 'is not null')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function acknowledgeAlert(id: string, userId: string) {
    const { data, error } = await supabase
        .from('ingredient_alerts')
        .update({
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: userId
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============ SHOPPING LIST ============
export async function getShoppingList(isPurchased: boolean = false) {
    const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('is_purchased', isPurchased)
        .order('added_at', { ascending: false });

    if (error) throw error;
    return data as ShoppingListItem[];
}

export async function addToShoppingList(item: Omit<ShoppingListItem, 'id' | 'added_at'>) {
    const { data, error } = await supabase
        .from('shopping_list')
        .insert(item)
        .select()
        .single();

    if (error) throw error;
    return data as ShoppingListItem;
}

export async function updateShoppingListItem(id: string, item: Partial<ShoppingListItem>) {
    const { data, error } = await supabase
        .from('shopping_list')
        .update(item)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as ShoppingListItem;
}

export async function markItemAsPurchased(id: string) {
    const { data, error } = await supabase
        .from('shopping_list')
        .update({
            is_purchased: true,
            purchased_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as ShoppingListItem;
}

export async function removeFromShoppingList(id: string) {
    const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
} 