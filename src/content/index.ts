/**
 * Anjali Vastu & Astro Divine Solutions — all site copy.
 *
 * Every string the visitor reads lives in `en/` (English) or `hi/` (Hindi),
 * one module per area of the site; facts that don't change with language
 * live in `shared.ts`. No copy in components. Import from '@/content', never
 * from a module directly, so files can move without touching every import.
 *
 * `TODO(...)` marks a fact nobody has supplied yet. Do not invent one.
 * Before launch: `grep -rn "TODO(" src/` must return nothing.
 *
 * Copy marked DRAFTED is written from what Anjali said, not quoted from her.
 * She reads and corrects it before the site ships.
 *
 * There is no English compatibility export any more: a server component
 * takes `c: Content` as a prop (from a page's `getContent(locale)`), and a
 * client component reads `useContent()` from `LocaleProvider`. The two named
 * types below are the exception — they describe a shape that is the same in
 * every language (a testimonial's fields, the three service slugs) and are
 * needed wherever that shape is named, such as a `Record<ServiceSlug, …>` or
 * a `Testimonial[]` prop; they carry no copy of their own.
 */

export type { Testimonial } from './en/testimonials';
export type { ServiceSlug } from './en/picker';

export * from './locale';

import { en } from './en';
import { hi } from './hi';
import type { Locale, Content } from './locale';

/** The full content bundle for one language. */
export function getContent(locale: Locale): Content {
  return locale === 'hi' ? hi : en;
}
