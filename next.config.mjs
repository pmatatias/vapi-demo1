/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add env configuration to expose NEXT_PUBLIC_VAPI_API_KEY to the client
  env: {
    NEXT_PUBLIC_VAPI_API_KEY: process.env.NEXT_PUBLIC_VAPI_API_KEY || '',
    NEXT_PUBLIC_VAPI_ASSISTANT_ID: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '',
  },
  // Enable standalone output for Docker
  output: 'standalone',
};

export default nextConfig;
