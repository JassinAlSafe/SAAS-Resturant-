import { useMediaQuery } from 'react-responsive';

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
    // For SSR, default to desktop view and then update once client-side
    const isClient = typeof window === 'object';

    if (!isClient) {
        return {
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            isLargeDesktop: false,
            deviceType: 'desktop',
        };
    }

    return useMediaQueries();
};

export default useSafeMediaQueries; 