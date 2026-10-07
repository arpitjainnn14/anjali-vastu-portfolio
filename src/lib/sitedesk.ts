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
}
export interface BlogPost extends BlogSummary {
  html: string;
  languages: Locale[];
}
export type Fetched<T> = { ok: true; data: T } | { ok: false; reason: 'unavailable' | 'not_found' };

const UNAVAILABLE = { ok: false, reason: 'unavailable' } as const;
const NOT_FOUND = { ok: false, reason: 'not_found' } as const;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Sitedesk's own web addresses are at most 80 characters plus a counter; anything longer is junk and never sent. */
const MAX_SLUG = 100;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isSummary = (v: unknown): v is BlogSummary =>
  isRecord(v) &&
  typeof v.slug === 'string' && SLUG.test(v.slug) &&
  typeof v.title === 'string' && typeof v.excerpt === 'string' && typeof v.category === 'string' &&
  Array.isArray(v.tags) && v.tags.every((t) => typeof t === 'string') &&
  typeof v.publishedAt === 'number';
const isPost = (v: unknown): v is BlogPost => {
  if (!isSummary(v)) return false;
  const r = v as unknown as Record<string, unknown>;
  return typeof r.html === 'string' && Array.isArray(r.languages) && r.languages.every((l) => l === 'en' || l === 'hi');
};

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
    async listPosts(lang: Locale): Promise<Fetched<BlogSummary[]>> {
      const res = await get(`${base}?lang=${lang}`);
      if (!res || !res.ok) return UNAVAILABLE;
      const body: unknown = await res.json().catch(() => null);
      if (!isRecord(body) || !Array.isArray(body.posts) || !body.posts.every(isSummary)) return UNAVAILABLE;
      return { ok: true, data: body.posts };
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
      if (!isRecord(body) || !isPost(body.post)) return UNAVAILABLE;
      return { ok: true, data: body.post };
    },
  };
}

export type SitedeskClient = ReturnType<typeof createSitedeskClient>;
