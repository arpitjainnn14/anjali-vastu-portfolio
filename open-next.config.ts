import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

/**
 * Every page is built ahead of time and nothing revalidates, so the
 * prerendered pages are served straight from Workers Static Assets. No R2 or
 * KV storage is needed. If a page ever uses `revalidate`, this must change.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
