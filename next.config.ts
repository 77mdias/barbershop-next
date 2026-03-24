import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint runs in CI via `npm run validate` — skip during next build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
