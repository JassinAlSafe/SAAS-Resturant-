import { format } from "date-fns";

/**
 * Helper function to get default months data for charts
 */
export const getDefaultMonthsData = () => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(today.getMonth() - 5 + i);
        return {
            month: format(date, 'MMM'),
            sales: 0
        };
    });
};

/**
 * Helper function to log query details for debugging
 */
export const logQueryDetails = (businessProfileId: string, startDate: string, endDate: string) => {
    console.log('=== Dashboard Sales Query Details ===');
    console.log('Business Profile ID:', businessProfileId);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    console.log('===================================');
};

/**
 * Generate a random change percentage for trending
 */
export const getRandomChange = () => Math.floor(Math.random() * 11) - 5;

/**
 * Create a promise that will time out after a specified duration
 */
export const createSafePromise = <T>(promise: Promise<T>, timeoutMs: number, defaultValue?: T): Promise<T> => {
    // Create a timeout promise
    const timeoutPromise = new Promise<T>((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Promise timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    // Return a promise that either resolves with the original promise or rejects with a timeout
    return Promise.race([promise, timeoutPromise])
        .catch(error => {
            console.error('Promise failed or timed out:', error);
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw error;
        });
};