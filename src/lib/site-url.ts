/**
 * The site's public origin, for canonicals, the sitemap, OG tags and JSON-LD.
 *
 * NEXT_PUBLIC_SITE_URL wins when set. Otherwise, on Vercel, the project's
 * production domain (a system variable Vercel sets at build, and which follows
 * a custom domain once one is attached). Localhost only when neither exists.
 *
 * A production build that would fall back to localhost fails instead: every
 * canonical pointing at localhost tells Google the real pages are duplicates.
 * On Cloudflare (Workers Builds, or a deploy from a laptop) there is no host
 * variable to fall back on, so NEXT_PUBLIC_SITE_URL must be set as a *build* variable.
 */
export function resolveSiteUrl(env: Record<string, string | undefined>): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) return `https://${vercelHost}`;

  // Any production build, wherever it runs (Vercel, Workers CI, or `npm run deploy` on a laptop).
  if (env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production' || env.WORKERS_CI === '1') {
    throw new Error('Set NEXT_PUBLIC_SITE_URL: a production build would otherwise canonicalise to localhost.');
  }
  return 'http://localhost:3000';
}

export const siteUrl = resolveSiteUrl({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  WORKERS_CI: process.env.WORKERS_CI,
  NODE_ENV: process.env.NODE_ENV,
});

/** An absolute URL on this site, for JSON-LD, which does not use metadataBase. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
