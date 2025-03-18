# Image Proxy for External Images

This document explains how to use the image proxy feature to display images from any URL in your Next.js application.

## What is the Image Proxy?

The image proxy is a feature that allows you to display images from any URL in your Next.js application, even if the domain is not configured in your `next.config.js` file. It works by routing image requests through a proxy server that handles the image fetching and serving.

## How to Use the Image Proxy

### Using the ProxyImage Component

The easiest way to use the image proxy is to use the `ProxyImage` component:

```tsx
import { ProxyImage } from "@/components/ui/proxy-image";

// In your JSX:
<ProxyImage
  src="https://example.com/image.jpg"
  alt="Example image"
  width={500}
  height={300}
/>;
```

This component will automatically proxy the image through the Next.js API route if the URL is external.

### Props

The `ProxyImage` component supports all the props of Next.js's `Image` component, plus:

- `fallbackSrc`: A URL to use as a fallback if the image fails to load (defaults to `/placeholder-image.jpg`)
- `containerClassName`: A className to apply to the container div
- `className`: A className to apply to the image

### Directly Using the API Route

If you need to use the image proxy directly, you can use the API route:

```tsx
const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(
  "https://example.com/image.jpg"
)}`;
```

## How It Works

1. When you use the `ProxyImage` component with an external URL, it converts the URL to a proxied URL.
2. The proxied URL points to the Next.js API route `/api/image-proxy`.
3. The API route fetches the image from the external URL and returns it with proper headers.
4. Next.js can safely display the image because it's coming from your own domain.

## Benefits

- You can display images from any domain without configuring each domain in `next.config.js`.
- It provides built-in error handling and loading states.
- It works with both internal and external images seamlessly.
- It handles caching to improve performance.

## Limitations

- The proxy may add a small amount of latency to image loading.
- Very large images may take longer to load through the proxy.
- The proxy server has to be running if you're using the standalone version.

## Troubleshooting

If you encounter issues with the image proxy:

1. Make sure the external URL is accessible and points to a valid image.
2. Check that the `/api/image-proxy` route is working properly.
3. Check the browser console for any errors related to image loading.
4. Verify that you're using the correct syntax for the `ProxyImage` component.
