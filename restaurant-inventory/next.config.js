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

  // Configure webpack to handle minification and exclude problematic date-fns locales
  webpack: (config, { isServer }) => {
    // Disable minification for all builds to prevent unicode issues
    config.optimization.minimize = false;

    // Remove problematic plugins for all builds
    config.plugins = config.plugins.filter(
      (plugin) =>
        plugin.constructor.name !== "MinifyPlugin" &&
        plugin.constructor.name !== "TerserPlugin"
    );

    // Add a custom loader to handle unicode characters and problematic locales
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: [
        {
          loader: 'string-replace-loader',
          options: {
            search: /[^\x00-\x7F]/g,
            replace: '',
            flags: 'g'
          }
        }
      ]
    });

    // Add specific replacements for problematic date-fns locale files
    config.module.rules.push({
      test: /node_modules\/date-fns\/locale\/(ar|ar-DZ|ar-EG|ar-MA|ar-SA|ar-TN|be|be-tarask)\.js$/,
      use: [
        {
          loader: 'string-replace-loader',
          options: {
            search: /.*/g,
            replace: 'module.exports = {};',
            flags: 'g'
          }
        }
      ]
    });

    // Add specific replacements for problematic date-fns locale match files
    config.module.rules.push({
      test: /node_modules\/date-fns\/locale\/(ar|ar-DZ|ar-EG|ar-MA|ar-SA|ar-TN|be|be-tarask)\/_lib\/match\.js$/,
      use: [
        {
          loader: 'string-replace-loader',
          options: {
            search: /.*/g,
            replace: 'module.exports = { ordinalNumber: function() {}, era: function() {}, quarter: function() {}, month: function() {}, day: function() {}, dayPeriod: function() {} };',
            flags: 'g'
          }
        }
      ]
    });

    return config;
  },

  // Ensure proper handling of static assets
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig;
