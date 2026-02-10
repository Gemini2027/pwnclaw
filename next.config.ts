import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // V11: Removed 'unsafe-eval' — not needed in Next.js production builds (only dev)
      "script-src 'self' 'unsafe-inline' https://clerk.pwnclaw.com https://*.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://*.clerk.accounts.dev https://clerk.pwnclaw.com wss://*.supabase.co https://*.lemonsqueezy.com",
      "frame-src 'self' https://*.clerk.accounts.dev https://*.lemonsqueezy.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join('; ')
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin'
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin'
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // W12: Permanent redirects (308) for SEO — replaces redirect() in page components
  async redirects() {
    return [
      {
        source: '/pricing',
        destination: '/#pricing',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/#faq',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
