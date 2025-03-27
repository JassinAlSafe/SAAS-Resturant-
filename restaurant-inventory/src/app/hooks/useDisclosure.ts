"use client";

import { useState, useCallback } from "react";

export interface UseDisclosureReturn {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

/**
 * Hook for managing disclosure state (open/closed) for modals, drawers, etc.
 * @param initialState - Optional initial state (default: false)
 * @returns Object with isOpen state and functions to open, close, and toggle
 */
export function useDisclosure(initialState = false): UseDisclosureReturn {
    const [isOpen, setIsOpen] = useState(initialState);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    return { isOpen, open, close, toggle };
} 