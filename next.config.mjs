/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Do not fail the Vercel build on lint warnings; lint separately via `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
