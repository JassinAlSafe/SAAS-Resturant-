import { supabase } from '@/lib/supabase';
import { handleRefreshTokenError, checkAndRefreshSession } from '@/lib/auth/token-manager';
import { PostgrestError } from '@supabase/supabase-js';

// Custom error type for API calls
export class ApiError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly status?: number,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

interface RetryConfig {
    maxRetries?: number;
    retryDelay?: number; // milliseconds
    shouldRetry?: (error: unknown) => boolean;
}

const defaultRetryConfig: Required<RetryConfig> = {
    maxRetries: 1,
    retryDelay: 1000,
    shouldRetry: (error: unknown) => {
        // By default, only retry on token errors
        return error instanceof ApiError && error.code === 'AUTH_ERROR';
    }
};

/**
 * Secure API client that handles token refreshing and auth errors
 */
export async function secureApiCall<T>(
    apiFunction: () => Promise<T>,
    config: RetryConfig = {}
): Promise<T> {
    const finalConfig = { ...defaultRetryConfig, ...config };
    let retries = 0;

    async function attemptCall(): Promise<T> {
        try {
            // Check and refresh session before making the call
            const session = await checkAndRefreshSession();
            if (!session) {
                throw new ApiError('No valid session', 'AUTH_ERROR', 401);
            }

            // Make the actual API call
            const result = await apiFunction();

            // Handle Supabase-specific error checking
            if (result && typeof result === 'object' && 'error' in result) {
                const error = (result as { error: PostgrestError }).error;
                if (error) {
                    throw new ApiError(
                        error.message,
                        error.code,
                        error.code === 'PGRST301' ? 401 : 500,
                        error
                    );
                }
            }

            return result;
        } catch (error) {
            console.error(`API call failed (attempt ${retries + 1}/${finalConfig.maxRetries + 1}):`, error);

            // Check if it's a token error
            const wasHandled = await handleRefreshTokenError(error);

            if (wasHandled && retries < finalConfig.maxRetries) {
                // If it was a token error and we can retry, wait and try again
                retries++;
                console.log(`Retrying API call in ${finalConfig.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay));
                return attemptCall();
            }

            // Transform error into ApiError if it isn't already
            if (!(error instanceof ApiError)) {
                throw new ApiError(
                    error instanceof Error ? error.message : 'Unknown error occurred',
                    'UNKNOWN_ERROR',
                    500,
                    error
                );
            }

            throw error;
        }
    }

    return attemptCall();
}

/**
 * Helper to create a secure Supabase query builder
 */
export function createSecureQuery<T>(
    queryBuilder: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    config?: RetryConfig
): Promise<T> {
    return secureApiCall(async () => {
        const { data, error } = await queryBuilder();

        if (error) {
            throw new ApiError(error.message, error.code, 500, error);
        }

        if (!data) {
            throw new ApiError('No data returned', 'NOT_FOUND', 404);
        }

        return data;
    }, config);
} 