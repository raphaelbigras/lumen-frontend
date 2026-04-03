import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    reactCompiler: true,
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  async redirects() {
    return [
      { source: '/tickets', destination: '/billets', permanent: true },
      { source: '/tickets/new', destination: '/billets/nouveau', permanent: true },
      { source: '/tickets/:id', destination: '/billets/:id', permanent: true },
    ];
  },
};

export default nextConfig;
