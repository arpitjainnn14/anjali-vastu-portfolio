import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

/* Gives `next dev` the same Cloudflare bindings the deployed Worker has. */
initOpenNextCloudflareForDev();
