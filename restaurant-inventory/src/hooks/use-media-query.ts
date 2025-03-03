import { useMediaQuery } from 'react-responsive';
import { useState, useEffect } from 'react';

// Breakpoints aligned with common device sizes
export const useMediaQueries = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const isLargeDesktop = useMediaQuery({ minWidth: 1440 });

    return {
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        // Current device type as a string
        deviceType: isMobile
            ? 'mobile'
            : isTablet
                ? 'tablet'
                : isLargeDesktop
                    ? 'largeDesktop'
                    : 'desktop'
    };
};

// SSR-friendly media query hook with fallback
export const useSafeMediaQueries = () => {
    // Create state to track if we've hydrated
    const [hasMounted, setHasMounted] = useState(false);

    // We need to call hooks unconditionally at the top level
    const mediaQueries = useMediaQueries();

    // Effect to update mounted state after hydration is complete
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // During SSR and first client render (before hydration is complete), 
    // return desktop values to ensure consistent UI between server and client
    if (!hasMounted) {
        return {
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            isLargeDesktop: false,
            deviceType: 'desktop',
        };
    }

    // After hydration, return the actual media queries
    return mediaQueries;
};

export default useSafeMediaQueries; 