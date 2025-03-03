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

  // Modify webpack configuration to bypass the problematic plugin
  webpack: (config, { dev, isServer, webpack }) => {
    // Only apply these in production build (when dev is false)
    if (!dev && !isServer) {
      // Force disable all minification
      config.optimization.minimize = false;
      config.optimization.minimizer = [];

      // Remove any references to WebpackError
      const plugins = config.plugins.filter((plugin) => {
        return (
          plugin.constructor.name !== "MinifyPlugin" &&
          plugin.constructor.name !== "TerserPlugin"
        );
      });

      config.plugins = plugins;
    }

    return config;
  },
};

module.exports = nextConfig;
