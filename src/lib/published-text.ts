/**
 * Fetches the words Anjali published in Sitedesk, for next.config.ts to put into the build (src/content/editable.ts).
 *
 * A build that goes live (Workers Builds, `npm run deploy`, `npm run upload`) always reads them, and stops if it cannot,
 * rather than quietly putting the old words back on the site. Nothing needs setting up: the published words are public
 * (they are the words on the site), so no key is involved. Any other build uses the copy in code, so development and
 * `npm run build` need no network; set SITEDESK_BUILD_URL to make one of those read from a Sitedesk too.
 *
 * next.config.ts loads this file on its own, so it imports nothing from the project. The bundle checks the words again
 * when it reads them (parsePublished in src/content/editable.ts).
 */

export interface PublishedTextEnv {
  /** Another Sitedesk to read from (a local one, for testing). Not the runtime SITEDESK_URL. */
  SITEDESK_BUILD_URL?: string;
  WORKERS_CI?: string;
  /** The npm script running the build: `deploy` and `upload` publish it. */
  npm_lifecycle_event?: string;
}

/** Sitedesk's public address. */
const SITEDESK = 'https://sitedesk.jainarpit2004.workers.dev';
const SITE_SLUG = 'anjali';
const TIMEOUT_MS = 15_000;

const onlyText = (v: unknown): Record<string, string> =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v).filter((e): e is [string, string] => typeof e[1] === 'string'))
    : {};

const goesLive = (env: PublishedTextEnv) => env.WORKERS_CI === '1' || env.npm_lifecycle_event === 'deploy' || env.npm_lifecycle_event === 'upload';

/** The published words as a JSON string, or '' to use the code copy. Throws when a build that goes live cannot get them. */
export async function loadPublishedText(env: PublishedTextEnv & Record<string, string | undefined>, f: typeof fetch = fetch): Promise<string> {
  const override = env.SITEDESK_BUILD_URL?.trim().replace(/\/$/, '');
  if (!override && !goesLive(env)) return '';
  const url = override || SITEDESK;
  let res: Response;
  try {
    res = await f(`${url}/api/v1/sites/${SITE_SLUG}/texts`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    throw new Error(`Could not reach Sitedesk for the published website words (${(err as Error).message}). Stopping the build.`);
  }
  if (!res.ok) throw new Error(`Sitedesk refused the published website words (HTTP ${res.status}). Stopping the build.`);
  const body = (await res.json().catch(() => null)) as { texts?: unknown } | null;
  if (!body || !body.texts || typeof body.texts !== 'object') throw new Error('Sitedesk sent website words this build does not understand. Stopping the build.');
  const texts = body.texts as Record<string, unknown>;
  return JSON.stringify({ en: onlyText(texts.en), hi: onlyText(texts.hi) });
}
