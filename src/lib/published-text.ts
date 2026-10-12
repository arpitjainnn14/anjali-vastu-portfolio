import { parsePublished } from '@/content/editable';

/**
 * Fetches the words Anjali published in Sitedesk, for next.config.ts to put into the build (src/content/editable.ts).
 *
 * A build that goes live must have them: if it cannot read them, it stops, rather than quietly putting the old words
 * back on the site. Only a local build without Sitedesk settings uses the copy in code, so development needs no setup.
 */

export interface PublishedTextEnv {
  /** Sitedesk's public address, e.g. https://sitedesk.example.workers.dev. A build variable, not the runtime SITEDESK_URL. */
  SITEDESK_BUILD_URL?: string;
  SITEDESK_READ_TOKEN?: string;
  WORKERS_CI?: string;
  /** The npm script running the build: `deploy` and `upload` publish it. */
  npm_lifecycle_event?: string;
}

const SITE_SLUG = 'anjali';
const TIMEOUT_MS = 15_000;

const goesLive = (env: PublishedTextEnv) => env.WORKERS_CI === '1' || env.npm_lifecycle_event === 'deploy' || env.npm_lifecycle_event === 'upload';

/** The published words as a JSON string, or '' to use the code copy. Throws when a build that goes live cannot get them. */
export async function loadPublishedText(env: PublishedTextEnv & Record<string, string | undefined>, f: typeof fetch = fetch): Promise<string> {
  const url = env.SITEDESK_BUILD_URL?.trim().replace(/\/$/, '');
  const token = env.SITEDESK_READ_TOKEN?.trim();
  if (!url || !token) {
    if (goesLive(env)) {
      throw new Error(
        'Set SITEDESK_BUILD_URL and SITEDESK_READ_TOKEN as build variables: without them this build would replace the words published in Sitedesk with the copy in code.',
      );
    }
    return '';
  }
  let res: Response;
  try {
    res = await f(`${url}/api/v1/sites/${SITE_SLUG}/texts`, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw new Error(`Could not reach Sitedesk for the published website words (${(err as Error).message}). Stopping the build.`);
  }
  if (!res.ok) throw new Error(`Sitedesk refused the published website words (HTTP ${res.status}). Stopping the build.`);
  const body = (await res.json().catch(() => null)) as { texts?: unknown } | null;
  if (!body || !body.texts || typeof body.texts !== 'object') throw new Error('Sitedesk sent website words this build does not understand. Stopping the build.');
  return JSON.stringify(parsePublished(JSON.stringify(body.texts)));
}
