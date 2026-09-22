/**
 * TODO markers in `content.ts` are facts nobody has supplied yet.
 *
 * DESIGN.md is explicit: do not invent a value, and leave the marker in place so
 * a grep for the marker finds them all before launch. So the markers stay in
 * the source verbatim — they are filtered at render instead, here, in one place.
 *
 * A visitor never sees a placeholder; a developer never loses one.
 */

const MARKER = /^\s*TODO\(/;

/** True when a string is an unsupplied fact rather than real copy. */
export function isTodo(value: string | null | undefined): boolean {
  return typeof value === 'string' && MARKER.test(value);
}

/** The string if it is real copy, otherwise null. */
export function present(value: string | null | undefined): string | null {
  if (value == null || isTodo(value)) return null;
  return value;
}

/** Drops unsupplied entries from a list. */
export function presentAll(values: readonly string[]): string[] {
  return values.filter((v) => !isTodo(v));
}

/**
 * Drops objects any of whose named fields is still a TODO.
 *
 * Used for testimonials (a quote with no name is not usable) and for
 * teaching tracks.
 */
export function presentItems<T extends object>(
  items: readonly T[],
  fields: readonly (keyof T)[],
): T[] {
  return items.filter((item) =>
    fields.every((field) => {
      const value = item[field];
      return typeof value !== 'string' || !isTodo(value);
    }),
  );
}

/**
 * An href that is still a TODO must never reach the DOM as a literal marker.
 * Callers render plain text when this returns null.
 */
export function presentHref(href: string | null | undefined): string | null {
  return present(href);
}
