import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  images: {
    deviceSizes: process.env.NODE_ENV === 'development' ? [640] : [640, 750, 828, 1080],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: [],
  },
};

export default withBundleAnalyzer(nextConfig);
