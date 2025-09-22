/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  // Explicitly configure source directory
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
}

module.exports = nextConfig