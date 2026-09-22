import { testimonials } from '@/content';
import { presentItems } from './todo';

/**
 * Which optional sections actually have content to show.
 *
 * The testimonials section removes itself when there are no real quotes yet.
 * Nav and footer have to agree with it, or the site ships links to an anchor
 * that is not on the page — a dead link is worse than a missing one.
 *
 * When the quotes arrive in `content.ts`, the links come back on their own.
 */
/**
 * The fields that make a quote usable. A name is required; a city is not,
 * because people send a testimonial without mentioning where they live.
 *
 * Exported so the Testimonials section and this module cannot drift: if these
 * disagree, the nav links to an anchor the page did not render.
 */
export const TESTIMONIAL_REQUIRED_FIELDS = ['quote', 'name'] as const;

export const usableTestimonials = presentItems(testimonials, TESTIMONIAL_REQUIRED_FIELDS);

export const hasTestimonials = usableTestimonials.length > 0;

export type NavLink = { label: string; href: string };

/**
 * Drops links pointing at a section that is not currently rendered.
 *
 * Takes the widened shape rather than a generic: `content.ts` declares its
 * link arrays `as const`, so each one is a distinct tuple type and a generic
 * has nothing to unify across them.
 */
export function liveLinks(links: readonly NavLink[]): NavLink[] {
  return links.filter((link) => {
    if (!hasTestimonials && link.href.includes('#testimonials')) return false;
    return true;
  });
}
