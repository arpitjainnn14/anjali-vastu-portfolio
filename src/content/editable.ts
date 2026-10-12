/**
 * The words Anjali can change from Sitedesk without a developer: which strings
 * are editable, how they are grouped by page, and how her published changes
 * are laid over the copy in this folder.
 *
 * Only words. Links, prices, slugs, icons, the language of a quote and the
 * shape of every section (how many FAQs, how many steps) stay in code. A
 * published change is keyed by its path ("hero.lead", "faq.items.3.a"); a
 * path that no longer exists, or that is not editable, is ignored, so a
 * change in the code can never be broken by an old edit.
 *
 * The published changes arrive at build time (next.config.ts puts them in
 * process.env.SITE_TEXT), so every page is still prebuilt. Publishing in
 * Sitedesk starts a new build.
 */

import type { Locale } from './locale';

export interface EditableField {
  path: string;
  label: string;
  en: string;
  hi: string;
  max: number;
  multiline: boolean;
  /** The words in *asterisks* are shown in the accent colour. */
  accent: boolean;
  /** The fact has not been supplied yet; the site hides it until it is. */
  todo: boolean;
}
export interface EditableGroup { id: string; label: string; fields: EditableField[] }
export interface EditablePage { id: string; label: string; groups: EditableGroup[] }
export type PublishedText = Record<Locale, Record<string, string>>;

/** Keys whose strings are code, not words: links, images, slugs, icons, a quote's language, the booking set-up. */
const CODE_KEYS = new Set(['slug', 'icon', 'href', 'src', 'lang', 'calSlug', 'booking', 'fee']);
const CODE_VALUE = /^(https?:|mailto:|tel:|\/|#)|^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TODO = /^\s*TODO\(/;

/** Pages in the order Sitedesk lists them, and the content each one shows. */
const PAGES: { id: string; label: string; groups: { path: string; label: string }[] }[] = [
  {
    id: 'home', label: 'Home', groups: [
      { path: 'hero', label: 'Top of the page' },
      { path: 'servicesSection', label: 'Services section' },
      { path: 'howItWorks', label: 'How it works' },
      { path: 'faq', label: 'Questions and answers' },
    ],
  },
  {
    id: 'services', label: 'Services', groups: [
      { path: 'services.0', label: 'Vedic Astrology' },
      { path: 'services.1', label: 'Numerology' },
      { path: 'services.2', label: 'Vastu' },
      { path: 'serviceDetail', label: 'Labels on every service page' },
    ],
  },
  { id: 'about', label: 'About', groups: [{ path: 'about', label: 'About Anjali' }] },
  { id: 'teaching', label: 'Teaching', groups: [{ path: 'teaching', label: 'Classes' }] },
  {
    id: 'testimonials', label: 'Testimonials', groups: [
      { path: 'testimonialsSection', label: 'Heading and labels' },
      { path: 'testimonials', label: 'What clients wrote' },
    ],
  },
  { id: 'contact', label: 'Contact', groups: [{ path: 'contactSection', label: 'Contact' }] },
  { id: 'privacy', label: 'Privacy notice', groups: [{ path: 'privacy', label: 'Privacy notice' }] },
  { id: 'terms', label: 'Terms', groups: [{ path: 'terms', label: 'Terms of consultation' }] },
  { id: 'refunds', label: 'Refund policy', groups: [{ path: 'refundPolicy', label: 'Refunds and cancellations' }] },
];

const NAMES: Record<string, string> = {
  meta: 'Search result', title: 'Title', description: 'Description', metaDescription: 'Search result description',
  q: 'Question', a: 'Answer', items: 'Item', paragraphs: 'Paragraph', cta: 'Button', primaryCta: 'Main button',
  secondaryCta: 'Second button', label: 'Label', body: 'Text', heading: 'Heading', lead: 'Intro',
};

function words(key: string): string {
  if (NAMES[key]) return NAMES[key];
  const spaced = key.replace(/([a-z])([A-Z0-9])/g, '$1 $2').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** "steps.1.body" → "Steps 2 › Text": a list's position counts from one, and the list's name is kept once. */
function labelFor(parts: string[]): string {
  const out: string[] = [];
  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const n = String(Number(part) + 1);
      if (out.length) out[out.length - 1] += ` ${n}`;
      else out.push(`Item ${n}`);
    } else out.push(words(part));
  }
  return out.join(' › ') || 'Text';
}

function get(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined), root);
}

/** A generous limit: twice the original, and never less than room for a sentence. */
const limitFor = (text: string, todo: boolean) => (todo ? 600 : Math.min(6000, Math.max(80, text.length * 2, text.length + 120)));

function collect(en: unknown, hi: unknown, path: string, parts: string[], out: EditableField[]) {
  if (typeof en === 'string') {
    if (CODE_VALUE.test(en.trim())) return;
    const todo = TODO.test(en);
    const hiText = typeof hi === 'string' && !TODO.test(hi) ? hi : '';
    out.push({
      path, label: labelFor(parts), en: todo ? '' : en, hi: hiText, max: limitFor(en, todo),
      multiline: en.length > 90 || en.includes('\n'), accent: en.includes('*'), todo,
    });
    return;
  }
  if (!en || typeof en !== 'object') return;
  for (const [key, value] of Object.entries(en)) {
    if (CODE_KEYS.has(key)) continue;
    collect(value, hi && typeof hi === 'object' ? (hi as Record<string, unknown>)[key] : undefined, `${path}.${key}`, [...parts, key], out);
  }
}

/** Every editable string, grouped as Sitedesk shows them, with the code's English and Hindi as the starting text. */
export function editablePages(en: object, hi: object): EditablePage[] {
  return PAGES.map((page) => ({
    id: page.id,
    label: page.label,
    groups: page.groups.map((g) => {
      const fields: EditableField[] = [];
      collect(get(en, g.path), get(hi, g.path), g.path, [], fields);
      return { id: g.path, label: g.label, fields };
    }),
  }));
}

/** Path → longest allowed text, for every editable string. */
export function editableLimits(en: object, hi: object): Map<string, number> {
  const limits = new Map<string, number>();
  for (const page of editablePages(en, hi)) for (const g of page.groups) for (const f of g.fields) limits.set(f.path, f.max);
  return limits;
}

/** The published changes from the build, or none when they are missing or not understood. */
export function parsePublished(raw: string | undefined): PublishedText {
  const empty: PublishedText = { en: {}, hi: {} };
  if (!raw) return empty;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return empty;
  }
  if (!value || typeof value !== 'object') return empty;
  const pick = (v: unknown): Record<string, string> => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
    return Object.fromEntries(Object.entries(v).filter((e): e is [string, string] => typeof e[1] === 'string'));
  };
  const r = value as Record<string, unknown>;
  return { en: pick(r.en), hi: pick(r.hi) };
}

/** Copies only the objects on the way to the changed string, so the rest of the bundle (and its functions) is shared. */
function setIn(node: unknown, keys: string[], text: string): unknown {
  const [key, ...rest] = keys;
  const copy: Record<string, unknown> = Array.isArray(node) ? [...node] as unknown as Record<string, unknown> : { ...(node as Record<string, unknown>) };
  copy[key] = rest.length ? setIn(copy[key], rest, text) : text;
  return copy;
}

/**
 * The bundle with her published words in place. Unknown paths, over-long text and non-text values are ignored, and so
 * is blank text: a fact left empty stays unsupplied (and hidden), never an empty heading.
 */
export function applyPublished<T extends object>(bundle: T, texts: Record<string, string>, limits: Map<string, number>): T {
  let out: unknown = bundle;
  for (const [path, text] of Object.entries(texts)) {
    const max = limits.get(path);
    if (max === undefined || !text.trim() || text.length > max || typeof get(out, path) !== 'string') continue;
    out = setIn(out, path.split('.'), text);
  }
  return out as T;
}
