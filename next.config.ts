import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { SECURITY_HEADERS } from "./src/lib/security-headers";
import { loadPublishedText } from "./src/lib/published-text";

const baseConfig: NextConfig = {
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

/*
 * A build carries the words Anjali published in Sitedesk (src/content/editable.ts), so every page stays prebuilt.
 * Publishing in Sitedesk starts a new build through the Worker's deploy hook. Development uses the copy in code.
 */
export default async function nextConfig(phase: string): Promise<NextConfig> {
  const siteText = phase === PHASE_PRODUCTION_BUILD ? await loadPublishedText(process.env) : "";
  return { ...baseConfig, env: { SITE_TEXT: siteText } };
}

/* Gives `next dev` the same Cloudflare bindings the deployed Worker has. */
initOpenNextCloudflareForDev();
