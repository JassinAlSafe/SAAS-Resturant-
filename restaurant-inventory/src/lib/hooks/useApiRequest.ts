import { useState, useCallback } from 'react';

// Maximum number of retries for API calls
const DEFAULT_MAX_RETRIES = 3;

interface ApiRequestState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    retryCount: number;
}

interface ApiRequestOptions {
    maxRetries?: number;
    initialData?: any;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

/**
 * Hook for handling API requests with retry logic and loading state management
 * 
 * @param apiCallFn The API call function to execute
 * @param options Configuration options
 * @returns Object with data, loading state, error, and utility functions
 */
export function useApiRequest<T>(
    apiCallFn: (...args: any[]) => Promise<T>,
    options: ApiRequestOptions = {}
) {
    const {
        maxRetries = DEFAULT_MAX_RETRIES,
        initialData = null,
        onSuccess,
        onError
    } = options;

    const [state, setState] = useState<ApiRequestState<T>>({
        data: initialData,
        isLoading: false,
        error: null,
        retryCount: 0
    });

    /**
     * Execute the API call with retry logic
     */
    const execute = useCallback(async (...args: any[]): Promise<T | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        let retryCount = 0;
        let lastError: Error | null = null;

        while (retryCount <= maxRetries) {
            try {
                const data = await apiCallFn(...args);

                setState({
                    data,
                    isLoading: false,
                    error: null,
                    retryCount
                });

                if (onSuccess) {
                    onSuccess(data);
                }

                return data;
            } catch (error) {
                retryCount++;
                lastError = error instanceof Error
                    ? error
                    : new Error('Unknown error occurred');

                if (retryCount > maxRetries) {
                    const errorMessage = lastError.message;

                    setState({
                        data: null,
                        isLoading: false,
                        error: errorMessage,
                        retryCount
                    });

                    if (onError) {
                        onError(lastError);
                    }

                    console.error(`API request failed after ${retryCount - 1} retries:`, lastError);
                    break;
                }

                // Exponential backoff: wait longer between each retry
                const delay = Math.min(1000 * 2 ** retryCount, 8000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return null;
    }, [apiCallFn, maxRetries, onSuccess, onError]);

    /**
     * Reset the state
     */
    const reset = useCallback(() => {
        setState({
            data: initialData,
            isLoading: false,
            error: null,
            retryCount: 0
        });
    }, [initialData]);

    /**
     * Retry the last failed request
     */
    const retry = useCallback(async (...args: any[]) => {
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            retryCount: 0
        }));

        return execute(...args);
    }, [execute]);

    return {
        ...state,
        execute,
        retry,
        reset
    };
} 