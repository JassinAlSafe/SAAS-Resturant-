import { supabase } from './supabase';
import { Ingredient, Dish, Sale, StockAlert, DashboardStats } from './types';

// Ingredient Services
export const ingredientService = {
    // Get all ingredients
    getAll: async (): Promise<Ingredient[]> => {
        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .order('name');

        if (error) throw error;
        return data || [];
    },

    // Get ingredient by ID
    getById: async (id: string): Promise<Ingredient | null> => {
        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create new ingredient
    create: async (ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ingredient> => {
        const { data, error } = await supabase
            .from('ingredients')
            .insert([{
                ...ingredient,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update ingredient
    update: async (id: string, ingredient: Partial<Ingredient>): Promise<Ingredient> => {
        const { data, error } = await supabase
            .from('ingredients')
            .update({
                ...ingredient,
                updatedAt: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete ingredient
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('ingredients')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Get low stock ingredients
    getLowStock: async (): Promise<StockAlert[]> => {
        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .filter('quantity', 'lte', supabase.raw('reorder_level'));

        if (error) throw error;

        return (data || []).map(item => ({
            ingredientId: item.id,
            ingredientName: item.name,
            currentQuantity: item.quantity,
            reorderLevel: item.reorderLevel,
            unit: item.unit
        }));
    }
};

// Dish Services
export const dishService = {
    // Get all dishes with their ingredients
    getAll: async (): Promise<Dish[]> => {
        const { data, error } = await supabase
            .from('dishes')
            .select(`
        *,
        dish_ingredients:dish_ingredients(
          ingredient_id,
          quantity
        )
      `)
            .order('name');

        if (error) throw error;

        return (data || []).map(dish => ({
            id: dish.id,
            name: dish.name,
            price: dish.price,
            ingredients: dish.dish_ingredients.map((di: any) => ({
                ingredientId: di.ingredient_id,
                quantity: di.quantity
            })),
            createdAt: dish.created_at,
            updatedAt: dish.updated_at
        }));
    },

    // Get dish by ID
    getById: async (id: string): Promise<Dish | null> => {
        const { data, error } = await supabase
            .from('dishes')
            .select(`
        *,
        dish_ingredients:dish_ingredients(
          ingredient_id,
          quantity
        )
      `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) return null;

        return {
            id: data.id,
            name: data.name,
            price: data.price,
            ingredients: data.dish_ingredients.map((di: any) => ({
                ingredientId: di.ingredient_id,
                quantity: di.quantity
            })),
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    // Create new dish with ingredients
    create: async (dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish> => {
        // Start a transaction
        const { data: newDish, error: dishError } = await supabase
            .from('dishes')
            .insert([{
                name: dish.name,
                price: dish.price,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (dishError) throw dishError;

        // Insert dish ingredients
        const dishIngredients = dish.ingredients.map(ingredient => ({
            dish_id: newDish.id,
            ingredient_id: ingredient.ingredientId,
            quantity: ingredient.quantity
        }));

        const { error: ingredientsError } = await supabase
            .from('dish_ingredients')
            .insert(dishIngredients);

        if (ingredientsError) throw ingredientsError;

        return {
            id: newDish.id,
            name: newDish.name,
            price: newDish.price,
            ingredients: dish.ingredients,
            createdAt: newDish.created_at,
            updatedAt: newDish.updated_at
        };
    },

    // Update dish and its ingredients
    update: async (id: string, dish: Partial<Dish>): Promise<Dish> => {
        // Update dish details
        const { data: updatedDish, error: dishError } = await supabase
            .from('dishes')
            .update({
                name: dish.name,
                price: dish.price,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (dishError) throw dishError;

        // If ingredients are provided, update them
        if (dish.ingredients) {
            // Delete existing ingredients
            const { error: deleteError } = await supabase
                .from('dish_ingredients')
                .delete()
                .eq('dish_id', id);

            if (deleteError) throw deleteError;

            // Insert new ingredients
            const dishIngredients = dish.ingredients.map(ingredient => ({
                dish_id: id,
                ingredient_id: ingredient.ingredientId,
                quantity: ingredient.quantity
            }));

            const { error: ingredientsError } = await supabase
                .from('dish_ingredients')
                .insert(dishIngredients);

            if (ingredientsError) throw ingredientsError;
        }

        // Get the updated dish with ingredients
        return await dishService.getById(id) as Dish;
    },

    // Delete dish and its ingredients
    delete: async (id: string): Promise<void> => {
        // Delete dish ingredients first (foreign key constraint)
        const { error: ingredientsError } = await supabase
            .from('dish_ingredients')
            .delete()
            .eq('dish_id', id);

        if (ingredientsError) throw ingredientsError;

        // Delete the dish
        const { error: dishError } = await supabase
            .from('dishes')
            .delete()
            .eq('id', id);

        if (dishError) throw dishError;
    }
};

// Sales Services
export const salesService = {
    // Get all sales
    getAll: async (): Promise<Sale[]> => {
        const { data, error } = await supabase
            .from('sales')
            .select(`
        *,
        dishes:dish_id(name)
      `)
            .order('date', { ascending: false });

        if (error) throw error;

        return (data || []).map(sale => ({
            id: sale.id,
            dishId: sale.dish_id,
            dishName: sale.dishes.name,
            quantity: sale.quantity,
            totalAmount: sale.total_amount,
            date: sale.date,
            createdAt: sale.created_at
        }));
    },

    // Get sales by date range
    getByDateRange: async (startDate: string, endDate: string): Promise<Sale[]> => {
        const { data, error } = await supabase
            .from('sales')
            .select(`
        *,
        dishes:dish_id(name)
      `)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        if (error) throw error;

        return (data || []).map(sale => ({
            id: sale.id,
            dishId: sale.dish_id,
            dishName: sale.dishes.name,
            quantity: sale.quantity,
            totalAmount: sale.total_amount,
            date: sale.date,
            createdAt: sale.created_at
        }));
    },

    // Record new sales and update inventory
    recordSales: async (sales: { dishId: string, quantity: number }[]): Promise<void> => {
        // Start a transaction
        const { data: session, error: sessionError } = await supabase.rpc('begin_transaction');
        if (sessionError) throw sessionError;

        try {
            // Get dishes with their ingredients
            const dishIds = sales.map(sale => sale.dishId);
            const { data: dishes, error: dishesError } = await supabase
                .from('dishes')
                .select(`
          id,
          price,
          dish_ingredients:dish_ingredients(
            ingredient_id,
            quantity
          )
        `)
                .in('id', dishIds);

            if (dishesError) throw dishesError;

            // Record sales
            for (const sale of sales) {
                const dish = dishes.find((d: any) => d.id === sale.dishId);
                if (!dish) continue;

                // Insert sale record
                const { error: saleError } = await supabase
                    .from('sales')
                    .insert([{
                        dish_id: sale.dishId,
                        quantity: sale.quantity,
                        total_amount: dish.price * sale.quantity,
                        date: new Date().toISOString().split('T')[0],
                        created_at: new Date().toISOString()
                    }]);

                if (saleError) throw saleError;

                // Update inventory for each ingredient
                for (const ingredient of dish.dish_ingredients) {
                    const totalUsed = ingredient.quantity * sale.quantity;

                    const { error: updateError } = await supabase.rpc('update_ingredient_quantity', {
                        p_ingredient_id: ingredient.ingredient_id,
                        p_quantity_change: -totalUsed
                    });

                    if (updateError) throw updateError;
                }
            }

            // Commit transaction
            await supabase.rpc('commit_transaction');
        } catch (error) {
            // Rollback transaction on error
            await supabase.rpc('rollback_transaction');
            throw error;
        }
    },

    // Get dashboard stats
    getDashboardStats: async (): Promise<DashboardStats> => {
        // Get total ingredients
        const { count: totalIngredients, error: ingredientsError } = await supabase
            .from('ingredients')
            .select('*', { count: 'exact', head: true });

        if (ingredientsError) throw ingredientsError;

        // Get low stock items
        const { data: lowStockItems, error: lowStockError } = await supabase
            .from('ingredients')
            .select('*')
            .filter('quantity', 'lte', supabase.raw('reorder_level'));

        if (lowStockError) throw lowStockError;

        // Get today's sales
        const today = new Date().toISOString().split('T')[0];
        const { data: todaySales, error: salesError } = await supabase
            .from('sales')
            .select('quantity, total_amount')
            .eq('date', today);

        if (salesError) throw salesError;

        const totalSalesToday = todaySales ? todaySales.reduce((sum, sale) => sum + sale.quantity, 0) : 0;
        const totalRevenueToday = todaySales ? todaySales.reduce((sum, sale) => sum + sale.total_amount, 0) : 0;

        return {
            totalIngredients: totalIngredients || 0,
            lowStockItems: lowStockItems ? lowStockItems.length : 0,
            totalSalesToday,
            totalRevenueToday
        };
    }
}; 