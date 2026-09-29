import { getCloudflareContext } from '@opennextjs/cloudflare';

/** The shape of Cloudflare's Workers Rate Limiting binding (see wrangler.jsonc). */
type Limiter = { limit(options: { key: string }): Promise<{ success: boolean }> };

/**
 * True when this caller has used up the contact-form allowance (5 a minute
 * per IP, set in wrangler.jsonc).
 *
 * Fails open: with no binding (next dev, tests) or on any error, the request
 * goes through. A limiter problem must never block a real visitor's message.
 */
export async function isRateLimited(request: Request): Promise<boolean> {
  try {
    const { env } = getCloudflareContext();
    const limiter = (env as { CONTACT_LIMITER?: Limiter }).CONTACT_LIMITER;
    if (!limiter) return false;
    const key = request.headers.get('cf-connecting-ip') ?? 'unknown';
    const { success } = await limiter.limit({ key });
    return !success;
  } catch {
    return false;
  }
}
