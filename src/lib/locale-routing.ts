import type { Metadata } from 'next';
import type { Locale } from '@/content';
import { hindiLive } from '@/content/shared';
import { isExternalHref } from './links';

/**
 * Where each page lives in each language.
 *
 * English keeps every URL it has always had; Hindi is the same path under
 * `/hi`, with the same English-letter slugs (`/services/numerology` →
 * `/hi/services/numerology`). Content holds language-neutral (English) paths,
 * and every internal link is passed through `localePath` where it is
 * rendered, so a Hindi page never links a visitor back into English.
 */

const HINDI_PREFIX = '/hi';

function isHindiPath(path: string): boolean {
  return path === HINDI_PREFIX || path.startsWith(`${HINDI_PREFIX}/`) || path.startsWith(`${HINDI_PREFIX}#`);
}

/** The language a site path is in. */
export function localeOfPath(path: string): Locale {
  return isHindiPath(path) ? 'hi' : 'en';
}

/**
 * A site path in the given language: `'/about'` → `'/hi/about'` for Hindi,
 * `'/'` → `'/hi'`, `'/#services'` → `'/hi#services'`. Off-site, WhatsApp,
 * mail and phone links, and paths already in Hindi, come back unchanged.
 */
export function localePath(locale: Locale, path: string): string {
  if (locale === 'en' || isExternalHref(path) || !path.startsWith('/') || isHindiPath(path)) return path;
  if (path === '/') return HINDI_PREFIX;
  if (path.startsWith('/#')) return `${HINDI_PREFIX}${path.slice(1)}`;
  return `${HINDI_PREFIX}${path}`;
}

/** The same page in the other language: `/about` ↔ `/hi/about`, `/` ↔ `/hi`. */
export function alternatePath(path: string): string {
  if (!isHindiPath(path)) return localePath('hi', path);
  const rest = path.slice(HINDI_PREFIX.length);
  if (rest === '') return '/';
  return rest.startsWith('#') ? `/${rest}` : rest;
}

/**
 * The language half of a page's metadata, for a language-neutral `path`.
 *
 * - The canonical points at the page in its own language.
 * - While Hindi is off (`hindiLive` false), Hindi pages are `noindex` and no
 *   page names the other language, so search engines never meet `/hi`.
 * - Once it is on, every page lists both languages, with English as the
 *   default for anyone whose language is neither.
 */
export function localeMetadata(
  locale: Locale,
  path: string,
  live: boolean = hindiLive,
): Pick<Metadata, 'alternates' | 'robots'> {
  const canonical = localePath(locale, path);
  if (!live) {
    return locale === 'hi'
      ? { alternates: { canonical }, robots: { index: false, follow: false } }
      : { alternates: { canonical } };
  }
  const english = localePath('en', path);
  return {
    alternates: {
      canonical,
      languages: { 'en-IN': english, 'hi-IN': localePath('hi', path), 'x-default': english },
    },
  };
}
