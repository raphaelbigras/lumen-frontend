/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/tickets', destination: '/billets', permanent: true },
      { source: '/tickets/new', destination: '/billets/nouveau', permanent: true },
      { source: '/tickets/:id', destination: '/billets/:id', permanent: true },
    ];
  },
};
module.exports = nextConfig;
