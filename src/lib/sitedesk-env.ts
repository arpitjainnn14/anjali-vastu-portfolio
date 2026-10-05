import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createSitedeskClient, type SitedeskClient } from './sitedesk';

interface Env {
  SITEDESK?: { fetch(input: string, init?: RequestInit): Promise<Response> };
  SITEDESK_URL?: string;
  SITEDESK_READ_TOKEN?: string;
}

const SITE_SLUG = 'anjali';
const TIMEOUT_MS = 4000;

/** Service binding when deployed (free, no network hop); plain HTTP to SITEDESK_URL in local development. */
export function getSitedeskClient(): SitedeskClient {
  const env = getCloudflareContext().env as unknown as Env;
  const token = env.SITEDESK_READ_TOKEN ?? '';
  return createSitedeskClient({
    site: SITE_SLUG,
    request: (path) => {
      const init: RequestInit = { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(TIMEOUT_MS) };
      if (env.SITEDESK) return env.SITEDESK.fetch(`https://sitedesk${path}`, init);
      if (env.SITEDESK_URL) return fetch(`${env.SITEDESK_URL}${path}`, init);
      return Promise.reject(new Error('Sitedesk is not configured'));
    },
  });
}
