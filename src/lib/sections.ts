import { presentItems } from './todo';

/**
 * Which optional sections actually have content to show.
 *
 * The testimonials section removes itself when there are no real quotes yet.
 * Nav and footer have to agree with it, or the site ships links to an anchor
 * that is not on the page — a dead link is worse than a missing one.
 *
 * When the quotes arrive in `content.ts`, the links come back on their own.
 *
 * Every function here takes the testimonials array itself rather than the
 * whole content bundle: which quotes are usable is the only fact any of them
 * needs, and it works the same whether it is called with a bundle's
 * `c.testimonials` or (until Task 3 wires the client components through
 * `LocaleProvider`) the compat `testimonials` import.
 */

/**
 * The fields that make a quote usable. A name is required; a city is not,
 * because people send a testimonial without mentioning where they live.
 *
 * Exported so the Testimonials section and this module cannot drift: if these
 * disagree, the nav links to an anchor the page did not render.
 */
export const TESTIMONIAL_REQUIRED_FIELDS = ['quote', 'name'] as const;

type QuoteFields = { quote: string; name: string };

export function usableTestimonials<T extends QuoteFields>(testimonials: readonly T[]): T[] {
  return presentItems(testimonials, TESTIMONIAL_REQUIRED_FIELDS as readonly (keyof T)[]);
}

export function hasTestimonials(testimonials: readonly QuoteFields[]): boolean {
  return usableTestimonials(testimonials).length > 0;
}

export type NavLink = { label: string; href: string };

/**
 * Drops links pointing at a section that is not currently rendered.
 *
 * Takes the widened shape rather than a generic: `content.ts` declares its
 * link arrays `as const`, so each one is a distinct tuple type and a generic
 * has nothing to unify across them.
 */
export function liveLinks(links: readonly NavLink[], testimonials: readonly QuoteFields[]): NavLink[] {
  const has = hasTestimonials(testimonials);
  return links.filter((link) => {
    if (!has && link.href.includes('#testimonials')) return false;
    return true;
  });
}
