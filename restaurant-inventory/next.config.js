/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove the redirects configuration since we're using route groups
  // We'll handle the routing through the middleware instead

  // Disable ESLint during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during build
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // Configure allowed image domains
  images: {
    domains: [
      "example.com",
      "localhost",
      "placehold.co",
      "placekitten.com",
      "picsum.photos",
      "images.unsplash.com",
      "via.placeholder.com",
      "rnxfpfvvqwxcwwqbfvjj.supabase.co", // Supabase storage domain
      "xzvqzxieczeznywlhfru.supabase.co", // Another Supabase storage domain
      "github.com", // Added for user profile images
    ],
  },
};

module.exports = nextConfig;
