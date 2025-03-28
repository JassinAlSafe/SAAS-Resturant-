"use client";

import { useCallback } from "react";

type AnalyticsEventPayload = Record<string, string | number | boolean | undefined>;

/**
 * useAnalytics Hook
 * 
 * Provides methods to track events and user interactions
 * Can be connected to any analytics provider (Google Analytics, Segment, etc.)
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
    // - Mixpanel: mixpanel.track(eventName, payload)
    
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}`, payload || {});
    }
    
    // Here you would implement your actual analytics tracking
    // Example with Google Analytics:
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', eventName, payload);
    // }
  }, []);

  /**
   * Identify a user in your analytics platform
   * 
   * @param userId User's ID
   * @param traits User properties/traits
   */
  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Identify User: ${userId}`, traits || {});
    }
    
    // Example with Segment:
    // if (typeof window !== 'undefined' && window.analytics) {
    //   window.analytics.identify(userId, traits);
    // }
  }, []);

  /**
   * Track a page view
   * 
   * @param pageName Name of the page
   * @param properties Additional page properties
   */
  const trackPageView = useCallback((pageName: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Page View: ${pageName}`, properties || {});
    }
    
    // Example implementation:
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('config', 'YOUR-GA-ID', {
    //     page_title: pageName,
    //     page_path: window.location.pathname,
    //     ...properties
    //   });
    // }
  }, []);
  
  return {
    trackEvent,
    identifyUser,
    trackPageView
  };
}

export default useAnalytics;