import { healthCheck } from "./supabase-utils";
import { supabase } from "@/lib/supabase";

/**
 * A wrapper for critical API calls that first checks the connection
 * and then proceeds with the operation
 * 
 * @param operation - The database operation to perform
 * @returns The result of the operation
 */
export async function withConnectionCheck<T>(
    operation: () => Promise<T>,
    options: { skipCheck?: boolean } = {}
): Promise<T> {
    // If skipCheck is true, skip the health check
    if (options.skipCheck) {
        return operation();
    }

    // First check the connection
    const healthResult = await healthCheck();
    if (!healthResult.success) {
        console.error("API connection check failed before operation:", healthResult);
        throw new Error(`Cannot connect to database: ${healthResult.error || "Unknown error"}`);
    }

    // Then proceed with the operation
    return operation();
}

/**
 * Helper function to create a database operation with proper error handling
 * 
 * @param queryFn - Function that performs the actual Supabase query
 * @returns The data from the query
 */
export async function safeQuery<T>(
    queryFn: (db: typeof supabase) => Promise<{ data: T | null; error: any }>
): Promise<T> {
    return withConnectionCheck(async () => {
        const { data, error } = await queryFn(supabase);

        if (error) {
            console.error("Database query error:", {
                message: error?.message || "No message",
                code: error?.code,
                details: error?.details,
                hint: error?.hint
            });
            throw new Error(`Database error: ${error.message}`);
        }

        if (data === null) {
            throw new Error("No data returned from query");
        }

        return data as T;
    });
} 