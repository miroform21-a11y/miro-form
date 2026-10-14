import type { NextConfig } from "next";

// Files published from the CMS (public bucket) and, in the admin preview, uploaded drafts (short-lived signed URLs)
const supabaseHost = (() => {
  try {
    return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [
          { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/cms-public/**" },
          { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/sign/cms-drafts/**" },
        ]
      : [],
  },
  experimental: {
    // two root layouts (Ukrainian site + /en) → the branded 404 lives in app/global-not-found.tsx
    globalNotFound: true,
    // content import in the admin (a full CMS export is a few MB)
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
