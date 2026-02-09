import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable Turbopack to avoid bundling issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
