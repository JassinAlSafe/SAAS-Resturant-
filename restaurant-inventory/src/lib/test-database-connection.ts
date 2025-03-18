import { supabase } from "@/lib/supabase";

/**
 * This utility function tests various database operations after RLS policy changes
 * It helps debug 500 Internal Server Errors by testing each operation separately
 */
export async function testDatabaseConnection() {
    console.log("Starting database connection test...");

    try {
        // 1. Test basic SELECT on business_profiles
        console.log("Testing SELECT on business_profiles...");
        const { data: profilesData, error: profilesError } = await supabase
            .from('business_profiles')
            .select('id')
            .limit(1);

        if (profilesError) {
            console.error("SELECT on business_profiles failed:", profilesError);
        } else {
            console.log("SELECT on business_profiles succeeded:", profilesData);
        }

        // 2. Test basic SELECT on business_profile_users
        console.log("Testing SELECT on business_profile_users...");
        const { data: usersData, error: usersError } = await supabase
            .from('business_profile_users')
            .select('id')
            .limit(1);

        if (usersError) {
            console.error("SELECT on business_profile_users failed:", usersError);
        } else {
            console.log("SELECT on business_profile_users succeeded:", usersData);
        }

        // 3. Test profiles_api view
        console.log("Testing SELECT on profiles_api view...");
        const { data: apiData, error: apiError } = await supabase
            .from('profiles_api')
            .select('id')
            .limit(1);

        if (apiError) {
            console.error("SELECT on profiles_api failed:", apiError);
        } else {
            console.log("SELECT on profiles_api succeeded:", apiData);
        }

        // 4. Test RPC function if applicable
        console.log("Testing RPC function create_business_profile_with_user...");
        try {
            const { data: rpcData, error: rpcError } = await supabase
                .rpc('create_business_profile_with_user', {
                    p_user_id: 'test', // This will likely fail, but we're testing the call itself
                    p_name: 'Test Restaurant',
                    p_type: 'casual_dining'
                });

            if (rpcError) {
                console.error("RPC function call failed:", rpcError);
            } else {
                console.log("RPC function call succeeded:", rpcData);
            }
        } catch (e) {
            console.error("RPC function call exception:", e);
        }

        console.log("Database connection test completed");
        return {
            success: true,
            message: "All tests completed. Check console for results."
        };
    } catch (error) {
        console.error("Database connection test failed with unexpected error:", error);
        return {
            success: false,
            message: `Test failed with error: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

// This can be used in a component as:
// 
// import { testDatabaseConnection } from "@/lib/test-database-connection";
//
// // In your component:
// async function handleTestConnection() {
//   const result = await testDatabaseConnection();
//   if (result.success) {
//     // Show success message
//   } else {
//     // Show error message
//   }
// } 