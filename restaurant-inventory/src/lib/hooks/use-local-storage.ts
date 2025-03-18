import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((oldValue: T) => T)) => void;

/**
 * Custom hook for persisting state in localStorage with type safety
 * and SSR compatibility
 * 
 * @param key The localStorage key
 * @param initialValue Initial value or function that returns the initial value
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T | (() => T)
): [T, SetValue<T>] {
    // Get initial value
    const getInitialValue = () => {
        // Check if code is running on client side
        if (typeof window === 'undefined') {
            return typeof initialValue === 'function'
                ? (initialValue as () => T)()
                : initialValue;
        }

        try {
            // Try to get value from localStorage
            const item = window.localStorage.getItem(key);

            // If value exists, parse it; otherwise use initial value
            return item
                ? JSON.parse(item)
                : typeof initialValue === 'function'
                    ? (initialValue as () => T)()
                    : initialValue;
        } catch (error) {
            // If error, use initial value
            console.error(`Error reading localStorage key "${key}":`, error);
            return typeof initialValue === 'function'
                ? (initialValue as () => T)()
                : initialValue;
        }
    };

    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(getInitialValue);

    // Effect to sync state with localStorage when window is available
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            // When state changes, update localStorage
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Return state and setter
    return [storedValue, setStoredValue];
}

export default useLocalStorage; 