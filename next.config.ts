import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    /*
     * The site has two root layouts (app/(en), app/(hi)/hi), so a URL that
     * matches no page needs app/global-not-found.tsx to get the site's layout.
     */
    globalNotFound: true,
  },
};

export default nextConfig;

/* Gives `next dev` the same Cloudflare bindings the deployed Worker has. */
initOpenNextCloudflareForDev();
