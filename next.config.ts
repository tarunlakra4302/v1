import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Ensure we don't accidentally use Turbopack in production via config
  experimental: {
    // turbopack: false, // Default is false, but explicitly stating if needed
  },
};

export default nextConfig;
