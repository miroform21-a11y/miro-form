import type { NextConfig } from "next";

// Files published from the CMS (public bucket) and, in the admin preview, uploaded drafts (short-lived signed URLs).
// A host pattern instead of SUPABASE_URL: the allow-list must not depend on variables being present at build time;
// the CMS itself only accepts files of the configured project (src/cms/validate.ts).
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/cms-public/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/sign/cms-drafts/**" },
    ],
  },
  experimental: {
    // two root layouts (Ukrainian site + /en) → the branded 404 lives in app/global-not-found.tsx
    globalNotFound: true,
    // content import in the admin (a full CMS export is a few MB)
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
