/**
 * Utility functions for the image proxy system
 */

/**
 * Converts an image URL to a proxied URL if it's external
 * @param url The original image URL
 * @returns The proxied URL if external, or the original URL if internal
 */
export function getProxiedImageUrl(url: string): string {
    if (!url) return '/placeholder-image.jpg';

    // Check if the URL is a data URL
    if (url.startsWith('data:')) {
        return url;
    }

    // If URL is already relative or a blob, return as is
    if (url.startsWith('/') || url.startsWith('blob:')) {
        return url;
    }

    // If we're on the client side, check if the URL is from our domain
    if (typeof window !== 'undefined') {
        if (url.startsWith(window.location.origin)) {
            return url;
        }
    }

    // For external URLs, proxy through our API
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/**
 * Determines if an image URL needs to be proxied
 * @param url The image URL to check
 * @returns true if the URL needs to be proxied
 */
export function needsProxy(url: string): boolean {
    if (!url) return false;

    // Data URLs, relative URLs, and blob URLs don't need to be proxied
    if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:')) {
        return false;
    }

    // If we're on the client side, check if the URL is from our domain
    if (typeof window !== 'undefined') {
        if (url.startsWith(window.location.origin)) {
            return false;
        }
    }

    // All other URLs need to be proxied
    return true;
} 