import type { Locale } from '@/content';

/**
 * The blog's source of posts: Sitedesk, the content dashboard. Only the published copy of a live post is ever served.
 * Anything that goes wrong (Sitedesk down, a bad reply, a timeout) comes back as `unavailable`, never as a thrown
 * error, so a blog page can say so and every other page is unaffected.
 */

export interface BlogSummary {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: number;
  featuredImage: string | null;
}
export interface BlogPost extends BlogSummary {
  html: string;
  languages: Locale[];
  /** What the owner set in Sitedesk's SEO and Social tabs. Empty means "use the usual one". */
  seoTitle: string;
  seoDescription: string;
  noindex: boolean;
  canonical: string;
  shareImage: string | null;
  shareTitle: string;
  shareDescription: string;
}
export interface Redirect { from: string; to: string }
export interface BlogConfig { redirects: Redirect[] }
export interface SitemapEntry { path: string; lastModified: number }
export type Fetched<T> = { ok: true; data: T } | { ok: false; reason: 'unavailable' | 'not_found' };

const UNAVAILABLE = { ok: false, reason: 'unavailable' } as const;
const NOT_FOUND = { ok: false, reason: 'not_found' } as const;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Sitedesk's own web addresses are at most 80 characters plus a counter; anything longer is junk and never sent. */
const MAX_SLUG = 100;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isSummary = (v: unknown): v is Omit<BlogSummary, 'featuredImage'> & { featuredImage?: unknown } =>
  isRecord(v) &&
  typeof v.slug === 'string' && SLUG.test(v.slug) &&
  typeof v.title === 'string' && typeof v.excerpt === 'string' && typeof v.category === 'string' &&
  Array.isArray(v.tags) && v.tags.every((t) => typeof t === 'string') &&
  typeof v.publishedAt === 'number';
const orNull = (v: unknown): string | null => (typeof v === 'string' && /^https?:\/\//.test(v) ? v : null);
const orEmpty = (v: unknown): string => (typeof v === 'string' ? v : '');
const toSummary = (v: Omit<BlogSummary, 'featuredImage'> & { featuredImage?: unknown }): BlogSummary => ({ ...v, featuredImage: orNull(v.featuredImage) });
function toPost(v: unknown): BlogPost | null {
  if (!isSummary(v)) return null;
  const r = v as unknown as Record<string, unknown>;
  if (typeof r.html !== 'string' || !Array.isArray(r.languages) || !r.languages.every((l) => l === 'en' || l === 'hi')) return null;
  return {
    ...toSummary(v), html: r.html, languages: r.languages as Locale[],
    seoTitle: orEmpty(r.seoTitle), seoDescription: orEmpty(r.seoDescription), noindex: r.noindex === true, canonical: /^https?:\/\//.test(orEmpty(r.canonical)) ? orEmpty(r.canonical) : '',
    shareImage: orNull(r.shareImage), shareTitle: orEmpty(r.shareTitle), shareDescription: orEmpty(r.shareDescription),
  };
}

/** Where an old address now lives, or null. Only the exact old address matches, and the target is a path on this site or a web address. */
export function redirectTarget(redirects: Redirect[], path: string): string | null {
  const to = redirects.find((r) => r.from === path)?.to;
  if (!to) return null;
  if (to.startsWith('/') && !to.startsWith('//')) return to;
  return /^https?:\/\//.test(to) ? to : null;
}

export function createSitedeskClient(opts: { request: (path: string) => Promise<Response>; site: string }) {
  const base = `/api/v1/sites/${opts.site}/posts`;

  async function get(path: string): Promise<Response | null> {
    try {
      return await opts.request(path);
    } catch {
      return null;
    }
  }

  return {
    async getConfig(): Promise<Fetched<BlogConfig>> {
      const res = await get(`/api/v1/sites/${opts.site}/config`);
      if (!res || !res.ok) return UNAVAILABLE;
      const body: unknown = await res.json().catch(() => null);
      const cfg = isRecord(body) && isRecord(body.config) ? body.config : null;
      if (!cfg || !Array.isArray(cfg.redirects) || !cfg.redirects.every((r) => isRecord(r) && typeof r.from === 'string' && typeof r.to === 'string')) return UNAVAILABLE;
      return { ok: true, data: { redirects: (cfg.redirects as Redirect[]).map((r) => ({ from: r.from, to: r.to })) } };
    },
    /** Live addresses for sitemap.xml. Posts the owner hid from search engines are already left out. */
    async getSitemap(): Promise<Fetched<SitemapEntry[]>> {
      const res = await get(`/api/v1/sites/${opts.site}/sitemap`);
      if (!res || !res.ok) return UNAVAILABLE;
      const body: unknown = await res.json().catch(() => null);
      if (!isRecord(body) || !Array.isArray(body.entries)) return UNAVAILABLE;
      if (!body.entries.every((e) => isRecord(e) && typeof e.path === 'string' && typeof e.lastModified === 'number')) return UNAVAILABLE;
      const safe = (body.entries as SitemapEntry[]).filter((e) => e.path.startsWith('/') && !e.path.startsWith('//'));
      return { ok: true, data: safe.map((e) => ({ path: e.path, lastModified: e.lastModified })) };
    },
    async listPosts(lang: Locale): Promise<Fetched<BlogSummary[]>> {
      const res = await get(`${base}?lang=${lang}`);
      if (!res || !res.ok) return UNAVAILABLE;
      const body: unknown = await res.json().catch(() => null);
      if (!isRecord(body) || !Array.isArray(body.posts) || !body.posts.every(isSummary)) return UNAVAILABLE;
      return { ok: true, data: body.posts.map(toSummary) };
    },
    async getPost(slug: string, lang: Locale): Promise<Fetched<BlogPost>> {
      if (!SLUG.test(slug) || slug.length > MAX_SLUG) return NOT_FOUND;
      const res = await get(`${base}/${slug}?lang=${lang}`);
      if (!res) return UNAVAILABLE;
      if (res.status === 404) {
        // Only Sitedesk's own "Not found." is a missing post. A bare or HTML 404 means the wiring is wrong, and must not
        // look like every post vanishing (search engines would drop them).
        const body: unknown = await res.json().catch(() => null);
        return isRecord(body) && body.error === 'Not found.' ? NOT_FOUND : UNAVAILABLE;
      }
      if (!res.ok) return UNAVAILABLE;
      const body: unknown = await res.json().catch(() => null);
      const post = isRecord(body) ? toPost(body.post) : null;
      return post ? { ok: true, data: post } : UNAVAILABLE;
    },
  };
}

export type SitedeskClient = ReturnType<typeof createSitedeskClient>;
