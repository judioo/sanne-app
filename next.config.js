/** @type {import('next').NextConfig} */

const nextConfig = {
  // Use standalone output for production deployment
  output: 'standalone',
  
  // Configure images
  images: {
    domains: ['cdn.shopify.com', 'sanne.com'],
  },
  
  // Disable validation during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
