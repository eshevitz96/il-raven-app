import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Stops random sites from embedding your page
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.cmmncreators.com https://cmmncreators.com;", // Only allow your Wix site to embed if you choose that route
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          }
        ],
      },
    ];
  },
};

export default nextConfig;
