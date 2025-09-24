/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  publicRuntimeConfig: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Explicitly configure source directory
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
}

module.exports = nextConfig