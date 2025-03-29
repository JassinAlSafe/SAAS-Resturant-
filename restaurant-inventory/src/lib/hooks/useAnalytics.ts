import { useCallback } from "react";

type AnalyticsEventPayload = Record<string, string | number | boolean | undefined>;
type UserTraits = Record<string, string | number | boolean | null | undefined>;
type PageProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * useAnalytics Hook
 * 
 * Provides methods to track events and user interactions
 */
export function useAnalytics() {
    /**
     * Track an analytics event
     * 
     * @param eventName Name of the event to track
     * @param payload Optional data to include with the event
     */
    const trackEvent = useCallback((eventName: string, payload?: AnalyticsEventPayload) => {
        // In a real implementation, this would connect to your analytics provider
        // Example: 
        // - Google Analytics: gtag('event', eventName, payload)
        // - Segment: analytics.track(eventName, payload)

        // For now, just log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] ${eventName}`, payload || {});
        }
    }, []);

    /**
     * Identify a user in your analytics platform
     * 
     * @param userId User's ID
     * @param traits User properties/traits
     */
    const identifyUser = useCallback((userId: string, traits?: UserTraits) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Identify User: ${userId}`, traits || {});
        }
    }, []);

    /**
     * Track a page view
     * 
     * @param pageName Name of the page
     * @param properties Additional page properties
     */
    const trackPageView = useCallback((pageName: string, properties?: PageProperties) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Page View: ${pageName}`, properties || {});
        }
    }, []);

    return {
        trackEvent,
        identifyUser,
        trackPageView
    };
}

export default useAnalytics; 