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
 * These re-exports are the English bundle, kept so existing imports
 * (`import { services } from '@/content'`) keep working unchanged. Use
 * `getContent(locale)` for code that must work in either language.
 */

export * from './en/site';
export * from './en/navigation';
export * from './en/hero';
export * from './en/services';
export * from './en/booking';
export * from './en/picker';
export * from './en/about';
export * from './en/teaching';
export * from './en/testimonials';
export * from './en/faq';
export * from './en/contact';
export * from './en/privacy';
export * from './en/policies';

export * from './locale';

import { en } from './en';
import { hi } from './hi';
import type { Locale, Content } from './locale';

/** The full content bundle for one language. */
export function getContent(locale: Locale): Content {
  return locale === 'hi' ? hi : en;
}
