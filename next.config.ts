import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  // two root layouts (Ukrainian site + /en) → the branded 404 lives in app/global-not-found.tsx
  experimental: { globalNotFound: true },
};

export default nextConfig;
