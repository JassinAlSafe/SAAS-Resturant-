# Image Proxy for Next.js

This project includes a flexible image proxy system that allows you to display images from any URL in your Next.js application, even if the domain is not configured in your `next.config.js` file.

## Quick Start

1. **Install dependencies**:

```bash
npm install express http-proxy-middleware cors concurrently
```

2. **Update your package.json**:

```bash
npm run dev:all  # This will start both Next.js and the proxy server
```

3. **Use the ProxyImage component**:

```jsx
import { ProxyImage } from "@/components/ui/proxy-image";

<ProxyImage
  src="https://example.com/any-image.jpg"
  alt="Example image"
  width={500}
  height={300}
/>;
```

## How It Works

The image proxy system consists of two main components:

1. **Next.js API Route**: Located at `/api/image-proxy`, this route fetches images from any URL and serves them.
2. **ProxyImage Component**: A wrapper around Next.js's Image component that automatically routes external image URLs through the proxy.

When you use the ProxyImage component with an external URL, it automatically processes the URL through the proxy system, allowing you to display images from any domain without configuring each domain in your Next.js config.

## Benefits

- **User-friendly**: Users can add images from any URL without requiring configuration changes.
- **Secure**: The proxy server provides a layer of security for fetching external images.
- **Flexible**: Works with any external image URL, including those from Supabase storage.
- **Performance**: Includes caching headers to improve loading times.

## Implementation Details

The implementation includes:

- `server/proxy-server.js`: A standalone Express proxy server
- `src/app/api/image-proxy/route.ts`: A Next.js API route for proxying images
- `src/components/ui/proxy-image.tsx`: A custom Image component using the proxy
- `src/lib/image-proxy.ts`: Utility functions for working with the proxy

## Troubleshooting

If you encounter issues with images not loading:

1. Check that the API route is working by visiting `/api/health`
2. Verify that the image URL is accessible
3. Check browser console for any errors related to image loading

## Resources

- [Next.js Image Documentation](https://nextjs.org/docs/api-reference/next/image)
- [Express.js Documentation](https://expressjs.com/)
- [HTTP Proxy Middleware Documentation](https://github.com/chimurai/http-proxy-middleware)

For more detailed documentation, see the [image-proxy-usage.md](./docs/image-proxy-usage.md) file.
