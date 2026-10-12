import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { SECURITY_HEADERS } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  experimental: {
    /*
     * The site has two root layouts (app/(en), app/(hi)/hi), so a URL that
     * matches no page needs app/global-not-found.tsx to get the site's layout.
     */
    globalNotFound: true,
  },
  /* Pages and API routes. Files served straight from public/ get the same list from public/_headers. */
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;

/* Gives `next dev` the same Cloudflare bindings the deployed Worker has. */
initOpenNextCloudflareForDev();
