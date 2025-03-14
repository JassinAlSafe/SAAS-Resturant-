import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, subDays } from 'date-fns';

// Create a Supabase client with the Admin key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Hardcoded user ID for testing - replace with a test user ID from your database
const TEST_USER_ID = 'ea330701-344b-4e8d-85b6-ce8d5f22534e';

// Mock data for seeding
const sampleIngredients = [
    { name: 'Tomatoes', quantity: 25, unit: 'kg', cost: 3.50, category: 'Produce', reorder_level: 10 },
    { name: 'Flour', quantity: 20, unit: 'kg', cost: 1.75, category: 'Dry Goods', reorder_level: 5 },
    { name: 'Mozzarella', quantity: 10, unit: 'kg', cost: 6.25, category: 'Dairy', reorder_level: 5 },
    { name: 'Olive Oil', quantity: 8, unit: 'L', cost: 12.50, category: 'Oils', reorder_level: 2 },
    { name: 'Basil', quantity: 2, unit: 'kg', cost: 8.00, category: 'Herbs', reorder_level: 1 },
    { name: 'Chicken', quantity: 15, unit: 'kg', cost: 8.50, category: 'Meat', reorder_level: 5 },
    { name: 'Parmesan', quantity: 5, unit: 'kg', cost: 14.75, category: 'Dairy', reorder_level: 2 },
    { name: 'Pasta', quantity: 18, unit: 'kg', cost: 2.50, category: 'Dry Goods', reorder_level: 8 },
    { name: 'Eggs', quantity: 60, unit: 'unit', cost: 0.35, category: 'Dairy', reorder_level: 20 },
    { name: 'Spinach', quantity: 4, unit: 'kg', cost: 4.25, category: 'Produce', reorder_level: 2 },
    // Some low stock/critical items
    { name: 'Bacon', quantity: 3, unit: 'kg', cost: 9.50, category: 'Meat', reorder_level: 5 },
    { name: 'Fresh Garlic', quantity: 1, unit: 'kg', cost: 5.25, category: 'Produce', reorder_level: 2 },
    { name: 'Heavy Cream', quantity: 2, unit: 'L', cost: 4.75, category: 'Dairy', reorder_level: 4 },
    { name: 'Lemons', quantity: 5, unit: 'unit', cost: 0.75, category: 'Produce', reorder_level: 10 },
    { name: 'Sea Salt', quantity: 0.5, unit: 'kg', cost: 3.25, category: 'Spices', reorder_level: 1 },
];

const sampleDishes = [
    { name: 'Margherita Pizza', price: 12.99, cost: 3.50 },
    { name: 'Carbonara Pasta', price: 14.50, cost: 4.25 },
    { name: 'Caesar Salad', price: 9.99, cost: 2.75 },
    { name: 'Grilled Salmon', price: 18.99, cost: 8.50 },
    { name: 'Chicken Parmesan', price: 16.50, cost: 5.75 },
    { name: 'Mushroom Risotto', price: 15.99, cost: 4.50 },
    { name: 'Beef Burger', price: 13.99, cost: 5.25 },
    { name: 'Caprese Salad', price: 8.99, cost: 3.25 },
    { name: 'Tiramisu', price: 7.99, cost: 2.50 },
    { name: 'Minestrone Soup', price: 6.99, cost: 1.75 },
];

// Generate sales for the last 14 days
function generateSalesData(dishIds: string[], userId: string) {
    const salesData = [];
    const today = new Date();
    const startDate = subDays(today, 14);

    // Loop through each day
    for (let i = 0; i <= 14; i++) {
        const currentDate = addDays(startDate, i);
        const formattedDate = format(currentDate, 'yyyy-MM-dd');

        // Generate 3-8 sales per day
        const salesCount = Math.floor(Math.random() * 6) + 3;

        for (let j = 0; j < salesCount; j++) {
            // Select a random dish
            const dishIndex = Math.floor(Math.random() * dishIds.length);
            const dishId = dishIds[dishIndex];

            // Generate quantity (1-4)
            const quantity = Math.floor(Math.random() * 4) + 1;

            // Calculate total amount (price * quantity)
            const unitPrice = sampleDishes[dishIndex].price;
            const totalAmount = unitPrice * quantity;

            salesData.push({
                dish_id: dishId,
                user_id: userId,
                quantity,
                date: formattedDate,
                total_amount: totalAmount,
                created_at: formattedDate
            });
        }
    }

    return salesData;
}

export async function POST(request: Request) {
    try {
        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
            }
        });

        // For simplicity and to avoid cookie issues, we'll use the test user ID
        // or get it from the request body
        let userId = TEST_USER_ID;

        // Get userId from request body or fallback to test ID
        const body = await request.json().catch(() => ({}));
        userId = body.userId || userId;

        console.log('Seeding data for user ID:', userId);

        // Step 1: Insert ingredients
        const { data: ingredientsData, error: ingredientsError } = await supabase
            .from('ingredients')
            .upsert(
                sampleIngredients.map(ingredient => ({
                    ...ingredient,
                    user_id: userId,
                    created_at: new Date().toISOString()
                })),
                { onConflict: 'name,user_id' }
            )
            .select();

        if (ingredientsError) {
            console.error('Error inserting ingredients:', ingredientsError);
            return NextResponse.json({ success: false, error: ingredientsError.message }, { status: 500 });
        }

        console.log(`Successfully inserted ${ingredientsData?.length || 0} ingredients`);

        // Step 2: Insert dishes/recipes
        const { data: dishesData, error: dishesError } = await supabase
            .from('dishes')
            .upsert(
                sampleDishes.map(dish => ({
                    ...dish,
                    user_id: userId,
                    created_at: new Date().toISOString(),
                    food_cost: dish.cost
                })),
                { onConflict: 'name,user_id' }
            )
            .select();

        if (dishesError) {
            console.error('Error inserting dishes:', dishesError);
            return NextResponse.json({ success: false, error: dishesError.message }, { status: 500 });
        }

        console.log(`Successfully inserted ${dishesData?.length || 0} dishes`);

        // Step 3: Insert sales data
        const dishIds = dishesData?.map(dish => dish.id) || [];
        const salesData = generateSalesData(dishIds, userId);

        const { error: salesError } = await supabase
            .from('sales')
            .upsert(salesData);

        if (salesError) {
            console.error('Error inserting sales data:', salesError);
            return NextResponse.json({ success: false, error: salesError.message }, { status: 500 });
        }

        console.log(`Successfully inserted ${salesData.length} sales records`);

        // Step 4: Link ingredients to dishes (recipe ingredients)
        const recipeIngredients = [];
        if (ingredientsData && dishesData) {
            for (const dish of dishesData) {
                // Randomly select 3-5 ingredients for each dish
                const ingredientCount = Math.floor(Math.random() * 3) + 3;
                const shuffledIngredients = [...ingredientsData].sort(() => 0.5 - Math.random());

                for (let i = 0; i < Math.min(ingredientCount, shuffledIngredients.length); i++) {
                    recipeIngredients.push({
                        dish_id: dish.id,
                        ingredient_id: shuffledIngredients[i].id,
                        quantity: Math.random() * 0.5 + 0.1, // Random quantity between 0.1 and 0.6
                        user_id: userId
                    });
                }
            }

            // Insert recipe ingredients
            const { error: recipeError } = await supabase
                .from('dish_ingredients')
                .upsert(recipeIngredients);

            if (recipeError) {
                console.error('Error inserting recipe ingredients:', recipeError);
                return NextResponse.json({ success: false, error: recipeError.message }, { status: 500 });
            }

            console.log(`Successfully inserted ${recipeIngredients.length} recipe ingredients`);
        }

        return NextResponse.json({
            success: true,
            message: 'Test data seeded successfully',
            counts: {
                ingredients: ingredientsData?.length || 0,
                dishes: dishesData?.length || 0,
                sales: salesData.length,
                recipeIngredients: recipeIngredients.length
            }
        });

    } catch (error) {
        console.error('Error in seed-data API route:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 