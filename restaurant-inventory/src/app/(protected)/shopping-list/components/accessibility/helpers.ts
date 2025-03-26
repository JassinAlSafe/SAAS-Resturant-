// Accessibility Helper Functions
import { useState, useEffect } from "react";

/**
 * Announces messages to screen readers
 */
export function announceToScreenReader(message: string) {
    const announcer = document.getElementById("sr-announcer");
    if (announcer) {
        announcer.textContent = message;
    }
}

/**
 * Simple announcer object for more convenient API
 */
export const announcer = {
    announce: (message: string, type: 'assertive' | 'polite' = 'assertive') => {
        const announcerId = type === 'polite' ? 'sr-announcer-polite' : 'sr-announcer';
        const announcer = document.getElementById(announcerId);
        if (announcer) {
            announcer.textContent = message;
        }
    },
};

/**
 * Hook to manage focus trap within a modal or dialog
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, isActive: boolean) {
    useEffect(() => {
        if (!isActive || !ref.current) return;

        const focusableElements = ref.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        // Focus first element when trap becomes active
        firstElement.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        ref.current.addEventListener('keydown', handleKeyDown);
        return () => {
            ref.current?.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActive, ref]);
}

/**
 * Hook to provide keyboard shortcut handling
 */
export function useKeyboardShortcut(key: string, callback: () => void, additionalDeps: any[] = []) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === key.toLowerCase()) {
                callback();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [key, callback, ...additionalDeps]);
}

/**
 * Hook to track high contrast mode preference
 */
export function useHighContrastMode() {
    const [isHighContrast, setIsHighContrast] = useState(false);

    useEffect(() => {
        // Check for high contrast mode
        const mediaQuery = window.matchMedia('(forced-colors: active)');
        setIsHighContrast(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setIsHighContrast(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return isHighContrast;
}

/**
 * Hook to manage reduced motion preference
 */
export function useReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return prefersReducedMotion;
}

/**
 * Function to mount screen reader announcer elements
 */
export function mountAnnouncer() {
    // Check if the announcer already exists
    if (!document.getElementById('sr-announcer')) {
        // Create assertive announcer
        const assertiveAnnouncer = document.createElement('div');
        assertiveAnnouncer.id = 'sr-announcer';
        assertiveAnnouncer.className = 'sr-only';
        assertiveAnnouncer.setAttribute('aria-live', 'assertive');
        assertiveAnnouncer.setAttribute('aria-atomic', 'true');
        assertiveAnnouncer.setAttribute('role', 'status');
        document.body.appendChild(assertiveAnnouncer);

        // Create polite announcer
        const politeAnnouncer = document.createElement('div');
        politeAnnouncer.id = 'sr-announcer-polite';
        politeAnnouncer.className = 'sr-only';
        politeAnnouncer.setAttribute('aria-live', 'polite');
        politeAnnouncer.setAttribute('aria-atomic', 'true');
        politeAnnouncer.setAttribute('role', 'status');
        document.body.appendChild(politeAnnouncer);
    }
} 