import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// OPTIMIZATION: Bundle analyzer for production analysis
// Run: pnpm analyze
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Next.js 16: Enable Cache Components for explicit caching
  // This makes caching opt-in and more predictable
  // cacheComponents: true, // Uncomment when ready to use "use cache" directive

  turbopack: {
    // Resolve aliases - Import dễ dàng hơn
    resolveAlias: {
      "@": "./src",
      "@components": "./src/components",
      "@lib": "./src/lib",
      "@modules": "./src/modules",
      "@hooks": "./src/hooks",
      "@collections": "./src/collections",
      "@trpc": "./src/trpc",
      "@contexts": "./src/contexts",
      "@store": "./src/store",
    },
    // Custom extensions resolution
    resolveExtensions: [
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".json",
      ".css",
      ".scss",
    ],
    // Uncomment nếu muốn dùng SVG as React components
    // rules: {
    //   '*.svg': {
    //     loaders: ['@svgr/webpack'],
    //     as: '*.js',
    //   },
    // },
  },
  reactStrictMode: false, // true: Enable for better performance & debugging
  devIndicators: false,
  output: "standalone", // Smaller Docker images
  experimental: {
    turbopackFileSystemCacheForDev: true, // Next.js 16: Turbopack filesystem caching for faster dev restarts
    // Tree-shake multiple packages
    optimizePackageImports: [
      "@radix-ui/*",
      "lucide-react",
      "date-fns",
      "recharts",
      "lodash-es",
    ],
  },
  // OPTIMIZATION: Image optimization config
  images: {
    formats: ["image/avif", "image/webp"], // Modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384], // Next.js 16: Removed 16px (used by only 4.2% of projects)
    minimumCacheTTL: 14400, // Next.js 16 default: 4 hours (14400s) instead of 60s
    qualities: [75], // // Next.js 16: Coerce quality to closest value in qualities array. Default quality for all images
    maximumRedirects: 3, // Next.js 16: Limit redirects for security
    // dangerouslyAllowSVG: true,
    // contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nexstp.store",
        port: "",
        pathname: "/api/**",
        search: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/**",
        search: "",
      },
    ],
  },
  compress: true, // Performance: Compress responses
  poweredByHeader: false, // Performance: Optimize production builds
  // Security & Performance headers
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        // Performance: Enable font optimization
        {
          key: "Link",
          value: "<https://fonts.googleapis.com>; rel=preconnect; crossorigin",
        },
      ],
    },
    // Cache static assets aggressively
    {
      source: "/_next/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withPayload(withBundleAnalyzer(withNextIntl(nextConfig)));
