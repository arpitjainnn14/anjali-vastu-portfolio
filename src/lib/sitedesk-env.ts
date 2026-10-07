import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cache } from 'react';
import type { Locale } from '@/content';
import { createSitedeskClient, type BlogPost, type Fetched, type SitedeskClient } from './sitedesk';

interface Env {
  SITEDESK?: { fetch(input: string, init?: RequestInit): Promise<Response> };
  SITEDESK_URL?: string;
  SITEDESK_READ_TOKEN?: string;
}

const SITE_SLUG = 'anjali';
const TIMEOUT_MS = 4000;

/**
 * SITEDESK_URL, when set, is plain HTTP (local development: a service binding only works while a `sitedesk` Worker is
 * registered locally). Otherwise the service binding is used (deployed: free, no network hop). Never set SITEDESK_URL in production.
 */
export function getSitedeskClient(): SitedeskClient {
  return createSitedeskClient({
    site: SITE_SLUG,
    request: async (path) => {
      // Read inside the request, so a missing Cloudflare context becomes "unavailable" like any other failure.
      const env = getCloudflareContext().env as unknown as Env;
      const token = env.SITEDESK_READ_TOKEN ?? '';
      const init: RequestInit = { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(TIMEOUT_MS) };
      if (env.SITEDESK_URL) return fetch(`${env.SITEDESK_URL}${path}`, init);
      if (env.SITEDESK) return env.SITEDESK.fetch(`https://sitedesk${path}`, init);
      throw new Error('Sitedesk is not configured');
    },
  });
}

/** One fetch per request: a post page asks for the post twice (its metadata and its body). */
export const getBlogPost = cache((slug: string, locale: Locale): Promise<Fetched<BlogPost>> => getSitedeskClient().getPost(slug, locale));
