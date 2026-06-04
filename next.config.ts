import type { NextConfig } from 'next';

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' as const } : {}),
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
