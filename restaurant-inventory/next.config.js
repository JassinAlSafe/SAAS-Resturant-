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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "gottebiten.se",
      },
      {
        protocol: "https",
        hostname: "outofhome.se",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    // Allow unoptimized images since we're proxying them
    unoptimized: true,
  },

  // Configure webpack to handle minification
  webpack: (config, { dev, isServer }) => {
    // Only modify production client-side builds
    if (!dev && !isServer) {
      // Disable minification
      config.optimization.minimize = false;

      // Remove problematic plugins
      config.plugins = config.plugins.filter(
        (plugin) =>
          plugin.constructor.name !== "MinifyPlugin" &&
          plugin.constructor.name !== "TerserPlugin"
      );
    }

    // Fix for Unicode issues in development mode
    if (dev) {
      // Ensure proper handling of Unicode characters
      config.optimization = {
        ...config.optimization,
        // Ensure moduleIds are more deterministic
        moduleIds: "named",
        // Ensure proper chunk handling
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Merge all chunks together
            commons: {
              name: "commons",
              chunks: "all",
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Ensure proper handling of static assets
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig;
