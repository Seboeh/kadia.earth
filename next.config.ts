import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
