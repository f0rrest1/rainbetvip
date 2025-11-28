import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Let Next.js automatically handle NEXT_PUBLIC_ variables
};

export default nextConfig;
